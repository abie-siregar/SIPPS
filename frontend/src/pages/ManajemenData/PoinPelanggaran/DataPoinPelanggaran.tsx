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
import ConfirmDialog from "../../../components/ui/modal/ConfirmDialog";
import { useAuth } from "../../../context/AuthContext";
import FilterPoinPelanggaranModal from "./FilterPoinPelanggaranModal";
import { useToast } from "../../../context/ToastContext";

export interface Pelanggaran {
  id_poin: number;
  jenis_penilaian: string;
  bobot: number;
  jenis_pelanggaran: string;
  is_active: boolean;
}

const PoinPelanggaran = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const { showSuccess, showError } = useToast();

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
      showSuccess(`Data "${row.jenis_pelanggaran}" berhasil dihapus.`);
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Gagal menghapus data.";
      showError(msg);
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
      <FilterPoinPelanggaranModal
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
              showSuccess("Data poin pelanggaran berhasil diperbarui!");
            }
          }}
          row={selectedRow}
        />
      )}
    </>
  );
};

export default PoinPelanggaran;
