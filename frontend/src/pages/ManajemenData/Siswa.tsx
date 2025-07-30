import { useEffect, useState } from "react";
import axios from "../../api/axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

interface Siswa {
  id: number;
  nama: string;
  alamat: string;
  nipd: string;
  nisn: number;
  jk: string;
  hp: number;
  email: string;
  rombel: string;
}

const PD = () => {
  const [data, setData] = useState<Siswa[]>([]);
  const [filteredData, setFilteredData] = useState<Siswa[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRombel, setFilterRombel] = useState("Semua");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Siswa;
    direction: "asc" | "desc";
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSiswa = async () => {
      try {
        const res = await axios.get("/siswa");
        setData(res.data);
        setFilteredData(res.data);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSiswa();
  }, []);

  useEffect(() => {
    let result = [...data];

    if (filterRombel !== "Semua") {
      result = result.filter((item) => item.rombel === filterRombel);
    }

    if (searchTerm) {
      result = result.filter((item) =>
        item.nama.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [searchTerm, filterRombel, sortConfig, data]);

  const requestSort = (key: keyof Siswa) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <>
      <PageMeta
        title="Data Peserta Didik | Dashboard SMKN 1 Batam"
        description="Halaman menampilkan tabel data Peserta Didik"
      />
      <PageBreadcrumb pageTitle="Data Peserta Didik" />
      <div className="space-y-6">
        <ComponentCard title="Tabel Data Peserta Didik">
          {/* Search & Filter */}
          {/* Awal Baris Kode Search */}
          <div className="flex flex-col md:flex-row gap-3 mb-6 items-start md:items-center justify-between">
            <input
              type="text"
              placeholder="Cari Siswa berdasarkan Nama"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-1/4 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-white/[0.03] dark:border-white/[0.05] dark:text-white/90"
            />
            {/* Akhir Baris Kode Search */}
            {/* Awal Baris Kode Filter */}
            <select
              value={filterRombel}
              onChange={(e) => setFilterRombel(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-white/[0.03] dark:border-white/[0.05] dark:text-white/90"
            >
              <option value="Semua">Semua Rombel</option>
            </select>
            {/* Akhir Baris Kode Filter */}
          </div>

          {/* Table */}
          {/* Awal Baris Kode Tabel */}
          {loading ? (
            <p className="text-center dark:text-gray-400">Loading...</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead className="text-center bg-gray-100 dark:bg-white/[0.05] border-b border-gray-200 dark:border-white/[0.05]">
                    <tr>
                      <th
                        onClick={() => requestSort("id")}
                        className="px-5 py-3 cursor-pointer text-theme-xs dark:text-gray-400"
                      >
                        No{" "}
                        {sortConfig?.key === "id"
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th className="px-5 py-3 text-theme-xs dark:text-gray-400">
                        Nama{" "}
                        {sortConfig?.key === "nama"
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th className="px-5 py-3 text-theme-xs dark:text-gray-400">
                        NIPD{" "}
                        {sortConfig?.key === "nipd"
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th className="px-5 py-3 text-theme-xs dark:text-gray-400">
                        NISN{" "}
                        {sortConfig?.key === "nisn"
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th className="px-5 py-3 text-theme-xs dark:text-gray-400">
                        Jenis Kelamin{" "}
                        {sortConfig?.key === "jk"
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th className="px-5 py-3 text-theme-xs dark:text-gray-400">
                        No Handphone
                      </th>
                      <th className="px-5 py-3 text-theme-xs dark:text-gray-400">
                        E-Mail
                      </th>
                      <th className="px-5 py-3 text-theme-xs dark:text-gray-400">
                        Rombongan Belajar{" "}
                        {sortConfig?.key === "rombel"
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {filteredData.map((row, index) => (
                      <tr
                        key={row.id}
                        className="hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-4 text-center text-gray-700 dark:text-white/90">
                          {index + 1}
                        </td>
                        <td className="px-5 py-4 text-gray-700 dark:text-white/90">
                          {row.nama}
                        </td>

                        <td className="px-5 py-4 text-gray-700 dark:text-white/90">
                          {row.nipd}
                        </td>
                        <td className="px-5 py-4 text-gray-700 dark:text-white/90">
                          {row.nisn}
                        </td>
                        <td className="px-5 py-4 text-center text-gray-700 dark:text-white/90">
                          {row.jk}
                        </td>
                        <td className="px-5 py-4 text-center text-gray-700 dark:text-white/90">
                          {row.hp}
                        </td>
                        <td className="px-5 py-4 text-gray-700 dark:text-white/90">
                          {row.email}
                        </td>
                        <td className="px-5 py-4 text-gray-700 dark:text-white/90">
                          {row.rombel}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* Akhir Baris Kode Table */}
        </ComponentCard>
      </div>
    </>
  );
};

export default PD;
