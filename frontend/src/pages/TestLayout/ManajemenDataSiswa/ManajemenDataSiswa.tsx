import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import axios from "../../../api/axios";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import DataTable, { Column } from "../../../components/ui/table/DataTable";
import FilterSiswaModal from "../../ManajemenData/Siswa/FilterSiswaModal";
import SiswaDetailModal, { Siswa } from "./SiswaDetailModal";

const ManajemenDataSiswa = () => {
  const navigate = useNavigate(); // 2. Inisialisasi hook navigate
  const [data, setData] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedRombel, setSelectedRombel] = useState<string[]>([]);
  const [selectedTingkat, setSelectedTingkat] = useState<string[]>([]);
  const [selectedJurusan, setSelectedJurusan] = useState<string[]>([]);

  // State untuk mengontrol Pop-Up Detail
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);

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
      if (selectedRombel.length > 0 && !selectedRombel.includes(row.rombel))
        return false;
      if (selectedTingkat.length > 0 && !selectedTingkat.includes(row.tingkat))
        return false;
      if (selectedJurusan.length > 0 && !selectedJurusan.includes(row.jurusan))
        return false;
      return true;
    });
  }, [processedData, selectedRombel, selectedTingkat, selectedJurusan]);

  const filterValues = useMemo(
    () => ({ selectedRombel, selectedTingkat, selectedJurusan }),
    [selectedRombel, selectedTingkat, selectedJurusan],
  );

  const handleApplyFilters = (filters: typeof filterValues) => {
    setSelectedRombel(filters.selectedRombel);
    setSelectedTingkat(filters.selectedTingkat);
    setSelectedJurusan(filters.selectedJurusan);
  };

  // Handler untuk membuka detail modal
  const handleOpenDetail = (siswa: Siswa) => {
    setSelectedSiswa(siswa);
    setShowDetailModal(true);
  };

  // Handler untuk navigasi ke halaman DataSiswa penuh
  const handleNavigateToDetail = (siswa: Siswa) => {
    const targetId = siswa.id_siswa || siswa.id;
    if (targetId) {
      navigate(`/data-siswa/${targetId}`);
    }
  };

  const columns: Column<Siswa>[] = [
    {
      header: "No",
      accessor: "nama",
      render: (_row, rowIndex) => (rowIndex ?? 0) + 1,
      className: "w-12",
    },
    { header: "Nama", accessor: "nama", className: "w-36" },
    { header: "NISN", accessor: "nisn", className: "w-36" },
    { header: "Kelas", accessor: "rombel", className: "w-36" },
    {
      header: "Aksi",
      accessor: "nama",
      className: "w-48", // 3. Menyesuaikan lebar kolom aksi agar memuat 2 tombol
      render: (row) => (
        <div className="flex gap-2">
          {/* Tombol Pop-up Detail (Lama) */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenDetail(row)}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Detail
          </Button>

          {/* Tombol Navigasi Halaman Penuh (Baru) */}
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleNavigateToDetail(row)}
            className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950/30"
          >
            View Detail
          </Button>
        </div>
      ),
    },
  ];

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

      {/* Komponen Detail Modal */}
      <SiswaDetailModal
        show={showDetailModal}
        siswa={selectedSiswa}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedSiswa(null);
        }}
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

export default ManajemenDataSiswa;
