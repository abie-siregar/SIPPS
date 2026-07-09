import { useEffect, useState } from "react";
import axios from "../../../../api/axios";
import DataTable, { Column } from "../../../../components/ui/table/DataTable";
import Button from "../../../../components/ui/button/Button";
import { useAuth } from "../../../../context/AuthContext";

import TambahSanksiModal from "./TambahSanksiModal";
import EditSanksiModal from "./EditSanksiModal";
import HapusSanksiModal from "./HapusSanksiModal";

export interface Sanksi {
  id_master_sanksi: number;
  nama_sanksi: string;
  batas_poin: number;
}

const DataSanksi = () => {
  const { user } = useAuth();
  const userRole = user?.role;
  const canModify = userRole === "Admin";

  const [data, setData] = useState<Sanksi[]>([]);
  const [loading, setLoading] = useState(true);

  // 🟢 State Management Modals
  const [showTambahModal, setShowTambahModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPoin, setSelectedPoin] = useState<Sanksi | null>(null);

  const [showHapusModal, setShowHapusModal] = useState(false);
  const [poinToDelete, setPoinToDelete] = useState<Sanksi | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/sanksi");
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

  // 🟢 Fungsi Pemicu Modal Edit
  const handleOpenEdit = (row: Sanksi) => {
    setSelectedPoin(row);
    setShowEditModal(true);
  };

  // 🟢 Fungsi Pemicu Modal Hapus
  const handleOpenHapus = (row: Sanksi) => {
    setPoinToDelete(row);
    setShowHapusModal(true);
  };

  const columns: Column<Sanksi>[] = [
    {
      header: "No",
      accessor: "id_master_sanksi",
      render: (_, idx) => (idx ?? 0) + 1,
      className: "w-12 text-center",
    },
    { header: "Nama Sanksi", accessor: "nama_sanksi" },
    {
      header: "Batas Poin",
      accessor: "batas_poin",
      render: (row) => `${row.batas_poin} Pts`,
    },
    ...(canModify
      ? [
          {
            header: "Aksi",
            accessor: "id_poin",
            className: "text-center w-40",
            render: (row: Sanksi) => (
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
          data={data}
          searchable
          paginated
          itemsPerPageOptions={[5, 10, 20, 50]}
          defaultItemsPerPage={10}
          extraActions={
            canModify ? (
              <Button
                size="sm"
                variant="primary"
                onClick={() => setShowTambahModal(true)}
              >
                + Tambah Poin
              </Button>
            ) : undefined
          }
        />
      )}

      {/* 1. Modal Tambah */}
      <TambahSanksiModal
        show={showTambahModal}
        onClose={(didSave) => {
          setShowTambahModal(false);
          if (didSave) {
            fetchData();
          }
        }}
      />

      {/* 2. Modal Edit */}
      <EditSanksiModal
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
      <HapusSanksiModal
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

export default DataSanksi;
