import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../api/axios";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import { PencilIcon, TrashBinIcon } from "../../../icons";
import DataTable, { Column } from "../../../components/ui/table/DataTable";
import EditDataPoinPelanggaran from "./EditDataPoinPelanggaran";
import Toast from "../../../components/ui/alert/Toast";
import ConfirmDialog from "../../../components/ui/modal/ConfirmDialog";
import { useAuth } from "../../../context/AuthContext";

export interface Pelanggaran {
  id_poin: number;
  jenis_penilaian: string;
  bobot: number;
  jenis_pelanggaran: string;
  is_active: boolean;
}

// Custom Filter Modal Component for Poin Pelanggaran
interface FilterModalProps {
  show: boolean;
  onClose: () => void;
  onApply: (filters: {
    selectedJenisPenilaian: string[];
    minBobot: number | "";
    maxBobot: number | "";
  }) => void;
  initialValues: {
    selectedJenisPenilaian: string[];
    minBobot: number | "";
    maxBobot: number | "";
  };
}

const FilterModal: React.FC<FilterModalProps> = ({
  show,
  onClose,
  onApply,
  initialValues,
}) => {
  const [tempJenisPenilaian, setTempJenisPenilaian] = useState<string[]>([]);
  const [tempMinBobot, setTempMinBobot] = useState<number | "">("");
  const [tempMaxBobot, setTempMaxBobot] = useState<number | "">("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setTempJenisPenilaian(initialValues.selectedJenisPenilaian);
      setTempMinBobot(initialValues.minBobot);
      setTempMaxBobot(initialValues.maxBobot);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [show, initialValues]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({
      selectedJenisPenilaian: tempJenisPenilaian,
      minBobot: tempMinBobot,
      maxBobot: tempMaxBobot,
    });
    handleClose();
  };

  const handleReset = () => {
    setTempJenisPenilaian([]);
    setTempMinBobot("");
    setTempMaxBobot("");
  };

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      } bg-black/40 p-4`}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm transform transition-all duration-300 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 -translate-y-4"
        }`}
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filter Poin Pelanggaran
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleApply} className="space-y-4">
          {/* 1. Jenis Penilaian (Multiple Select) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-white/90 mb-1">
              Jenis Penilaian
            </label>
            <div className="flex flex-wrap gap-4 border p-2 rounded dark:bg-gray-700 dark:border-gray-600 bg-gray-50/50">
              {["Kelakuan", "Kerajinan", "Kerapian"].map((jp) => (
                <label
                  key={jp}
                  className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
                >
                  <input
                    type="checkbox"
                    checked={tempJenisPenilaian.includes(jp)}
                    onChange={() => {
                      if (tempJenisPenilaian.includes(jp)) {
                        setTempJenisPenilaian(tempJenisPenilaian.filter((item) => item !== jp));
                      } else {
                        setTempJenisPenilaian([...tempJenisPenilaian, jp]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{jp}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 2. Bobot Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-white/90 mb-1">
              Bobot Range (Poin)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  placeholder="Min"
                  value={tempMinBobot}
                  onChange={(e) =>
                    setTempMinBobot(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full border px-3 py-1.5 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max"
                  value={tempMaxBobot}
                  onChange={(e) =>
                    setTempMaxBobot(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full border px-3 py-1.5 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t mt-6">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-red-500 hover:text-red-700 hover:underline font-semibold"
            >
              Reset Filter
            </button>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={handleClose}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Terapkan
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const PoinPelanggaran = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [data, setData] = useState<Pelanggaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Pelanggaran | null>(null);
  const navigate = useNavigate();

  // Custom filter state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedJenisPenilaian, setSelectedJenisPenilaian] = useState<string[]>([]);
  const [minBobot, setMinBobot] = useState<number | "">("");
  const [maxBobot, setMaxBobot] = useState<number | "">("");

  const [toast, setToast] = useState<{
    show: boolean;
    variant: "success" | "error";
    message: string;
  }>({ show: false, variant: "success", message: "" });

  const [confirmDelete, setConfirmDelete] = useState<{
    show: boolean;
    row: Pelanggaran | null;
  }>({ show: false, row: null });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/poin-pelanggaran");
      setData(res.data.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setData((prev) => (Array.isArray(prev) ? prev : []));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (row: Pelanggaran) => {
    setSelectedRow(row);
    setShowEditPopup(true);
  };

  const handleDeleteClick = (row: Pelanggaran) => {
    setConfirmDelete({ show: true, row });
  };

  const handleDeleteConfirm = async () => {
    const row = confirmDelete.row;
    if (!row) return;
    setConfirmDelete({ show: false, row: null });
    try {
      await axios.delete(`/poin-pelanggaran/${row.id_poin}`);
      fetchData();
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

  // Compute local filteredData
  const filteredData = useMemo(() => {
    const safeData = Array.isArray(data) ? data : [];
    return safeData.filter((row) => {
      // 1. Jenis Penilaian (multiple select)
      if (
        selectedJenisPenilaian.length > 0 &&
        !selectedJenisPenilaian.includes(row.jenis_penilaian)
      ) {
        return false;
      }
      // 2. Bobot range
      if (minBobot !== "" && row.bobot < Number(minBobot)) {
        return false;
      }
      if (maxBobot !== "" && row.bobot > Number(maxBobot)) {
        return false;
      }
      return true;
    });
  }, [data, selectedJenisPenilaian, minBobot, maxBobot]);

  const filterValues = useMemo(
    () => ({
      selectedJenisPenilaian,
      minBobot,
      maxBobot,
    }),
    [selectedJenisPenilaian, minBobot, maxBobot]
  );

  const handleApplyFilters = (filters: typeof filterValues) => {
    setSelectedJenisPenilaian(filters.selectedJenisPenilaian);
    setMinBobot(filters.minBobot);
    setMaxBobot(filters.maxBobot);
  };

  const columns: Column<Pelanggaran>[] = [
    {
      header: "No",
      accessor: "id_poin",
      render: (_row, rowIndex) => (rowIndex ?? 0) + 1,
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
  ];

  if (isAdmin) {
    columns.push({
      header: "Aksi",
      accessor: "id_poin",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="primary"
            startIcon={<PencilIcon className="size-4" />}
            onClick={() => handleEdit(row)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            startIcon={<TrashBinIcon className="size-4" />}
            onClick={() => handleDeleteClick(row)}
            className="border-red-400 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Hapus
          </Button>
        </div>
      ),
      className: "text-center",
    });
  }

  // Active filter badge count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedJenisPenilaian.length > 0) count++;
    if (minBobot !== "" || maxBobot !== "") count++;
    return count;
  }, [selectedJenisPenilaian, minBobot, maxBobot]);

  return (
    <>
      <PageMeta
        title="Data Pelanggaran | Dashboard SMKN 1 Batam"
        description="Halaman menampilkan tabel data pelanggaran siswa"
      />
      <PageBreadcrumb pageTitle="Data Poin Pelanggaran" />

      {/* Toast notification */}
      <Toast
        show={toast.show}
        variant={toast.variant}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      {/* Confirm delete dialog */}
      <ConfirmDialog
        show={confirmDelete.show}
        variant="danger"
        title="Hapus Data?"
        message={`Anda yakin ingin menghapus "${confirmDelete.row?.jenis_pelanggaran}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete({ show: false, row: null })}
      />

      {/* Custom Filter Modal */}
      <FilterModal
        show={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        initialValues={filterValues}
      />

      <div className="space-y-6">
        <ComponentCard title="Tabel Poin Pelanggaran">
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
          )}
        </ComponentCard>
      </div>

      {/* Popup Edit */}
      {selectedRow && (
        <EditDataPoinPelanggaran
          show={showEditPopup}
          onClose={(didSave) => {
            setShowEditPopup(false);
            setSelectedRow(null);
            fetchData();
            if (didSave) {
              setToast({
                show: true,
                variant: "success",
                message: "Data poin pelanggaran berhasil diperbarui!",
              });
            }
          }}
          row={selectedRow}
        />
      )}
    </>
  );
};

export default PoinPelanggaran;
