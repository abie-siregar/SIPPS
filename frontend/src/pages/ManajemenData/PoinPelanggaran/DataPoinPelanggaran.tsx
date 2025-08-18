import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../api/axios";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import { PencilIcon } from "../../../icons";

interface Pelanggaran {
  id_poin: number;
  jenis_penilaian: string;
  bobot: number;
  jenis_pelanggaran: string;
  is_active: boolean;
}

const PoinPelanggaran = () => {
  const [data, setData] = useState<Pelanggaran[]>([]);
  const [filteredData, setFilteredData] = useState<Pelanggaran[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJenisPelanggaran, setFilterJenisPelanggaran] = useState("Semua");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Pelanggaran;
    direction: "asc" | "desc";
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  const handleEdit = (row: Pelanggaran) => {
    navigate(`/data-poin-pelanggaran/edit/${row.id_poin}`);
  };

  useEffect(() => {
    const fetchPelanggaran = async () => {
      try {
        const res = await axios.get("/poin-pelanggaran");
        console.log("DATA DARI API :", res.data);
        setData(res.data.data);
        setFilteredData(res.data.data);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPelanggaran();
  }, []);

  useEffect(() => {
    let result = [...data];

    if (filterJenisPelanggaran !== "Semua") {
      result = result.filter(
        (item) => item.jenis_pelanggaran === filterJenisPelanggaran
      );
    }

    if (searchTerm) {
      result = result.filter((item) =>
        item.jenis_penilaian.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredData(result);
  }, [searchTerm, filterJenisPelanggaran, sortConfig, data]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterJenisPelanggaran]);

  const requestSort = (key: keyof Pelanggaran) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <>
      <PageMeta
        title="Data Pelanggaran | Dashboard SMKN 1 Batam"
        description="Halaman menampilkan tabel data pelanggaran siswa"
      />
      <PageBreadcrumb pageTitle="Data Poin Pelanggaran" />
      <div className="space-y-6">
        <ComponentCard title="Tabel Poin Pelanggaran">
          {/* Tombol Tambah + Filter & Search */}
          <div className="flex flex-col md:flex-row gap-3 mb-6 items-start md:items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/data-poin-pelanggaran/tambah")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
              >
                + Tambah
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
              <input
                type="text"
                placeholder="Cari jenis penilaian..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-white/[0.03] dark:border-white/[0.05] dark:text-white/90"
              />
              <select
                value={filterJenisPelanggaran}
                onChange={(e) => setFilterJenisPelanggaran(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-white/[0.03] dark:border-white/[0.05] dark:text-white/90"
              >
                <option value="Semua">Semua Jenis Pelanggaran</option>
                <option value="Kelakuan">Kelakuan</option>
                <option value="Kerajinan">Kerajinan</option>
                <option value="Kerapian">Kerapian</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <p className="text-center dark:text-gray-400">Loading...</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-100 dark:bg-white/[0.05] border-b border-gray-200 dark:border-white/[0.05]">
                    <tr>
                      <th
                        onClick={() => requestSort("id_poin")}
                        className="px-5 py-3 cursor-pointer text-theme-xs dark:text-gray-400"
                      >
                        No{" "}
                        {sortConfig?.key === "id_poin"
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th className="px-5 py-3 text-theme-xs dark:text-gray-400">
                        Jenis Penilaian
                      </th>
                      <th
                        onClick={() => requestSort("bobot")}
                        className="px-5 py-3 cursor-pointer text-theme-xs dark:text-gray-400"
                      >
                        Bobot{" "}
                        {sortConfig?.key === "bobot"
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        onClick={() => requestSort("jenis_pelanggaran")}
                        className="px-5 py-3 cursor-pointer text-theme-xs dark:text-gray-400"
                      >
                        Jenis Pelanggaran{" "}
                        {sortConfig?.key === "jenis_pelanggaran"
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th className="px-5 py-3 text-theme-xs dark:text-gray-400 text-center">
                        Aktif
                      </th>
                      <th className="px-5 py-3 text-theme-xs dark:text-gray-400 text-center">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {currentItems.map((row, index) => (
                      <tr
                        key={row.id_poin}
                        className="hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-4 text-center text-gray-700 dark:text-white/90">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-5 py-4 text-gray-700 dark:text-white/90">
                          {row.jenis_penilaian}
                        </td>
                        <td className="px-5 py-4 text-center text-gray-700 dark:text-white/90">
                          {row.bobot}
                        </td>
                        <td className="px-5 py-4 text-center text-gray-700 dark:text-white/90">
                          {row.jenis_pelanggaran}
                        </td>
                        <td className="px-5 py-4 text-center text-gray-700 dark:text-white/90">
                          {row.is_active ? "Aktif" : "Tidak Aktif"}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <Button
                            size="sm"
                            variant="primary"
                            startIcon={<PencilIcon className="size-4" />}
                            onClick={() => handleEdit(row)}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination numerik */}
              <div className="flex justify-between items-center mt-4 px-2 flex-wrap gap-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Halaman {currentPage} dari {totalPages}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="px-3 py-1 border rounded text-sm dark:border-white/20 disabled:opacity-50"
                  >
                    ←
                  </button>
                  {generatePageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded text-sm ${
                        currentPage === page
                          ? "bg-blue-600 text-white border-blue-600"
                          : "text-gray-700 dark:text-white dark:border-white/20"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="px-3 py-1 border rounded text-sm dark:border-white/20 disabled:opacity-50"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
};

export default PoinPelanggaran;
