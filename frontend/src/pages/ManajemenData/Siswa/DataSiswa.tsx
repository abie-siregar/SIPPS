import { useEffect, useState, useMemo } from "react";
import axios from "../../../api/axios";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import DataTable, { Column } from "../../../components/ui/table/DataTable";
import Button from "../../../components/ui/button/Button";
import FilterSiswaModal from "./FilterSiswaModal";

export interface Siswa {
  nama: string;
  nisn: string;
  alamat: string;
  no_telp: string;
  email: string;
  agama: string;
  tingkat: string;
  rombel: string;
  walikelas: string;
  jurusan: string;
}

const DataSiswa = () => {
  const [data, setData] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedRombel, setSelectedRombel] = useState<string[]>([]);
  const [selectedTingkat, setSelectedTingkat] = useState<string[]>([]);
  const [selectedJurusan, setSelectedJurusan] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/siswa");
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
      nama: row.nama ?? "-",
      nisn: row.nisn ?? "-",
      rombel: row.rombel ?? "-",
      tingkat: row.tingkat ?? "-",
      jurusan: row.jurusan ?? "-",
      walikelas: row.walikelas ?? "-",
      email: row.email ?? "-",
      no_telp: row.no_telp ?? "-",
      alamat: row.alamat ?? "-",
      agama: row.agama ?? "-",
    }));
  }, [data]);

  // Extract unique filter options dynamically from processed data
  const availableRombel = useMemo(() => {
    const list = processedData
      .map((item) => item.rombel)
      .filter((rb) => rb && rb !== "-");
    return Array.from(new Set(list)).sort();
  }, [processedData]);

  const availableTingkat = useMemo(() => {
    const list = processedData
      .map((item) => item.tingkat)
      .filter((tk) => tk && tk !== "-");
    return Array.from(new Set(list)).sort();
  }, [processedData]);

  const availableJurusan = useMemo(() => {
    const list = processedData
      .map((item) => item.jurusan)
      .filter((jr) => jr && jr !== "-");
    return Array.from(new Set(list)).sort();
  }, [processedData]);

  // Compute local filteredData
  const filteredData = useMemo(() => {
    return processedData.filter((row) => {
      // 1. Rombel filter
      if (
        selectedRombel.length > 0 &&
        !selectedRombel.includes(row.rombel)
      ) {
        return false;
      }
      // 2. Tingkat filter
      if (
        selectedTingkat.length > 0 &&
        !selectedTingkat.includes(row.tingkat)
      ) {
        return false;
      }
      // 3. Jurusan filter
      if (
        selectedJurusan.length > 0 &&
        !selectedJurusan.includes(row.jurusan)
      ) {
        return false;
      }
      return true;
    });
  }, [processedData, selectedRombel, selectedTingkat, selectedJurusan]);

  const filterValues = useMemo(
    () => ({
      selectedRombel,
      selectedTingkat,
      selectedJurusan,
    }),
    [selectedRombel, selectedTingkat, selectedJurusan]
  );

  const handleApplyFilters = (filters: typeof filterValues) => {
    setSelectedRombel(filters.selectedRombel);
    setSelectedTingkat(filters.selectedTingkat);
    setSelectedJurusan(filters.selectedJurusan);
  };

  const columns: Column<Siswa>[] = [
    {
      header: "No",
      accessor: "nama",
      render: (_row, rowIndex) => (rowIndex ?? 0) + 1,
      className: "text-center w-16",
    },
    { header: "Nama", accessor: "nama", className: "w-44" },
    { header: "NISN", accessor: "nisn", className: "text-center w-28" },
    { header: "Rombel", accessor: "rombel", className: "text-center w-28" },
    { header: "Tingkat", accessor: "tingkat", className: "text-center w-20" },
    { header: "Jurusan", accessor: "jurusan", className: "w-40" },
    { header: "Wali Kelas", accessor: "walikelas", className: "w-44" },
    { header: "Email", accessor: "email", className: "w-48 truncate" },
    { header: "No Telp", accessor: "no_telp", className: "text-center w-36" },
  ];

  // Calculate active filters badge count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedRombel.length > 0) count++;
    if (selectedTingkat.length > 0) count++;
    if (selectedJurusan.length > 0) count++;
    return count;
  }, [selectedRombel, selectedTingkat, selectedJurusan]);

  return (
    <>
      <PageMeta
        title="Data Siswa | Dashboard SMKN 1 Batam"
        description="Halaman menampilkan tabel data siswa"
      />
      <PageBreadcrumb pageTitle="Data Siswa" />

      {/* Filter Modal */}
      <FilterSiswaModal
        show={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        initialValues={filterValues}
        availableRombel={availableRombel}
        availableTingkat={availableTingkat}
        availableJurusan={availableJurusan}
      />

      <div className="space-y-6">
        <ComponentCard title="Tabel Data Siswa">
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

export default DataSiswa;
