import { useEffect, useState } from "react";
import axios from "../../../api/axios";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import { PencilIcon } from "../../../icons";
import DataTable, { Column } from "../../../components/ui/table/DataTable";
import EditDataPoinPelanggaran from "./EditDataPoinPelanggaran";

export interface Pelanggaran {
  id_poin: number;
  jenis_penilaian: string;
  bobot: number;
  jenis_pelanggaran: string;
  is_active: boolean;
}

const PoinPelanggaran = () => {
  const [data, setData] = useState<Pelanggaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Pelanggaran | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/poin-pelanggaran");
      setData(res.data.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
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
    {
      header: "Aksi",
      accessor: "id_poin",
      render: (row) => (
        <Button
          size="sm"
          variant="primary"
          startIcon={<PencilIcon className="size-4" />}
          onClick={() => handleEdit(row)}
        >
          Edit
        </Button>
      ),
      className: "text-center w-32",
    },
  ];

  return (
    <>
      <PageMeta
        title="Data Pelanggaran | Dashboard SMKN 1 Batam"
        description="Halaman menampilkan tabel data pelanggaran siswa"
      />
      <PageBreadcrumb pageTitle="Data Poin Pelanggaran" />
      <div className="space-y-6">
        <ComponentCard title="Tabel Poin Pelanggaran">
          {loading ? (
            <p className="text-center dark:text-gray-400">Loading...</p>
          ) : (
            <DataTable
              columns={columns}
              data={data}
              searchable
              filterable
              filterColumns={["jenis_pelanggaran", "bobot"]}
              paginated
              itemsPerPageOptions={[5, 10, 20, 50]}
              defaultItemsPerPage={10}
            />
          )}
        </ComponentCard>
      </div>

      {/* Popup Edit */}
      {selectedRow && (
        <EditDataPoinPelanggaran
          show={showEditPopup}
          onClose={() => {
            setShowEditPopup(false);
            setSelectedRow(null);
            fetchData(); // refresh tabel setelah edit
          }}
          row={selectedRow} // <-- kirim data row ke popup
        />
      )}
    </>
  );
};

export default PoinPelanggaran;
