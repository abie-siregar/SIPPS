import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../../../api/axios";
import DataTable, { Column } from "../../../../../components/ui/table/DataTable";
import ComponentCard from "../../../../../components/common/ComponentCard";
import Button from "../../../../../components/ui/button/Button";

export interface Pembinaan {
  id_sanksi_siswa: number;
  id_siswa: string;
  nama: string;
  nama_rombel: string;
  nama_sanksi: string;
  tanggal_sanksi: string;
  status_sanksi: string;
  tahap_akhir: string;
  id_progres: number;
}

const DataPembinaan = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Pembinaan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/pembinaan");
      const rawData = res.data.data || res.data || [];
      const uniqueDataMap = new Map<string, Pembinaan>();
      rawData.forEach((item: Pembinaan) => {
        const key = item.id_siswa;
        if (!uniqueDataMap.has(key)) {
          uniqueDataMap.set(key, item);
        } else {
          const existing = uniqueDataMap.get(key)!;
          if (item.id_sanksi_siswa > existing.id_sanksi_siswa) {
            uniqueDataMap.set(key, item);
          }
        }
      });
      setData(Array.from(uniqueDataMap.values()));
    } catch (err) {
      console.error("Gagal mengambil data pembinaan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: Column<Pembinaan>[] = [
    {
      header: "No",
      accessor: "id_sanksi_siswa",
      render: (_, idx) => (idx ?? 0) + 1,
      className: "w-12 text-center",
    },
    { header: "Nama Siswa", accessor: "nama", className: "w-48" },
    { header: "Rombel", accessor: "nama_rombel", className: "w-24" },
    {
      header: "Sanksi Akibat Poin",
      accessor: "nama_sanksi",
      className: "w-40",
    },
    {
      header: "Tahap Akhir",
      accessor: "tahap_akhir",
      className: "w-32 text-center",
    },
    {
      header: "Status",
      accessor: "status_sanksi",
      className: "w-28 text-center",
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            row.status_sanksi === "Selesai"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
          }`}
        >
          {row.status_sanksi || "Proses"}
        </span>
      ),
    },
    {
      header: "Aksi",
      accessor: "id_sanksi_siswa",
      className: "text-center w-36",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-900/50"
            onClick={() =>
              navigate(`/detail-pembinaan/${row.id_sanksi_siswa}`, {
                state: { nama_sanksi: row.nama_sanksi },
              })
            }
          >
            Detail
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <ComponentCard title="Daftar Pembinaan Masuk">
        {loading ? (
          <p className="text-center dark:text-gray-400 py-4">
            Loading data pembinaan...
          </p>
        ) : (
          <DataTable columns={columns} data={data} searchable paginated />
        )}
      </ComponentCard>
    </>
  );
};

export default DataPembinaan;
