import { useEffect, useState } from "react";
import axios from "../../../../api/axios";
import DataTable, { Column } from "../../../../components/ui/table/DataTable";
import ComponentCard from "../../../../components/common/ComponentCard";
import Button from "../../../../components/ui/button/Button";

import TambahPelanggaran from "./TambahPelanggaran";
import DetailPelanggaranModal from "./DetailPelanggaranModal";
// 🟢 1. Import Modal Hapus yang baru dibuat
import HapusPelanggaranModal from "./HapusPelanggaranModal";

export interface Pelanggaran {
  id_pelanggaran: string | number;
  id_siswa: string;
  id_poin: number;
  id_ptk: string;
  id_semester: number;
  tanggal: string;
  keterangan: string;
  jenis_penilaian: string;
  jenis_pelanggaran: string;
  bobot: number;
  nama_ptk: string;
  nama_jabatan: string;
  nama_siswa: string;
  nisn: string;
  nama_semester: string;
  walikelas: string;
  nama_rombel: string;
  nama_jurusan: string;
}

const DataPelanggaran = () => {
  const [data, setData] = useState<Pelanggaran[]>([]);
  const [loading, setLoading] = useState(true);

  const [showTambahModal, setShowTambahModal] = useState(false);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPelanggaran, setSelectedPelanggaran] =
    useState<Pelanggaran | null>(null);

  // 🟢 2. State baru untuk mengontrol Modal Hapus
  const [showHapusModal, setShowHapusModal] = useState(false);
  const [pelanggaranToDelete, setPelanggaranToDelete] =
    useState<Pelanggaran | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/pelanggaran-siswa");
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

  const handleOpenDetail = (row: Pelanggaran) => {
    setSelectedPelanggaran(row);
    setShowDetailModal(true);
  };

  // 🟢 3. Fungsi memicu pembukaan Modal Hapus
  const handleOpenHapus = (row: Pelanggaran) => {
    setPelanggaranToDelete(row);
    setShowHapusModal(true);
  };

  const columns: Column<Pelanggaran>[] = [
    {
      header: "No",
      accessor: "id_pelanggaran",
      render: (_, idx) => (idx ?? 0) + 1,
      className: "w-12 text-center",
    },
    { header: "Siswa", accessor: "nama_siswa" },
    { header: "Jenis Pelanggaran", accessor: "jenis_pelanggaran" },
    { header: "Bobot", accessor: "bobot", render: (row) => `${row.bobot} Pts` },
    { header: "Pelapor (PTK)", accessor: "nama_ptk" },
    {
      header: "Aksi",
      accessor: "id_pelanggaran",
      // 🟢 4. Ukuran lebar kolom aksi dinaikkan sedikit agar memuat 2 tombol sejajar
      className: "text-center w-40",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-blue-950/30"
            onClick={() => handleOpenDetail(row)}
          >
            Detail
          </Button>
          {/* 🟢 5. Tambahkan Tombol Hapus */}
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
  ];

  return (
    <>
      <ComponentCard title="Daftar Rekam Pelanggaran">
        {loading ? (
          <p className="dark:text-gray-400 text-center py-4">
            Loading data pelanggaran...
          </p>
        ) : (
          <DataTable
            columns={columns}
            data={data}
            searchable
            paginated
            extraActions={
              <Button
                size="sm"
                variant="primary"
                onClick={() => setShowTambahModal(true)}
              >
                + Tambah Pelanggaran
              </Button>
            }
          />
        )}
      </ComponentCard>

      <TambahPelanggaran
        show={showTambahModal}
        onClose={(didSave) => {
          setShowTambahModal(false);
          if (didSave) {
            fetchData();
          }
        }}
      />

      <DetailPelanggaranModal
        show={showDetailModal}
        row={selectedPelanggaran}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedPelanggaran(null);
        }}
      />

      {/* 🟢 6. Render HapusPelanggaranModal di bawah sini */}
      <HapusPelanggaranModal
        show={showHapusModal}
        row={pelanggaranToDelete}
        onClose={(didDelete) => {
          setShowHapusModal(false);
          setPelanggaranToDelete(null); // Bersihkan state penampung
          if (didDelete) {
            fetchData(); // Refresh list data tabel setelah berhasil dihapus
          }
        }}
      />
    </>
  );
};

export default DataPelanggaran;
