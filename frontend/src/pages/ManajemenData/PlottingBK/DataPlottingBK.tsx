import { useEffect, useState, useMemo } from "react";
import axios from "../../../api/axios";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import { PencilIcon, TrashBinIcon } from "../../../icons";
import DataTable, { Column } from "../../../components/ui/table/DataTable";
import Toast from "../../../components/ui/alert/Toast";
import ConfirmDialog from "../../../components/ui/modal/ConfirmDialog";
import { useAuth } from "../../../context/AuthContext";
import FilterPlottingBKModal from "./FilterPlottingBKModal";
import TambahDataPlottingBK from "./TambahDataPlottingBK";
import EditDataPlottingBK from "./EditDataPlottingBK";

export interface PlottingBK {
  id_plotting: number;
  id_ptk_bk: number;
  id_rombel: number;
  id_semester: number;
  nama: string;
  rombel: string;
  semester: string;
}

const DataPlottingBK = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [data, setData] = useState<PlottingBK[]>([]);
  const [loading, setLoading] = useState(true);

  // Popups & Dialogs
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<PlottingBK | null>(null);

  const [toast, setToast] = useState<{
    show: boolean;
    variant: "success" | "error";
    message: string;
  }>({ show: false, variant: "success", message: "" });

  const [confirmDelete, setConfirmDelete] = useState<{
    show: boolean;
    row: PlottingBK | null;
  }>({ show: false, row: null });

  // Filters
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState<string[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/plotting");
      const fetchedData = res.data?.data || res.data || [];
      setData(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (error) {
      console.error("Gagal mengambil data Plotting BK:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (row: PlottingBK) => {
    setSelectedRow(row);
    setShowEditPopup(true);
  };

  const handleDeleteClick = (row: PlottingBK) => {
    setConfirmDelete({ show: true, row });
  };

  const handleDeleteConfirm = async () => {
    const row = confirmDelete.row;
    if (!row) return;
    setConfirmDelete({ show: false, row: null });
    try {
      await axios.delete(`/plotting/${row.id_plotting}`);
      fetchData();
      setToast({
        show: true,
        variant: "success",
        message: `Plotting BK untuk rombel "${row.rombel}" berhasil dihapus.`,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Gagal menghapus data plotting.";
      setToast({ show: true, variant: "error", message: msg });
    }
  };

  // Process data for presentation
  const processedData = useMemo(() => {
    return data.map((row) => ({
      ...row,
      nama: row.nama ?? "-",
      rombel: row.rombel ?? "-",
      semester: row.semester ?? "-",
    }));
  }, [data]);

  // Extract unique filter options
  const availableGuru = useMemo(() => {
    const list = processedData
      .map((item) => item.nama)
      .filter((n) => n && n !== "-");
    return Array.from(new Set(list)).sort();
  }, [processedData]);

  const availableSemester = useMemo(() => {
    const list = processedData
      .map((item) => item.semester)
      .filter((s) => s && s !== "-");
    return Array.from(new Set(list)).sort();
  }, [processedData]);

  // Filter local data
  const filteredData = useMemo(() => {
    return processedData.filter((row) => {
      if (selectedGuru.length > 0 && !selectedGuru.includes(row.nama)) {
        return false;
      }
      if (selectedSemester.length > 0 && !selectedSemester.includes(row.semester)) {
        return false;
      }
      return true;
    });
  }, [processedData, selectedGuru, selectedSemester]);

  const filterValues = useMemo(
    () => ({
      selectedGuru,
      selectedSemester,
    }),
    [selectedGuru, selectedSemester]
  );

  const handleApplyFilters = (filters: typeof filterValues) => {
    setSelectedGuru(filters.selectedGuru);
    setSelectedSemester(filters.selectedSemester);
  };

  const columns: Column<PlottingBK>[] = [
    {
      header: "No",
      accessor: "id_plotting",
      render: (_row, rowIndex) => (rowIndex ?? 0) + 1,
      className: "text-center w-16",
    },
    { header: "Guru BK", accessor: "nama" },
    { header: "Rombongan Belajar", accessor: "rombel", className: "text-center" },
    { header: "Semester", accessor: "semester", className: "text-center" },
  ];

  if (isAdmin) {
    columns.push({
      header: "Aksi",
      accessor: "id_plotting",
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
      className: "text-center w-48",
    });
  }

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedGuru.length > 0) count++;
    if (selectedSemester.length > 0) count++;
    return count;
  }, [selectedGuru, selectedSemester]);

  return (
    <>
      <PageMeta
        title="Plotting BK | Dashboard SMKN 1 Batam"
        description="Halaman menampilkan tabel plotting guru BK terhadap rombel"
      />
      <PageBreadcrumb pageTitle="Plotting BK" />

      {/* Toast notifications */}
      <Toast
        show={toast.show}
        variant={toast.variant}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        show={confirmDelete.show}
        variant="danger"
        title="Hapus Plotting BK?"
        message={`Anda yakin ingin menghapus plotting untuk rombel "${confirmDelete.row?.rombel}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete({ show: false, row: null })}
      />

      {/* Filter Modal */}
      <FilterPlottingBKModal
        show={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        initialValues={filterValues}
        availableGuru={availableGuru}
        availableSemester={availableSemester}
      />

      {/* Add Popup */}
      <TambahDataPlottingBK
        show={showAddPopup}
        onClose={(didSave) => {
          setShowAddPopup(false);
          if (didSave) {
            fetchData();
            setToast({
              show: true,
              variant: "success",
              message: "Data Plotting BK berhasil ditambahkan!",
            });
          }
        }}
      />

      {/* Edit Popup */}
      {selectedRow && (
        <EditDataPlottingBK
          show={showEditPopup}
          onClose={(didSave) => {
            setShowEditPopup(false);
            setSelectedRow(null);
            if (didSave) {
              fetchData();
              setToast({
                show: true,
                variant: "success",
                message: "Data Plotting BK berhasil diperbarui!",
              });
            }
          }}
          row={selectedRow}
        />
      )}

      <div className="space-y-6">
        <ComponentCard title="Tabel Plotting Guru BK">
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
                      onClick={() => setShowAddPopup(true)}
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
    </>
  );
};

export default DataPlottingBK;
