import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Tambahkan ini
import axios from "../../../api/axios";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import { PencilIcon } from "../../../icons";

interface Rombel {
  id_rombel: number;
  wali_kelas: string;
  rombel: string;
  tingkat: string;
  jmlh_l: number;
  jmlh_p: number;
  jurusan: string;
}

// ... import tetap sama

const DataRombel = () => {
  const [data, setData] = useState<Rombel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [filterTingkat, setFilterTingkat] = useState<string[]>([]);
  const [filterJurusan, setFilterJurusan] = useState<string[]>([]);
  const [formTingkat, setFormTingkat] = useState<string[]>([]);
  const [formJurusan, setFormJurusan] = useState<string[]>([]);

  const [showFilterModal, setShowFilterModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/rombel", {
        search: searchTerm,
        tingkat: filterTingkat,
        jurusan: filterJurusan,
      });
      setData(res.data.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterTingkat, filterJurusan, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterTingkat, filterJurusan]);

  const handleEdit = (row: Rombel) => {
    navigate(`/data-rombel/edit/${row.id_rombel}`);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

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
        title="Data Rombel | Dashboard SMKN 1 Batam"
        description="Halaman menampilkan tabel data rombel"
      />
      <PageBreadcrumb pageTitle="Data Rombel" />
      <div className="space-y-6">
        <ComponentCard title="Tabel Rombel">
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Cari wali kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg w-1/2"
            />
            <div className="flex gap-2">
              {(filterTingkat.length > 0 || filterJurusan.length > 0) && (
                <button
                  onClick={() => {
                    setFilterTingkat([]);
                    setFilterJurusan([]);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                  Reset
                </button>
              )}
              <button
                onClick={() => {
                  setFormTingkat(filterTingkat);
                  setFormJurusan(filterJurusan);
                  setShowFilterModal(true);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Filter
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-center dark:text-gray-400">Loading...</p>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-100 dark:bg-white/[0.05] border-b border-gray-200 dark:border-white/[0.05]">
                      <tr>
                        <th className="px-5 py-3 text-theme-xs dark:text-gray-400">
                          No
                        </th>
                        <th className="px-5 py-3 text-theme-xs dark:text-gray-400">
                          Wali Kelas
                        </th>
                        <th className="px-5 py-3 text-theme-xs dark:text-gray-400">
                          Rombel
                        </th>
                        <th className="px-5 py-3 text-theme-xs dark:text-gray-400">
                          Tingkat
                        </th>
                        <th className="px-5 py-3 text-theme-xs dark:text-gray-400">
                          L
                        </th>
                        <th className="px-5 py-3 text-theme-xs dark:text-gray-400">
                          P
                        </th>
                        <th className="px-5 py-3 text-theme-xs dark:text-gray-400">
                          Jurusan
                        </th>
                        <th className="px-5 py-3 text-theme-xs dark:text-gray-400">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {currentItems.map((row, index) => (
                        <tr
                          key={row.id_rombel}
                          className="hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                        >
                          <td className="px-5 py-4 text-center text-gray-700 dark:text-white/90">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="px-5 py-4 text-gray-700 dark:text-white/90">
                            {row.wali_kelas}
                          </td>
                          <td className="px-5 py-4 text-gray-700 dark:text-white/90">
                            {row.rombel}
                          </td>
                          <td className="px-5 py-4 text-center text-gray-700 dark:text-white/90">
                            {row.tingkat}
                          </td>
                          <td className="px-5 py-4 text-center text-gray-700 dark:text-white/90">
                            {row.jmlh_l}
                          </td>
                          <td className="px-5 py-4 text-center text-gray-700 dark:text-white/90">
                            {row.jmlh_p}
                          </td>
                          <td className="px-5 py-4 text-gray-700 dark:text-white/90">
                            {row.jurusan}
                          </td>
                          <td className="px-5 py-4 text-center text-gray-700 dark:text-white/90 space-x-2">
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
            </>
          )}
        </ComponentCard>
      </div>
    </>
  );
};

export default DataRombel;
