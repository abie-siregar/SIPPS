import { useEffect, useState } from "react";
import axios from "../../api/axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

interface Rombel {
  id: number;
  wali_kelas: string;
  rombel: string;
  tingkat: string;
  l: number;
  p: number;
  jurusan: string;
}

const DropdownCheckbox = ({
  label,
  options,
  selectedOptions,
  onChange,
}: {
  label: string;
  options: string[];
  selectedOptions: string[];
  onChange: (updated: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);

  const toggleOption = (value: string) => {
    if (selectedOptions.includes(value)) {
      onChange(selectedOptions.filter((v) => v !== value));
    } else {
      onChange([...selectedOptions, value]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-2 border rounded-lg text-sm dark:bg-white/[0.03] dark:text-white"
      >
        {selectedOptions.length > 0
          ? `${label}: ${selectedOptions.length} dipilih`
          : `Pilih ${label}`}
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto bg-white dark:bg-gray-700 border rounded shadow-lg p-2 space-y-1">
          {options.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-white"
            >
              <input
                type="checkbox"
                checked={selectedOptions.includes(option)}
                onChange={() => toggleOption(option)}
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const DataRombel = () => {
  const [data, setData] = useState<Rombel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [filterTingkat, setFilterTingkat] = useState<string[]>([]);
  const [filterJurusan, setFilterJurusan] = useState<string[]>([]);
  const [formTingkat, setFormTingkat] = useState<string[]>([]);
  const [formJurusan, setFormJurusan] = useState<string[]>([]);

  const [showFilterModal, setShowFilterModal] = useState(false);

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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {data.map((row, index) => (
                      <tr
                        key={row.id}
                        className="hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-4 text-center text-gray-700 dark:text-white/90">
                          {index + 1}
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
                          {row.l}
                        </td>
                        <td className="px-5 py-4 text-center text-gray-700 dark:text-white/90">
                          {row.p}
                        </td>
                        <td className="px-5 py-4 text-gray-700 dark:text-white/90">
                          {row.jurusan}
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

      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[90%] md:w-[400px] shadow-xl border dark:border-white/10">
            <h2 className="text-lg font-semibold mb-6">Filter Data</h2>
            <div className="space-y-4">
              <DropdownCheckbox
                label="Tingkat"
                options={[...new Set(data.map((d) => d.tingkat))]}
                selectedOptions={formTingkat}
                onChange={setFormTingkat}
              />
              <DropdownCheckbox
                label="Jurusan"
                options={[...new Set(data.map((d) => d.jurusan))]}
                selectedOptions={formJurusan}
                onChange={setFormJurusan}
              />
            </div>
            <div className="flex justify-end gap-3 pt-6">
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 text-sm"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setFilterTingkat(formTingkat);
                  setFilterJurusan(formJurusan);
                  setShowFilterModal(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DataRombel;
