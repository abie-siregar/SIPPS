import { useEffect, useState } from "react";
import axios from "../../api/axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

interface PTK {
  id: number;
  nama: string;
  alamat: string;
  jenis_ptk: string;
  tugas_tambahan: string;
  hp: number;
  email: string;
}

const PTK = () => {
  const [data, setData] = useState<PTK[]>([]);
  const [filteredData, setFilteredData] = useState<PTK[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTugas, setFilterTugas] = useState("Semua");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof PTK;
    direction: "asc" | "desc";
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPTK = async () => {
      try {
        const res = await axios.get("/ptk");
        setData(res.data);
        setFilteredData(res.data);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPTK();
  }, []);

  useEffect(() => {
    let result = [...data];

    if (filterTugas !== "Semua") {
      result = result.filter((item) => item.tugas_tambahan === filterTugas);
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
  }, [searchTerm, filterTugas, sortConfig, data]);

  const requestSort = (key: keyof PTK) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <>
      <PageMeta
        title="Data Pendidik dan Tenaga Kependidikan | Dashboard SMKN 1 Batam"
        description="Halaman menampilkan tabel data Pendidik dan Tenaga Kependidikan"
      />
      <PageBreadcrumb pageTitle="Data Pendidik dan Tenaga Kependidikan" />
      <div className="space-y-6">
        <ComponentCard title="Tabel Data Pendidik dan Tenaga Kependidikan">
          {/* Search & Filter */}
          {/* Awal Baris Kode Search */}
          <div className="flex flex-col md:flex-row gap-3 mb-6 items-start md:items-center justify-between">
            <input
              type="text"
              placeholder="Cari PTK"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-1/4 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-white/[0.03] dark:border-white/[0.05] dark:text-white/90"
            />
            {/* Akhir Baris Kode Search */}
            {/* Awal Baris Kode Filter */}
            <select
              value={filterTugas}
              onChange={(e) => setFilterTugas(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-white/[0.03] dark:border-white/[0.05] dark:text-white/90"
            >
              <option value="Semua">Semua PTK</option>
              <option value="Wakil Kepala Sekolah">Wakil Kepala Sekolah</option>
              <option value="Wali Kelas">Wali Kelas</option>
              <option value="Guru BK">Guru BK</option>
              <option value="Koordinator P5">Koordinator P5</option>
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
                        Jenis PTK{" "}
                        {sortConfig?.key === "jenis_ptk"
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th className="px-5 py-3 text-theme-xs dark:text-gray-400">
                        Tugas Tambahan{" "}
                        {sortConfig?.key === "tugas_tambahan"
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
                          {row.jenis_ptk}
                        </td>
                        <td className="px-5 py-4 text-gray-700 dark:text-white/90">
                          {row.tugas_tambahan}
                        </td>
                        <td className="px-5 py-4 text-center text-gray-700 dark:text-white/90">
                          {row.hp}
                        </td>
                        <td className="px-5 py-4 text-gray-700 dark:text-white/90">
                          {row.email}
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

export default PTK;
