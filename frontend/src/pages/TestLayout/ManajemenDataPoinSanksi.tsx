import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // 👈 Diperbaiki: Ditambahkan agar tidak crash saat render
import axios from "../../api/axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { PencilIcon, TrashBinIcon } from "../../icons";
import DataTable, { Column } from "../../components/ui/table/DataTable";

// Data Poin Pelanggaran
import EditDataPoinPelanggaran from "../ManajemenData/PoinPelanggaran/EditDataPoinPelanggaran";
import FilterPoinPelanggaranModal from "../ManajemenData/PoinPelanggaran/FilterPoinPelanggaranModal";

// Data Sanksi
import AddEditSanksiModal, {
  Sanksi,
} from "../ManajemenData/Sanksi/AddEditSanksiModal";
import FilterSanksiModal from "../ManajemenData/Sanksi/FilterSanksiModal";

import Toast from "../../components/ui/alert/Toast";
import ConfirmDialog from "../../components/ui/modal/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";

export interface PoinPelanggaran {
  id_poin: number;
  jenis_penilaian: string;
  bobot: number;
  jenis_pelanggaran: string;
  is_active: boolean;
}

const TestLayout = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const navigate = useNavigate();

  // 🔄 State Navigasi Tab Aktif
  const [activeTab, setActiveTab] = useState<"pelanggaran" | "sanksi">(
    "pelanggaran",
  );
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------
  // 📑 STATE & LOGIKA TAB 1: POIN PELANGGARAN
  // ----------------------------------------------------
  const [dataPelanggaran, setDataPelanggaran] = useState<PoinPelanggaran[]>([]);
  const [showEditPelanggaran, setShowEditPelanggaran] = useState(false);
  const [selectedPelanggaranRow, setSelectedPelanggaranRow] =
    useState<PoinPelanggaran | null>(null);

  const [showFilterPelanggaran, setShowFilterPelanggaran] = useState(false);
  const [selectedJenisPenilaian, setSelectedJenisPenilaian] = useState<
    string[]
  >([]);
  const [minBobot, setMinBobot] = useState<number | "">("");
  const [maxBobot, setMaxBobot] = useState<number | "">("");

  const [confirmDeletePelanggaran, setConfirmDeletePelanggaran] = useState<{
    show: boolean;
    row: PoinPelanggaran | null;
  }>({ show: false, row: null });

  // ----------------------------------------------------
  // 📑 STATE & LOGIKA TAB 2: DATA SANKSI
  // ----------------------------------------------------
  const [dataSanksi, setDataSanksi] = useState<Sanksi[]>([]);
  const [showAddEditSanksi, setShowAddEditSanksi] = useState(false);
  const [selectedSanksiRow, setSelectedSanksiRow] = useState<Sanksi | null>(
    null,
  );

  const [showFilterSanksi, setShowFilterSanksi] = useState(false);
  const [minPoin, setMinPoin] = useState<number | "">("");
  const [maxPoin, setMaxPoin] = useState<number | "">("");

  const [confirmDeleteSanksi, setConfirmDeleteSanksi] = useState<{
    show: boolean;
    row: Sanksi | null;
  }>({ show: false, row: null });

  // Global Toast
  const [toast, setToast] = useState<{
    show: boolean;
    variant: "success" | "error";
    message: string;
  }>({
    show: false,
    variant: "success",
    message: "",
  });

  // 🔄 Ambil Semua Data Secara Bersamaan (Parallel Fetching)
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resPelanggaran, resSanksi] = await Promise.all([
        axios.get("/poin-pelanggaran"),
        axios.get("/sanksi"),
      ]);

      const resP = resPelanggaran.data?.data || resPelanggaran.data || [];
      setDataPelanggaran(Array.isArray(resP) ? resP : []);

      const resS = resSanksi.data?.data || resSanksi.data || [];
      setDataSanksi(Array.isArray(resS) ? resS : []);
    } catch (error) {
      console.error("Gagal memuat data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handler Hapus Poin Pelanggaran
  const handleDeletePelanggaranConfirm = async () => {
    const row = confirmDeletePelanggaran.row;
    if (!row) return;
    setConfirmDeletePelanggaran({ show: false, row: null });
    try {
      await axios.delete(`/poin-pelanggaran/${row.id_poin}`);
      fetchAllData();
      setToast({
        show: true,
        variant: "success",
        message: `Data "${row.jenis_pelanggaran}" berhasil dihapus.`,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Gagal menghapus data.";
      setToast({ show: true, variant: "error", message: msg });
    }
  };

  // Handler Hapus Sanksi
  const handleDeleteSanksiConfirm = async () => {
    const row = confirmDeleteSanksi.row;
    if (!row) return;
    setConfirmDeleteSanksi({ show: false, row: null });
    try {
      await axios.delete(`/sanksi/${row.id_master_sanksi}`);
      fetchAllData();
      setToast({
        show: true,
        variant: "success",
        message: `Data sanksi "${row.nama_sanksi}" berhasil dihapus.`,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Gagal menghapus data sanksi.";
      setToast({ show: true, variant: "error", message: msg });
    }
  };

  // 🔍 Data Filtering client-side untuk Poin Pelanggaran
  const filteredPelanggaran = useMemo(() => {
    return dataPelanggaran.filter((row) => {
      if (
        selectedJenisPenilaian.length > 0 &&
        !selectedJenisPenilaian.includes(row.jenis_penilaian)
      )
        return false;
      if (minBobot !== "" && row.bobot < Number(minBobot)) return false;
      if (maxBobot !== "" && row.bobot > Number(maxBobot)) return false;
      return true;
    });
  }, [dataPelanggaran, selectedJenisPenilaian, minBobot, maxBobot]);

  // 🔍 Data Filtering client-side untuk Sanksi
  const filteredSanksi = useMemo(() => {
    return dataSanksi.filter((row) => {
      if (minPoin !== "" && row.batas_poin < Number(minPoin)) return false;
      if (maxPoin !== "" && row.batas_poin > Number(maxPoin)) return false;
      return true;
    });
  }, [dataSanksi, minPoin, maxPoin]);

  // 📋 Kolom Tabel Poin Pelanggaran
  const pelanggaranColumns: Column<PoinPelanggaran>[] = [
    {
      header: "No",
      accessor: "id_poin",
      render: (_, idx) => (idx ?? 0) + 1,
      className: "text-center w-16",
    },
    { header: "Jenis Penilaian", accessor: "jenis_penilaian" },
    { header: "Bobot", accessor: "bobot", className: "text-center w-24" },
    {
      header: "Jenis Pelanggaran",
      accessor: "jenis_pelanggaran",
      className: "text-start",
    },
    {
      header: "Status",
      accessor: "is_active",
      render: (row) => (row.is_active ? "Aktif" : "Tidak Aktif"),
      className: "text-center w-32",
    },
    ...(isAdmin
      ? [
          {
            header: "Aksi",
            accessor: "id_poin" as const,
            className: "text-center w-48",
            render: (row: PoinPelanggaran) => (
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  startIcon={<PencilIcon className="size-4" />}
                  onClick={() => {
                    setSelectedPelanggaranRow(row);
                    setShowEditPelanggaran(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  startIcon={<TrashBinIcon className="size-4" />}
                  onClick={() =>
                    setConfirmDeletePelanggaran({ show: true, row })
                  }
                  className="border-red-400 text-red-600 hover:bg-red-50"
                >
                  Hapus
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  // 📋 Kolom Tabel Sanksi
  const sanksiColumns: Column<Sanksi>[] = [
    {
      header: "No",
      accessor: "id_master_sanksi",
      render: (_, idx) => (idx ?? 0) + 1,
      className: "text-center w-16",
    },
    { header: "Nama Sanksi", accessor: "nama_sanksi" },
    {
      header: "Batas Poin",
      accessor: "batas_poin",
      className: "text-center w-32",
    },
    ...(isAdmin
      ? [
          {
            header: "Aksi",
            accessor: "id_master_sanksi" as const,
            className: "text-center w-48",
            render: (row: Sanksi) => (
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  startIcon={<PencilIcon className="size-4" />}
                  onClick={() => {
                    setSelectedSanksiRow(row);
                    setShowAddEditSanksi(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  startIcon={<TrashBinIcon className="size-4" />}
                  onClick={() => setConfirmDeleteSanksi({ show: true, row })}
                  className="border-red-400 text-red-600 hover:bg-red-50"
                >
                  Hapus
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  const activeFiltersPelanggaranCount =
    (selectedJenisPenilaian.length > 0 ? 1 : 0) +
    (minBobot !== "" || maxBobot !== "" ? 1 : 0);
  const activeFiltersSanksiCount = minPoin !== "" || maxPoin !== "" ? 1 : 0;

  // Render Judul dengan Navigasi Tab atas
  const renderCardTitle = () => (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => setActiveTab("pelanggaran")}
        className={`px-4 py-2 text-sm font-bold rounded-lg border transition-all duration-200 ${activeTab === "pelanggaran" ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"}`}
      >
        Poin Pelanggaran
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("sanksi")}
        className={`px-4 py-2 text-sm font-bold rounded-lg border transition-all duration-200 ${activeTab === "sanksi" ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"}`}
      >
        Sanksi
      </button>
    </div>
  );

  return (
    <>
      <PageMeta
        title="Data Aturan | Dashboard SMKN 1 Batam"
        description="Halaman aturan poin pelanggaran dan sanksi"
      />
      <PageBreadcrumb
        pageTitle={
          activeTab === "pelanggaran" ? "Data Poin Pelanggaran" : "Data Sanksi"
        }
      />

      <Toast
        show={toast.show}
        variant={toast.variant}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      {/* Dialog Konfirmasi Hapus Aturan Poin */}
      <ConfirmDialog
        show={confirmDeletePelanggaran.show}
        variant="danger"
        title="Hapus Data?"
        message={`Anda yakin ingin menghapus "${confirmDeletePelanggaran.row?.jenis_pelanggaran}"?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={handleDeletePelanggaranConfirm}
        onCancel={() => setConfirmDeletePelanggaran({ show: false, row: null })}
      />

      {/* Dialog Konfirmasi Hapus Sanksi */}
      <ConfirmDialog
        show={confirmDeleteSanksi.show}
        variant="danger"
        title="Hapus Data Sanksi?"
        message={`Anda yakin ingin menghapus sanksi "${confirmDeleteSanksi.row?.nama_sanksi}"?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={handleDeleteSanksiConfirm}
        onCancel={() => setConfirmDeleteSanksi({ show: false, row: null })}
      />

      {/* Modals Filter Masing-masing Tab */}
      <FilterPoinPelanggaranModal
        show={showFilterPelanggaran}
        onClose={() => setShowFilterPelanggaran(false)}
        onApply={(f) => {
          setSelectedJenisPenilaian(f.selectedJenisPenilaian);
          setMinBobot(f.minBobot);
          setMaxBobot(f.maxBobot);
        }}
        initialValues={{ selectedJenisPenilaian, minBobot, maxBobot }}
      />
      <FilterSanksiModal
        show={showFilterSanksi}
        onClose={() => setShowFilterSanksi(false)}
        onApply={(f) => {
          setMinPoin(f.minPoin);
          setMaxPoin(f.maxPoin);
        }}
        initialValues={{ minPoin, maxPoin }}
      />

      <div className="space-y-6">
        <ComponentCard title={renderCardTitle() as any}>
          {loading ? (
            <p className="text-center dark:text-gray-400">Loading...</p>
          ) : activeTab === "pelanggaran" ? (
            <DataTable
              columns={pelanggaranColumns}
              data={filteredPelanggaran}
              searchable
              paginated
              defaultItemsPerPage={10}
              extraActions={
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={
                      activeFiltersPelanggaranCount > 0 ? "primary" : "outline"
                    }
                    onClick={() => setShowFilterPelanggaran(true)}
                    className="relative"
                  >
                    🔍 Filter{" "}
                    {activeFiltersPelanggaranCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {activeFiltersPelanggaranCount}
                      </span>
                    )}
                  </Button>
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => navigate("/data-poin-pelanggaran/tambah")}
                    >
                      + Tambah
                    </Button>
                  )}
                </div>
              }
            />
          ) : (
            <DataTable
              columns={sanksiColumns}
              data={filteredSanksi}
              searchable
              paginated
              defaultItemsPerPage={10}
              extraActions={
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={
                      activeFiltersSanksiCount > 0 ? "primary" : "outline"
                    }
                    onClick={() => setShowFilterSanksi(true)}
                    className="relative"
                  >
                    🔍 Filter{" "}
                    {activeFiltersSanksiCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {activeFiltersSanksiCount}
                      </span>
                    )}
                  </Button>
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setSelectedSanksiRow(null);
                        setShowAddEditSanksi(true);
                      }}
                    >
                      + Tambah
                    </Button>
                  )}
                </div>
              }
            />
          )}
        </ComponentCard>
      </div>

      {/* Popup Edit Poin Pelanggaran */}
      {selectedPelanggaranRow && (
        <EditDataPoinPelanggaran
          show={showEditPelanggaran}
          row={selectedPelanggaranRow}
          onClose={(didSave) => {
            setShowEditPelanggaran(false);
            setSelectedPelanggaranRow(null);
            if (didSave) {
              fetchAllData();
              setToast({
                show: true,
                variant: "success",
                message: "Data poin pelanggaran berhasil diperbarui!",
              });
            }
          }}
        />
      )}

      {/* Popup Add/Edit Sanksi */}
      <AddEditSanksiModal
        show={showAddEditSanksi}
        row={selectedSanksiRow}
        onClose={(didSave) => {
          setShowAddEditSanksi(false);
          setSelectedSanksiRow(null);
          if (didSave) {
            fetchAllData();
            setToast({
              show: true,
              variant: "success",
              message: "Data sanksi berhasil disimpan!",
            });
          }
        }}
      />
    </>
  );
};

export default TestLayout;
