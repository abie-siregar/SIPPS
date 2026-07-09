import { useEffect, useState, useMemo } from "react";
import axios from "../../api/axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { PencilIcon, TrashBinIcon } from "../../icons";
import DataTable, { Column } from "../../components/ui/table/DataTable";

// Data Plotting BK
import FilterPlottingBKModal from "../ManajemenData/PlottingBK/FilterPlottingBKModal";
import TambahDataPlottingBK from "../ManajemenData/PlottingBK/TambahDataPlottingBK";
import EditDataPlottingBK from "../ManajemenData/PlottingBK/EditDataPlottingBK";

// Data Rombel
import FilterRombelModal from "../ManajemenData/Rombel/FilterRombelModal";

import Toast from "../../components/ui/alert/Toast";
import ConfirmDialog from "../../components/ui/modal/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";

export interface Rombel {
  rombel: string;
  tingkat: string;
  jurusan: string;
  walikelas: string;
  jumlah_siswa: number;
}

export interface PlottingBK {
  id_plotting: number;
  id_ptk_bk: number;
  id_rombel: number;
  id_semester: number;
  nama: string;
  rombel: string;
  semester: string;
}

type TabType = "rombel" | "plotting";

const ManajemenRombelPlotting = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  // 🔄 State Navigasi Tab Utama (Hanya Rombel dan Plotting BK)
  const [activeTab, setActiveTab] = useState<TabType>("rombel");
  const [loading, setLoading] = useState(true);

  // Global Toast
  const [toast, setToast] = useState<{
    show: boolean;
    variant: "success" | "error";
    message: string;
  }>({ show: false, variant: "success", message: "" });

  // ----------------------------------------------------
  // 📑 STATE & LOGIKA: DATA ROMBEL
  // ----------------------------------------------------
  const [dataRombel, setDataRombel] = useState<Rombel[]>([]);
  const [showFilterRombel, setShowFilterRombel] = useState(false);
  const [selectedTingkat, setSelectedTingkat] = useState<string[]>([]);
  const [selectedJurusan, setSelectedJurusan] = useState<string[]>([]);

  const processedRombelData = useMemo(() => {
    return dataRombel.map((row) => ({
      ...row,
      walikelas: row.walikelas ?? "-",
      rombel: row.rombel ?? "-",
      tingkat: row.tingkat ?? "-",
      jurusan: row.jurusan ?? "-",
      jumlah_siswa: row.jumlah_siswa ?? 0,
    }));
  }, [dataRombel]);

  const availableTingkat = useMemo(() => {
    const list = processedRombelData
      .map((item) => item.tingkat)
      .filter((tk) => tk && tk !== "-");
    return Array.from(new Set(list)).sort();
  }, [processedRombelData]);

  const availableJurusan = useMemo(() => {
    const list = processedRombelData
      .map((item) => item.jurusan)
      .filter((jr) => jr && jr !== "-");
    return Array.from(new Set(list)).sort();
  }, [processedRombelData]);

  const filteredRombelData = useMemo(() => {
    return processedRombelData.filter((row) => {
      if (selectedTingkat.length > 0 && !selectedTingkat.includes(row.tingkat))
        return false;
      if (selectedJurusan.length > 0 && !selectedJurusan.includes(row.jurusan))
        return false;
      return true;
    });
  }, [processedRombelData, selectedTingkat, selectedJurusan]);

  const filterRombelValues = useMemo(
    () => ({ selectedTingkat, selectedJurusan }),
    [selectedTingkat, selectedJurusan],
  );

  const handleApplyRombelFilters = (filters: typeof filterRombelValues) => {
    setSelectedTingkat(filters.selectedTingkat);
    setSelectedJurusan(filters.selectedJurusan);
  };

  const rombelColumns: Column<Rombel>[] = [
    {
      header: "No",
      accessor: "rombel",
      render: (_row, rowIndex) => (rowIndex ?? 0) + 1,
      className: "w-16",
    },
    { header: "Wali Kelas", accessor: "walikelas" },
    { header: "Rombel", accessor: "rombel" },
    { header: "Tingkat", accessor: "tingkat", className: "w-24" },
    { header: "Jurusan", accessor: "jurusan" },
    {
      header: "Jumlah Siswa",
      accessor: "jumlah_siswa",
      className: "w-32",
    },
  ];

  const activeRombelFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedTingkat.length > 0) count++;
    if (selectedJurusan.length > 0) count++;
    return count;
  }, [selectedTingkat, selectedJurusan]);

  // ----------------------------------------------------
  // 📑 STATE & LOGIKA: DATA PLOTTING BK
  // ----------------------------------------------------
  const [dataPlotting, setDataPlotting] = useState<PlottingBK[]>([]);
  const [showAddPlotting, setShowAddPlotting] = useState(false);
  const [showEditPlotting, setShowEditPlotting] = useState(false);
  const [selectedPlottingRow, setSelectedPlottingRow] =
    useState<PlottingBK | null>(null);

  const [confirmDeletePlotting, setConfirmDeletePlotting] = useState<{
    show: boolean;
    row: PlottingBK | null;
  }>({ show: false, row: null });

  const [showFilterPlotting, setShowFilterPlotting] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState<string[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string[]>([]);

  const handleEditPlotting = (row: PlottingBK) => {
    setSelectedPlottingRow(row);
    setShowEditPlotting(true);
  };

  const handleDeletePlottingClick = (row: PlottingBK) => {
    setConfirmDeletePlotting({ show: true, row });
  };

  const handleDeletePlottingConfirm = async () => {
    const row = confirmDeletePlotting.row;
    if (!row) return;
    setConfirmDeletePlotting({ show: false, row: null });
    try {
      await axios.delete(`/plotting/${row.id_plotting}`);
      fetchAllData();
      setToast({
        show: true,
        variant: "success",
        message: `Plotting BK untuk rombel "${row.rombel}" berhasil dihapus.`,
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || "Gagal menghapus data plotting.";
      setToast({ show: true, variant: "error", message: msg });
    }
  };

  const processedPlottingData = useMemo(() => {
    return dataPlotting.map((row) => ({
      ...row,
      nama: row.nama ?? "-",
      rombel: row.rombel ?? "-",
      semester: row.semester ?? "-",
    }));
  }, [dataPlotting]);

  const availableGuru = useMemo(() => {
    const list = processedPlottingData
      .map((item) => item.nama)
      .filter((n) => n && n !== "-");
    return Array.from(new Set(list)).sort();
  }, [processedPlottingData]);

  const availableSemester = useMemo(() => {
    const list = processedPlottingData
      .map((item) => item.semester)
      .filter((s) => s && s !== "-");
    return Array.from(new Set(list)).sort();
  }, [processedPlottingData]);

  const filteredPlottingData = useMemo(() => {
    return processedPlottingData.filter((row) => {
      if (selectedGuru.length > 0 && !selectedGuru.includes(row.nama))
        return false;
      if (
        selectedSemester.length > 0 &&
        !selectedSemester.includes(row.semester)
      )
        return false;
      return true;
    });
  }, [processedPlottingData, selectedGuru, selectedSemester]);

  const filterPlottingValues = useMemo(
    () => ({ selectedGuru, selectedSemester }),
    [selectedGuru, selectedSemester],
  );

  const handleApplyPlottingFilters = (filters: typeof filterPlottingValues) => {
    setSelectedGuru(filters.selectedGuru);
    setSelectedSemester(filters.selectedSemester);
  };

  const plottingColumns: Column<PlottingBK>[] = [
    {
      header: "No",
      accessor: "id_plotting",
      render: (_row, rowIndex) => (rowIndex ?? 0) + 1,
      className: "w-16",
    },
    { header: "Guru BK", accessor: "nama" },
    {
      header: "Rombongan Belajar",
      accessor: "rombel",
      className: "",
    },
    { header: "Semester", accessor: "semester", className: "" },
  ];

  if (isAdmin) {
    plottingColumns.push({
      header: "Aksi",
      accessor: "id_plotting",
      className: "text-center w-48",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="primary"
            startIcon={<PencilIcon className="size-4" />}
            onClick={() => handleEditPlotting(row)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            startIcon={<TrashBinIcon className="size-4" />}
            onClick={() => handleDeletePlottingClick(row)}
            className="border-red-400 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Hapus
          </Button>
        </div>
      ),
    });
  }

  const activePlottingFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedGuru.length > 0) count++;
    if (selectedSemester.length > 0) count++;
    return count;
  }, [selectedGuru, selectedSemester]);

  // ----------------------------------------------------
  // 🔄 PARALLEL FETCH DATA
  // ----------------------------------------------------
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resRombel, resPlotting] = await Promise.all([
        axios.get("/rombel"),
        axios.get("/plotting"),
      ]);

      const resR = resRombel.data?.data || resRombel.data || [];
      setDataRombel(Array.isArray(resR) ? resR : []);

      const resPl = resPlotting.data?.data || resPlotting.data || [];
      setDataPlotting(Array.isArray(resPl) ? resPl : []);
    } catch (error) {
      console.error("Gagal memuat data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // 📑 Render Headings / Breadcrumbs Dinamis Berdasarkan Tab
  const getPageTitles = () => {
    if (activeTab === "rombel") {
      return {
        meta: "Data Rombongan Belajar",
        breadcrumb: "Data Rombongan Belajar",
      };
    }
    return { meta: "Plotting BK", breadcrumb: "Plotting BK" };
  };

  const titles = getPageTitles();

  return (
    <>
      <PageMeta
        title={`${titles.meta} | Dashboard SMKN 1 Batam`}
        description="Halaman Manajemen Rombel dan Plotting Guru BK"
      />
      <PageBreadcrumb pageTitle={titles.breadcrumb} />

      {/* Global Toast */}
      <Toast
        show={toast.show}
        variant={toast.variant}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      {/* --- CONFIRMATION DIALOG --- */}
      <ConfirmDialog
        show={confirmDeletePlotting.show}
        variant="danger"
        title="Hapus Plotting BK?"
        message={`Anda yakin ingin menghapus plotting untuk rombel "${confirmDeletePlotting.row?.rombel}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={handleDeletePlottingConfirm}
        onCancel={() => setConfirmDeletePlotting({ show: false, row: null })}
      />

      {/* --- FILTER MODALS --- */}
      <FilterRombelModal
        show={showFilterRombel}
        onClose={() => setShowFilterRombel(false)}
        onApply={handleApplyRombelFilters}
        initialValues={filterRombelValues}
        availableTingkat={availableTingkat}
        availableJurusan={availableJurusan}
      />

      <FilterPlottingBKModal
        show={showFilterPlotting}
        onClose={() => setShowFilterPlotting(false)}
        onApply={handleApplyPlottingFilters}
        initialValues={filterPlottingValues}
        availableGuru={availableGuru}
        availableSemester={availableSemester}
      />

      {/* --- ADD / EDIT POPUPS --- */}
      <TambahDataPlottingBK
        show={showAddPlotting}
        onClose={(didSave) => {
          setShowAddPlotting(false);
          if (didSave) {
            fetchAllData();
            setToast({
              show: true,
              variant: "success",
              message: "Data Plotting BK berhasil ditambahkan!",
            });
          }
        }}
      />

      {selectedPlottingRow && (
        <EditDataPlottingBK
          show={showEditPlotting}
          onClose={(didSave) => {
            setShowEditPlotting(false);
            setSelectedPlottingRow(null);
            if (didSave) {
              fetchAllData();
              setToast({
                show: true,
                variant: "success",
                message: "Data Plotting BK berhasil diperbarui!",
              });
            }
          }}
          row={selectedPlottingRow}
        />
      )}

      {/* --- MAIN CARD & TABLES --- */}
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("rombel")}
            className={`pb-3 text-sm font-semibold transition-all relative ${
              activeTab === "rombel"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Data Rombel
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("plotting")}
            className={`pb-3 text-sm font-semibold transition-all relative ${
              activeTab === "plotting"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Plotting BK
          </button>
        </div>

        <div>
          {loading ? (
            <ComponentCard title={activeTab === "rombel" ? "Daftar Rombongan Belajar" : "Daftar Plotting BK"}>
              <p className="text-center dark:text-gray-400">Loading...</p>
            </ComponentCard>
          ) : activeTab === "rombel" ? (
            <ComponentCard title="Daftar Rombongan Belajar">
              <DataTable
                columns={rombelColumns}
                data={filteredRombelData}
                searchable
                paginated
                itemsPerPageOptions={[5, 10, 20, 50]}
                defaultItemsPerPage={10}
                extraActions={
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={
                        activeRombelFiltersCount > 0 ? "primary" : "outline"
                      }
                      onClick={() => setShowFilterRombel(true)}
                      className="relative"
                    >
                      🔍 Filter
                      {activeRombelFiltersCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                          {activeRombelFiltersCount}
                        </span>
                      )}
                    </Button>
                  </div>
                }
              />
            </ComponentCard>
          ) : (
            <ComponentCard title="Daftar Plotting BK">
              <DataTable
                columns={plottingColumns}
                data={filteredPlottingData}
                searchable
                paginated
                itemsPerPageOptions={[5, 10, 20, 50]}
                defaultItemsPerPage={10}
                extraActions={
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={
                        activePlottingFiltersCount > 0 ? "primary" : "outline"
                      }
                      onClick={() => setShowFilterPlotting(true)}
                      className="relative"
                    >
                      🔍 Filter
                      {activePlottingFiltersCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                          {activePlottingFiltersCount}
                        </span>
                      )}
                    </Button>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setShowAddPlotting(true)}
                      >
                        + Tambah
                      </Button>
                    )}
                  </div>
                }
              />
            </ComponentCard>
          )}
        </div>
      </div>
    </>
  );
};

export default ManajemenRombelPlotting;
