import { useEffect, useState, useMemo } from "react";
import axios from "../../../api/axios";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import { PencilIcon, TrashBinIcon } from "../../../icons";
import DataTable, { Column } from "../../../components/ui/table/DataTable";
import AddEditSanksiModal, { Sanksi } from "./AddEditSanksiModal";
import FilterSanksiModal from "./FilterSanksiModal";
import ConfirmDialog from "../../../components/ui/modal/ConfirmDialog";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

const DataSanksi = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const { showSuccess, showError } = useToast();

  const [data, setData] = useState<Sanksi[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Sanksi | null>(null);

  // Filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [minPoin, setMinPoin] = useState<number | "">("");
  const [maxPoin, setMaxPoin] = useState<number | "">("");

  const [confirmDelete, setConfirmDelete] = useState<{
    show: boolean;
    row: Sanksi | null;
  }>({ show: false, row: null });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/sanksi");
      const fetchedData = res.data.data || res.data || [];
      setData(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (error) {
      console.error("Gagal mengambil data sanksi:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setSelectedRow(null);
    setShowAddEditModal(true);
  };

  const handleEdit = (row: Sanksi) => {
    setSelectedRow(row);
    setShowAddEditModal(true);
  };

  const handleDeleteClick = (row: Sanksi) => {
    setConfirmDelete({ show: true, row });
  };

  const handleDeleteConfirm = async () => {
    const row = confirmDelete.row;
    if (!row) return;
    setConfirmDelete({ show: false, row: null });
    try {
      await axios.delete(`/sanksi/${row.id_master_sanksi}`);
      fetchData();
      showSuccess(`Data sanksi "${row.nama_sanksi}" berhasil dihapus.`);
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Gagal menghapus data sanksi.";
      showError(msg);
    }
  };

  // Compute local filteredData
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (minPoin !== "" && row.batas_poin < Number(minPoin)) {
        return false;
      }
      if (maxPoin !== "" && row.batas_poin > Number(maxPoin)) {
        return false;
      }
      return true;
    });
  }, [data, minPoin, maxPoin]);

  const filterValues = useMemo(
    () => ({
      minPoin,
      maxPoin,
    }),
    [minPoin, maxPoin],
  );

  const handleApplyFilters = (filters: typeof filterValues) => {
    setMinPoin(filters.minPoin);
    setMaxPoin(filters.maxPoin);
  };

  const columns: Column<Sanksi>[] = [
    {
      header: "No",
      accessor: "id_master_sanksi",
      render: (_row, rowIndex) => (rowIndex ?? 0) + 1,
      className: "text-center w-16",
    },
    { header: "Nama Sanksi", accessor: "nama_sanksi" },
    {
      header: "Batas Poin",
      accessor: "batas_poin",
      className: "text-center w-32",
    },
  ];

  if (isAdmin) {
    columns.push({
      header: "Aksi",
      accessor: "id_master_sanksi",
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

  // Active filter badge count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (minPoin !== "" || maxPoin !== "") count++;
    return count;
  }, [minPoin, maxPoin]);

  return (
    <>
      <PageMeta
        title="Data Sanksi | Dashboard SMKN 1 Batam"
        description="Halaman menampilkan tabel data sanksi"
      />
      <PageBreadcrumb pageTitle="Data Sanksi" />

      {/* Confirm delete dialog */}
      <ConfirmDialog
        show={confirmDelete.show}
        variant="danger"
        title="Hapus Data Sanksi?"
        message={`Anda yakin ingin menghapus sanksi "${confirmDelete.row?.nama_sanksi}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete({ show: false, row: null })}
      />

      {/* Filter Modal */}
      <FilterSanksiModal
        show={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        initialValues={filterValues}
      />

      {/* Add / Edit Modal */}
      <AddEditSanksiModal
        show={showAddEditModal}
        onClose={(didSave) => {
          setShowAddEditModal(false);
          setSelectedRow(null);
          if (didSave) {
            fetchData();
          }
        }}
        row={selectedRow}
      />

      <div className="space-y-6">
        <ComponentCard title="Tabel Data Sanksi">
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
                    <Button size="sm" variant="primary" onClick={handleAdd}>
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

export default DataSanksi;
