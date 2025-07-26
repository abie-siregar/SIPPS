import { useEffect, useState } from "react";
import axios from "../../api/axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

interface Pelanggaran {
  id: number;
  jenis_pelanggaran: string;
  bobot: number;
  jenis: string;
}

const PoinPelanggaran = () => {
  const [data, setData] = useState<Pelanggaran[]>([]);
  const [filteredData, setFilteredData] = useState<Pelanggaran[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Pelanggaran;
    direction: "asc" | "desc";
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPelanggaran = async () => {
      try {
        const res = await axios.get("/pelanggaran");
        setData(res.data);
        setFilteredData(res.data);
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

    if (filterJenis !== "Semua") {
      result = result.filter((item) => item.jenis === filterJenis);
    }

    if (searchTerm) {
      result = result.filter((item) =>
        item.jenis_pelanggaran.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [searchTerm, filterJenis, sortConfig, data]);

  const requestSort = (key: keyof Pelanggaran) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
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
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-3 mb-6 items-start md:items-center justify-between">
            <input
              type="text"
              placeholder="Cari jenis pelanggaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-white/[0.03] dark:border-white/[0.05] dark:text-white/90"
            />
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-white/[0.03] dark:border-white/[0.05] dark:text-white/90"
            >
              <option value="Semua">Semua Jenis</option>
              <option value="Kelakuan">Kelakuan</option>
              <option value="Kerajinan">Kerajinan</option>
              <option value="Kerapian">Kerapian</option>
            </select>
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
                        Jenis Pelanggaran
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
                        onClick={() => requestSort("jenis")}
                        className="px-5 py-3 cursor-pointer text-theme-xs dark:text-gray-400"
                      >
                        Jenis{" "}
                        {sortConfig?.key === "jenis"
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
                          {row.jenis_pelanggaran}
                        </td>
                        <td className="px-5 py-4 text-center text-gray-700 dark:text-white/90">
                          {row.bobot}
                        </td>
                        <td className="px-5 py-4 text-center text-gray-700 dark:text-white/90">
                          {row.jenis}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
};

export default PoinPelanggaran;
