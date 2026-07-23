import { useEffect, useState, useMemo } from "react";
import axios from "../../../../api/axios";
import DataTable, { Column } from "../../../../components/ui/table/DataTable";
import Button from "../../../../components/ui/button/Button";
import { useAuth } from "../../../../context/AuthContext";

import TambahPoinModal from "./TambahPoinModal";
import EditPoinModal from "./EditPoinModal";
import HapusPoinModal from "./HapusPoinModal";
import FilterPoinPelanggaranModal from "../../PoinPelanggaran/FilterPoinPelanggaranModal";

export interface PoinPelanggaran {
  id_poin: number;
  jenis_penilaian: string;
  jenis_pelanggaran: string;
  bobot: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const DataPoin = () => {
  const { user } = useAuth();
  const userRole = user?.role;

  const canModify = userRole === "Admin";

  const [data, setData] = useState<PoinPelanggaran[]>([]);
  const [loading, setLoading] = useState(true);

  // 🟢 Filter State Management
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedJenisPenilaian, setSelectedJenisPenilaian] = useState<string[]>([]);
  const [minBobot, setMinBobot] = useState<number | "">("");
  const [maxBobot, setMaxBobot] = useState<number | "">("");

  // 🟢 State Management Modals
  const [showTambahModal, setShowTambahModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPoin, setSelectedPoin] = useState<PoinPelanggaran | null>(
    null,
  );

  const [showHapusModal, setShowHapusModal] = useState(false);
  const [poinToDelete, setPoinToDelete] = useState<PoinPelanggaran | null>(
    null,
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/poin-pelanggaran");
      setData(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Local Data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        selectedJenisPenilaian.length > 0 &&
        !selectedJenisPenilaian.includes(item.jenis_penilaian)
      ) {
        return false;
      }
      if (minBobot !== "" && item.bobot < Number(minBobot)) {
        return false;
      }
      if (maxBobot !== "" && item.bobot > Number(maxBobot)) {
        return false;
      }
      return true;
    });
  }, [data, selectedJenisPenilaian, minBobot, maxBobot]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedJenisPenilaian.length > 0) count++;
    if (minBobot !== "") count++;
    if (maxBobot !== "") count++;
    return count;
  }, [selectedJenisPenilaian, minBobot, maxBobot]);

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

  // 🟢 Fungsi Pemicu Modal Edit
  const handleOpenEdit = (row: PoinPelanggaran) => {
    setSelectedPoin(row);
    setShowEditModal(true);
  };

  const handleOpenHapus = (row: PoinPelanggaran) => {
    setPoinToDelete(row);
    setShowHapusModal(true);
  };

  const columns: Column<PoinPelanggaran>[] = [
    {
      header: "No",
      accessor: "id_poin",
      render: (_, idx) => (idx ?? 0) + 1,
      className: "w-12 text-center",
    },
    { header: "Penilaian", accessor: "jenis_penilaian" },
    { header: "Jenis Pelanggaran", accessor: "jenis_pelanggaran" },
    { header: "Bobot", accessor: "bobot", render: (row) => `${row.bobot} Pts` },
    {
      header: "Status",
      accessor: "is_active",
      render: (row) => (row.is_active ? "Aktif" : "Tidak Aktif"),
    },
    ...(canModify
      ? [
          {
            header: "Aksi",
            accessor: "id_poin",
            className: "text-center w-40",
            render: (row: PoinPelanggaran) => (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-blue-950/30"
                  onClick={() => handleOpenEdit(row)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-950/30"
                  onClick={() => handleOpenHapus(row)}
                >
                  Hapus
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      {loading ? (
        <p className="dark:text-gray-400 text-center py-4">
          Loading data master poin...
        </p>
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
              >
                🔍 Filter
                {activeFiltersCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-white text-blue-600 rounded-full font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              {canModify && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setShowTambahModal(true)}
                >
                  + Tambah Poin
                </Button>
              )}
            </div>
          }
        />
      )}

      {/* Filter Modal */}
      <FilterPoinPelanggaranModal
        show={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        initialValues={filterValues}
      />

      {/* 1. Modal Tambah */}
      <TambahPoinModal
        show={showTambahModal}
        onClose={(didSave) => {
          setShowTambahModal(false);
          if (didSave) {
            fetchData();
          }
        }}
      />

      {/* 2. Modal Edit */}
      <EditPoinModal
        show={showEditModal && selectedPoin !== null}
        row={selectedPoin!}
        onClose={(didSave) => {
          setShowEditModal(false);
          setSelectedPoin(null);
          if (didSave) {
            fetchData();
          }
        }}
      />

      {/* 3. Modal Hapus */}
      <HapusPoinModal
        show={showHapusModal && poinToDelete !== null}
        row={poinToDelete!}
        onClose={(didDelete) => {
          setShowHapusModal(false);
          setPoinToDelete(null);
          if (didDelete) {
            fetchData();
          }
        }}
      />
    </>
  );
};

export default DataPoin;
