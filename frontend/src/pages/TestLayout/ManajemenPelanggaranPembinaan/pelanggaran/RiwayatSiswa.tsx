// File: src/pages/PelanggaranPembinaan/pelanggaran/RiwayatSiswa.tsx
import { useEffect, useState } from "react";
import axios from "../../../../api/axios";

interface RiwayatPersonal {
  id_pelanggaran: number;
  jenis_pelanggaran: string;
  poin: number;
  tanggal: string;
  keterangan: string;
  status_sanksi?: string; // Menampung hasil merge
}

interface StatusPembinaan {
  id_progres: number;
  id_sanksi_siswa: number;
  id_siswa: string;
  id_master_sanksi: number;
  id_semester: number;
  tanggal: string;
  status_sanksi: string;
  tahap_akhir: string;
}

interface SiswaProps {
  siswaId?: string | number;
}

const RiwayatSiswa: React.FC<SiswaProps> = ({ siswaId }) => {
  const [riwayat, setRiwayat] = useState<RiwayatPersonal[]>([]);
  const [totalPoin, setTotalPoin] = useState<number>(0);
  const [statusTerakhir, setStatusTerakhir] = useState<string>(""); // Menyimpan status pembinaan global terbaru
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSiswaData = async () => {
      if (!siswaId) return;

      setLoading(true);
      try {
        // 🔄 Ambil ketiga data secara paralel
        const [resPelanggaran, resProfilSiswa, resRiwayatSanksi] =
          await Promise.all([
            axios.post(`/pelanggaran-siswa/${siswaId}`),
            axios.post(`/siswa/${siswaId}`),
            axios.post(`/pembinaan/${siswaId}`),
          ]);

        // 1. Ambil & Validasi Array Pelanggaran
        let pelanggaranArray: RiwayatPersonal[] = [];
        if (resPelanggaran.data) {
          if (Array.isArray(resPelanggaran.data)) {
            pelanggaranArray = resPelanggaran.data;
          } else if (Array.isArray(resPelanggaran.data.data)) {
            pelanggaranArray = resPelanggaran.data.data;
          } else if (Array.isArray(resPelanggaran.data.riwayat)) {
            pelanggaranArray = resPelanggaran.data.riwayat;
          }
        }

        // 2. Ambil & Validasi Array Sanksi/Pembinaan
        let sanksiArray: StatusPembinaan[] = [];
        if (resRiwayatSanksi.data) {
          if (Array.isArray(resRiwayatSanksi.data)) {
            sanksiArray = resRiwayatSanksi.data;
          } else if (Array.isArray(resRiwayatSanksi.data.data)) {
            sanksiArray = resRiwayatSanksi.data.data;
          }
        }

        // Ambil status pembinaan paling terbaru untuk dipajang di header profil
        if (sanksiArray.length > 0) {
          setStatusTerakhir(
            sanksiArray[0].status_sanksi || sanksiArray[0].tahap_akhir || "",
          );
        }

        // 3. LOGIKA MERGING: Menggabungkan data berdasarkan tanggal atau index terdekat
        // Karena data pembinaan dipicu oleh total akumulasi poin, kita cocokkan
        // status sanksi ke pelanggaran pada tanggal yang sama atau urutan kronologisnya.
        const mergedRiwayat = pelanggaranArray.map((pelanggaran) => {
          const tglPelanggaran = pelanggaran.tanggal?.split("T")[0];

          // Cari sanksi yang keluar pada tanggal yang sama dengan pelanggaran ini
          const sanksiTerkait = sanksiArray.find(
            (s) => s.tanggal?.split("T")[0] === tglPelanggaran,
          );

          return {
            ...pelanggaran,
            // Jika ada sanksi di tanggal tersebut pakai itu, jika tidak ada kosongkan
            status_sanksi: sanksiTerkait
              ? sanksiTerkait.status_sanksi
              : undefined,
          };
        });

        setRiwayat(mergedRiwayat);

        // 4. Set Total Poin
        const poinSiswa =
          resProfilSiswa.data?.total_poin ??
          resProfilSiswa.data?.data?.total_poin ??
          0;
        setTotalPoin(poinSiswa);
      } catch (err) {
        console.error("Gagal memuat data personal siswa:", err);
        setRiwayat([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSiswaData();
  }, [siswaId]);

  const formatTanggal = (tanggalMentah: string) => {
    if (!tanggalMentah) return "--/--/----";
    try {
      const cleanDate = tanggalMentah.split("T")[0];
      const parts = cleanDate.split("-");
      if (parts.length !== 3) return cleanDate;
      const [year, month, day] = parts;
      return `${day}-${month}-${year}`;
    } catch (e) {
      return "--/--/----";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-center">
        <div className="space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Memuat rapor kedisiplinan saya...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Box Akumulasi Poin & Status Sanksi Global */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-950/20 dark:to-orange-950/10 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-red-800 dark:text-red-400 text-sm uppercase tracking-wider">
            Akumulasi Poin Pelanggaran Saya
          </h3>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold text-red-600 dark:text-red-500">
              {totalPoin}
            </span>
            <span className="text-sm font-medium text-gray-500 ml-1">Pts</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-950/20 dark:to-yellow-950/10 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-amber-800 dark:text-amber-400 text-sm uppercase tracking-wider">
            Status Pembinaan Terkini
          </h3>
          <div className="mt-3">
            <span className="px-3 py-1 bg-amber-600 text-white dark:bg-amber-500 font-bold text-sm rounded-lg shadow-sm inline-block">
              {statusTerakhir || "Tidak Ada Sanksi Aktif"}
            </span>
          </div>
        </div>
      </div>

      {/* Kronologi Riwayat */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Kronologi Riwayat Pelanggaran
        </h2>

        {!Array.isArray(riwayat) || riwayat.length === 0 ? (
          <div className="p-8 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-center text-gray-400">
            🎉 Bagus sekali! Kamu belum memiliki catatan pelanggaran.
            Pertahankan prestasimu!
          </div>
        ) : (
          <div className="relative border-l border-gray-200 dark:border-gray-800 pl-4 ml-2 space-y-6">
            {riwayat.map((item, idx) => {
              return (
                <div key={item.id_pelanggaran || idx} className="relative">
                  <span className="absolute -left-[21px] top-1 bg-red-500 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900" />

                  <div className="p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-xl">
                    <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
                      {formatTanggal(item.tanggal)}
                    </span>
                    <div className="flex items-start justify-between gap-4 mt-1">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                        {item.jenis_pelanggaran || "Pelanggaran Tanpa Nama"}
                      </h4>

                      {/* Flex Container Kiri-Kanan: Poin berdampingan dengan Status Sanksi */}
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold text-xs rounded whitespace-nowrap">
                          +{item.poin || 0} Pts
                        </span>

                        {/* Status Sanksi Hasil Merging */}
                        {item.status_sanksi && (
                          <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-semibold text-xs rounded whitespace-nowrap">
                            ⚠️ {item.status_sanksi}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.keterangan && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-gray-900/40 p-2 rounded">
                        Keterangan: {item.keterangan}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiwayatSiswa;
