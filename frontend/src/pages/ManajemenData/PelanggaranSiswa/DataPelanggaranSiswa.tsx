import { useEffect, useState, useMemo } from "react";
import axios from "../../../api/axios";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import { PencilIcon, TrashBinIcon } from "../../../icons";
import DataTable, { Column } from "../../../components/ui/table/DataTable";
import EditDataPelanggaranSiswa from "./EditDataPoinPelanggaran";
import TambahDataPelanggaranSiswa from "./TambahDataPelanggaranSiswa";
import Toast from "../../../components/ui/alert/Toast";
import ConfirmDialog from "../../../components/ui/modal/ConfirmDialog";
import { useAuth } from "../../../context/AuthContext";

export interface PelanggaranSiswa {
  id_pelanggaran: number;
  id_siswa: number;
  id_poin: number;
  id_ptk: number;
  id_semester: string;
  tanggal: string;
  keterangan: string;
  jenis_penilaian: string;
  bobot: number;
  jenis_pelanggaran: string;
  nama_siswa: string;
  nama_rombel: string;
  nama_ptk: string;
  nama_semester: string;
}

// Custom Filter Modal Component
interface FilterModalProps {
  show: boolean;
  onClose: () => void;
  onApply: (filters: {
    selectedKelas: string[];
    selectedJenisPenilaian: string[];
    minBobot: number | "";
    maxBobot: number | "";
    startDate: string;
    endDate: string;
  }) => void;
  initialValues: {
    selectedKelas: string[];
    selectedJenisPenilaian: string[];
    minBobot: number | "";
    maxBobot: number | "";
    startDate: string;
    endDate: string;
  };
  listKelas: string[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  show,
  onClose,
  onApply,
  initialValues,
  listKelas,
}) => {
  const [tempKelas, setTempKelas] = useState<string[]>([]);
  const [tempJenisPenilaian, setTempJenisPenilaian] = useState<string[]>([]);
  const [tempMinBobot, setTempMinBobot] = useState<number | "">("");
  const [tempMaxBobot, setTempMaxBobot] = useState<number | "">("");
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [kelasSearch, setKelasSearch] = useState("");

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setTempKelas(initialValues.selectedKelas);
      setTempJenisPenilaian(initialValues.selectedJenisPenilaian);
      setTempMinBobot(initialValues.minBobot);
      setTempMaxBobot(initialValues.maxBobot);
      setTempStartDate(initialValues.startDate);
      setTempEndDate(initialValues.endDate);
      setKelasSearch("");
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
      selectedKelas: tempKelas,
      selectedJenisPenilaian: tempJenisPenilaian,
      minBobot: tempMinBobot,
      maxBobot: tempMaxBobot,
      startDate: tempStartDate,
      endDate: tempEndDate,
    });
    handleClose();
  };

  const handleReset = () => {
    setTempKelas([]);
    setTempJenisPenilaian([]);
    setTempMinBobot("");
    setTempMaxBobot("");
    setTempStartDate("");
    setTempEndDate("");
  };

  const filteredKelas = listKelas.filter((k) =>
    (k || "").toLowerCase().includes(kelasSearch.toLowerCase())
  );

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      } bg-black/40 p-4`}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md transform transition-all duration-300 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 -translate-y-4"
        } max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filter Data Pelanggaran
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
          {/* 1. Kelas (Searchable Select, Multiple Select) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-white/90 mb-1">
              Kelas (Multi-select)
            </label>
            <input
              type="text"
              placeholder="Cari kelas..."
              value={kelasSearch}
              onChange={(e) => setKelasSearch(e.target.value)}
              className="w-full border px-3 py-1.5 rounded text-sm mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <div className="h-32 border overflow-y-auto p-2 rounded dark:bg-gray-700 dark:border-gray-600 space-y-1 bg-gray-50/50">
              {filteredKelas.length > 0 ? (
                filteredKelas.map((k) => (
                  <label
                    key={k}
                    className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/50 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={tempKelas.includes(k)}
                      onChange={() => {
                        if (tempKelas.includes(k)) {
                          setTempKelas(tempKelas.filter((item) => item !== k));
                        } else {
                          setTempKelas([...tempKelas, k]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{k}</span>
                  </label>
                ))
              ) : (
                <div className="text-xs text-gray-400 dark:text-gray-500 text-center italic py-4">
                  Tidak ada kelas ditemukan
                </div>
              )}
            </div>
            {tempKelas.length > 0 && (
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex justify-between">
                <span>{tempKelas.length} kelas dipilih</span>
                <button
                  type="button"
                  onClick={() => setTempKelas([])}
                  className="hover:underline font-semibold"
                >
                  Bersihkan
                </button>
              </div>
            )}
          </div>

          {/* 2. Jenis Penilaian (Multiple Select) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-white/90 mb-1">
              Jenis Penilaian
            </label>
            <div className="flex flex-wrap gap-4 border p-2 rounded dark:bg-gray-700 dark:border-gray-600">
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

          {/* 3. Bobot Range */}
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

          {/* 4. Tanggal Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-white/90 mb-1">
              Tanggal Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">Dari</label>
                <input
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  className="w-full border px-3 py-1.5 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">Sampai</label>
                <input
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
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

const DataPelanggaranSiswa = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [data, setData] = useState<PelanggaranSiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showTambahPopup, setShowTambahPopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<PelanggaranSiswa | null>(null);

  // Custom filter modal state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedKelas, setSelectedKelas] = useState<string[]>([]);
  const [selectedJenisPenilaian, setSelectedJenisPenilaian] = useState<string[]>([]);
  const [minBobot, setMinBobot] = useState<number | "">("");
  const [maxBobot, setMaxBobot] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Toast notifications
  const [toast, setToast] = useState<{
    show: boolean;
    variant: "success" | "error";
    message: string;
  }>({ show: false, variant: "success", message: "" });

  // Delete confirmation dialog
  const [confirmDelete, setConfirmDelete] = useState<{
    show: boolean;
    row: PelanggaranSiswa | null;
  }>({ show: false, row: null });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/pelanggaran-siswa");
      console.log("API result:", res.data);
      setData(res.data?.data ?? res.data ?? []);
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

  const handleEdit = (row: PelanggaranSiswa) => {
    setSelectedRow(row);
    setShowEditPopup(true);
  };

  const handleDeleteClick = (row: PelanggaranSiswa) => {
    setConfirmDelete({ show: true, row });
  };

  const handleDeleteConfirm = async () => {
    const row = confirmDelete.row;
    if (!row) return;
    setConfirmDelete({ show: false, row: null });
    try {
      await axios.delete(`/pelanggaran-siswa/${row.id_pelanggaran}`);
      fetchData();
      setToast({
        show: true,
        variant: "success",
        message: `Data pelanggaran siswa "${row.nama_siswa}" berhasil dihapus.`,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Gagal menghapus data pelanggaran.";
      setToast({ show: true, variant: "error", message: msg });
    }
  };

  // Get unique classes list from data
  const listKelas = useMemo(() => {
    const classes = data
      .map((row) => row.nama_rombel)
      .filter((c) => c !== undefined && c !== null && c !== "");
    return Array.from(new Set(classes)).sort();
  }, [data]);

  // Compute local filteredData
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // 1. Kelas (multiple select)
      if (selectedKelas.length > 0 && !selectedKelas.includes(row.nama_rombel)) {
        return false;
      }
      // 2. Jenis Penilaian (multiple select)
      if (
        selectedJenisPenilaian.length > 0 &&
        !selectedJenisPenilaian.includes(row.jenis_penilaian)
      ) {
        return false;
      }
      // 3. Bobot range
      if (minBobot !== "" && row.bobot < Number(minBobot)) {
        return false;
      }
      if (maxBobot !== "" && row.bobot > Number(maxBobot)) {
        return false;
      }
      // 4. Tanggal range
      if (row.tanggal) {
        const rowTime = new Date(row.tanggal).getTime();
        if (startDate) {
          const startTime = new Date(startDate).setHours(0, 0, 0, 0);
          if (rowTime < startTime) return false;
        }
        if (endDate) {
          const endTime = new Date(endDate).setHours(23, 59, 59, 999);
          if (rowTime > endTime) return false;
        }
      } else {
        if (startDate || endDate) return false;
      }
      return true;
    });
  }, [data, selectedKelas, selectedJenisPenilaian, minBobot, maxBobot, startDate, endDate]);

  const filterValues = useMemo(
    () => ({
      selectedKelas,
      selectedJenisPenilaian,
      minBobot,
      maxBobot,
      startDate,
      endDate,
    }),
    [selectedKelas, selectedJenisPenilaian, minBobot, maxBobot, startDate, endDate]
  );

  const handleApplyFilters = (filters: typeof filterValues) => {
    setSelectedKelas(filters.selectedKelas);
    setSelectedJenisPenilaian(filters.selectedJenisPenilaian);
    setMinBobot(filters.minBobot);
    setMaxBobot(filters.maxBobot);
    setStartDate(filters.startDate);
    setEndDate(filters.endDate);
  };

  const columns: Column<PelanggaranSiswa>[] = [
    {
      header: "No",
      accessor: "id_pelanggaran",
      render: (_row, rowIndex) => (rowIndex ?? 0) + 1,
      className: "text-center w-16",
    },
    { header: "Nama Siswa", accessor: "nama_siswa", className: "text-start font-semibold" },
    { header: "Kelas", accessor: "nama_rombel", className: "text-center w-24" },
    { header: "Jenis Penilaian", accessor: "jenis_penilaian" },
    { header: "Bobot", accessor: "bobot", className: "text-center w-20" },
    { header: "Jenis Pelanggaran", accessor: "jenis_pelanggaran", className: "text-start" },
    {
      header: "Tanggal",
      accessor: "tanggal",
      render: (row) => {
        if (!row.tanggal) return "-";
        try {
          const date = new Date(row.tanggal);
          return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        } catch {
          return row.tanggal;
        }
      },
      className: "text-center w-32",
    },
  ];

  if (isAdmin) {
    columns.push({
      header: "Aksi",
      accessor: "id_pelanggaran",
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
      className: "text-center w-36",
    });
  }

  // Count active filters to display a badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedKelas.length > 0) count++;
    if (selectedJenisPenilaian.length > 0) count++;
    if (minBobot !== "" || maxBobot !== "") count++;
    if (startDate || endDate) count++;
    return count;
  }, [selectedKelas, selectedJenisPenilaian, minBobot, maxBobot, startDate, endDate]);

  return (
    <>
      <PageMeta
        title="Data Pelanggaran Siswa | Dashboard SMKN 1 Batam"
        description="Halaman menampilkan tabel data pelanggaran siswa"
      />
      <PageBreadcrumb pageTitle="Data Pelanggaran Siswa" />

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
        message={`Anda yakin ingin menghapus catatan pelanggaran "${confirmDelete.row?.nama_siswa}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete({ show: false, row: null })}
      />

      {/* Filter Modal */}
      <FilterModal
        show={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        initialValues={filterValues}
        listKelas={listKelas}
      />

      <div className="space-y-6">
        <ComponentCard title="Tabel Pelanggaran Siswa">
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
                      onClick={() => setShowTambahPopup(true)}
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
        <EditDataPelanggaranSiswa
          show={showEditPopup}
          onClose={(didSave) => {
            setShowEditPopup(false);
            setSelectedRow(null);
            fetchData();
            if (didSave) {
              setToast({
                show: true,
                variant: "success",
                message: "Data pelanggaran siswa berhasil diperbarui!",
              });
            }
          }}
          row={selectedRow}
        />
      )}

      {/* Popup Tambah */}
      <TambahDataPelanggaranSiswa
        show={showTambahPopup}
        onClose={(didSave) => {
          setShowTambahPopup(false);
          fetchData();
          if (didSave) {
            setToast({
              show: true,
              variant: "success",
              message: "Data pelanggaran siswa berhasil ditambahkan!",
            });
          }
        }}
      />
    </>
  );
};

export default DataPelanggaranSiswa;
