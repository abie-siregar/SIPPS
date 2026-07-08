import { useEffect, useState } from "react";
import axios from "../../../../api/axios";
import DataTable, { Column } from "../../../../components/ui/table/DataTable";
import ComponentCard from "../../../../components/common/ComponentCard";
import Button from "../../../../components/ui/button/Button";

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
  const [data, setData] = useState<Pembinaan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/pembinaan");
      setData(res.data.data || res.data || []);
    } catch (err) {
      console.error("Gagal mengambil data pembinaan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelesaikanPembinaan = async (idSanksoSiswa: number) => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menyelesaikan masa pembinaan siswa ini?",
      )
    ) {
      try {
        await axios.patch(`/pembinaan/${idSanksoSiswa}`, {
          status_sanksi: "Selesai",
        });
        fetchData(); // Refresh data setelah berhasil update
      } catch (err) {
        console.error("Gagal memperbarui status pembinaan:", err);
      }
    }
  };

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
          {row.status_sanksi !== "Selesai" ? (
            <Button
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-900/50"
              onClick={() => handleSelesaikanPembinaan(row.id_sanksi_siswa)}
            >
              ✓ Selesai
            </Button>
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Tidak ada aksi
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <ComponentCard title="Daftar Pembinaan Masuk">
      {loading ? (
        <p className="text-center dark:text-gray-400 py-4">
          Loading data pembinaan...
        </p>
      ) : (
        <DataTable columns={columns} data={data} searchable paginated />
      )}
    </ComponentCard>
  );
};

export default DataPembinaan;
