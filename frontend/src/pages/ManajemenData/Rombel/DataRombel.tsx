import { useEffect, useState, useMemo } from "react";
import axios from "../../../api/axios";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import DataTable, { Column } from "../../../components/ui/table/DataTable";
import Button from "../../../components/ui/button/Button";
import FilterRombelModal from "./FilterRombelModal";

export interface Rombel {
  rombel: string;
  tingkat: string;
  jurusan: string;
  walikelas: string;
  jumlah_siswa: number;
}

const DataRombel = () => {
  const [data, setData] = useState<Rombel[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTingkat, setSelectedTingkat] = useState<string[]>([]);
  const [selectedJurusan, setSelectedJurusan] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/rombel");
      const fetchedData = res.data.data || res.data || [];
      setData(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const processedData = useMemo(() => {
    return data.map((row) => ({
      ...row,
      walikelas: row.walikelas ?? "-",
      rombel: row.rombel ?? "-",
      tingkat: row.tingkat ?? "-",
      jurusan: row.jurusan ?? "-",
      jumlah_siswa: row.jumlah_siswa ?? 0,
    }));
  }, [data]);

  // Extract unique tingkat options dynamically
  const availableTingkat = useMemo(() => {
    const list = processedData
      .map((item) => item.tingkat)
      .filter((tk) => tk && tk !== "-");
    return Array.from(new Set(list)).sort();
  }, [processedData]);

  // Extract unique jurusan options dynamically
  const availableJurusan = useMemo(() => {
    const list = processedData
      .map((item) => item.jurusan)
      .filter((jr) => jr && jr !== "-");
    return Array.from(new Set(list)).sort();
  }, [processedData]);

  // Compute local filteredData
  const filteredData = useMemo(() => {
    return processedData.filter((row) => {
      // 1. Tingkat filter (multiple select)
      if (
        selectedTingkat.length > 0 &&
        !selectedTingkat.includes(row.tingkat)
      ) {
        return false;
      }
      // 2. Jurusan filter (multiple select)
      if (
        selectedJurusan.length > 0 &&
        !selectedJurusan.includes(row.jurusan)
      ) {
        return false;
      }
      return true;
    });
  }, [processedData, selectedTingkat, selectedJurusan]);

  const filterValues = useMemo(
    () => ({
      selectedTingkat,
      selectedJurusan,
    }),
    [selectedTingkat, selectedJurusan]
  );

  const handleApplyFilters = (filters: typeof filterValues) => {
    setSelectedTingkat(filters.selectedTingkat);
    setSelectedJurusan(filters.selectedJurusan);
  };

  const columns: Column<Rombel>[] = [
    {
      header: "No",
      accessor: "rombel",
      render: (_row, rowIndex) => (rowIndex ?? 0) + 1,
      className: "text-center w-16",
    },
    { header: "Wali Kelas", accessor: "walikelas" },
    { header: "Rombel", accessor: "rombel" },
    { header: "Tingkat", accessor: "tingkat", className: "text-center w-24" },
    { header: "Jurusan", accessor: "jurusan" },
    { header: "Jumlah Siswa", accessor: "jumlah_siswa", className: "text-center w-32" },
  ];

  // Calculate active filters badge count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedTingkat.length > 0) count++;
    if (selectedJurusan.length > 0) count++;
    return count;
  }, [selectedTingkat, selectedJurusan]);

  return (
    <>
      <PageMeta
        title="Data Rombongan Belajar | Dashboard SMKN 1 Batam"
        description="Halaman menampilkan tabel data rombel"
      />
      <PageBreadcrumb pageTitle="Data Rombongan Belajar" />

      {/* Filter Modal */}
      <FilterRombelModal
        show={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        initialValues={filterValues}
        availableTingkat={availableTingkat}
        availableJurusan={availableJurusan}
      />

      <div className="space-y-6">
        <ComponentCard title="Tabel Rombongan Belajar">
          {loading ? (
            <p className="text-center dark:text-gray-400">Loading...</p>
          ) : (
            <DataTable
              columns={columns}
              data={filteredData}
              searchable
              paginated
              itemsPerPageOptions={[5, 10, 20, 50]}
              defaultItemsPerPage={10}
              extraActions={
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={activeFiltersCount > 0 ? "primary" : "outline"}
                    onClick={() => setShowFilterModal(true)}
                    className="relative"
                  >
                    🔍 Filter
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </div>
              }
            />
          )}
        </ComponentCard>
      </div>
    </>
  );
};

export default DataRombel;
