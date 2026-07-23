// File: src/pages/Pelanggaran/components/OrangTuaView.tsx
import { useEffect, useState } from "react";
import axios from "../../../../../api/axios";

interface PelanggaranAnak {
  id_pelanggaran: number;
  jenis_pelanggaran: string;
  bobot: number;
  tanggal: string;
  keterangan: string;
}

interface OrangTuaProps {
  parentId?: string | number;
}

const OrangTuaView: React.FC<OrangTuaProps> = ({ parentId }) => {
  const [riwayat, setRiwayat] = useState<PelanggaranAnak[]>([]);
  const [namaAnak, setNamaAnak] = useState<string>("");
  const [totalPoin, setTotalPoin] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnakData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/pelanggaran/orangtua/${parentId}`);
        setRiwayat(res.data?.riwayat || res.data || []);
        setNamaAnak(res.data?.nama_siswa || "Anak Anda");
        setTotalPoin(res.data?.total_poin || 0);
      } catch (err) {
        console.error("Gagal memuat data untuk Orang Tua:", err);
      } finally {
        setLoading(false);
      }
    };

    if (parentId) fetchAnakData();
  }, [parentId]);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">
        Memuat laporan kedisiplinan sekolah anak...
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header Info */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Laporan Perkembangan Kedisiplinan Siswa
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Nama Siswa:{" "}
          <span className="font-semibold text-gray-800 dark:text-white">
            {namaAnak}
          </span>
        </p>
      </div>

      {/* Total Points Dashboard Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Akumulasi Poin Pelanggaran Aktif
          </h4>
          <p className="text-3xl font-extrabold text-red-600 mt-1">
            {totalPoin} Pts
          </p>
        </div>
        <div className="text-right max-w-xs">
          <span
            className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
              totalPoin > 50
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            Status: {totalPoin > 50 ? "Butuh Perhatian Khusus" : "Kondisi Aman"}
          </span>
        </div>
      </div>

      {/* History Feed */}
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
          Catatan Log Kasus Sekolah
        </h3>
        {riwayat.length === 0 ? (
          <div className="p-8 bg-green-50/50 dark:bg-green-950/10 border border-green-100 dark:border-green-900/30 text-center text-sm text-green-700 rounded-xl">
            Siswa berperilaku sangat baik di lingkungan sekolah. Tidak ditemukan
            riwayat pelanggaran.
          </div>
        ) : (
          <div className="space-y-3">
            {riwayat.map((item) => {
              const [year, month, day] = item.tanggal.split("T")[0].split("-");
              return (
                <div
                  key={item.id_pelanggaran}
                  className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-start justify-between gap-4"
                >
                  <div>
                    <span className="text-xs text-gray-400">{`${day}-${month}-${year}`}</span>
                    <h5 className="font-semibold text-sm text-gray-900 dark:text-white mt-0.5">
                      {item.jenis_pelanggaran}
                    </h5>
                    {item.keterangan && (
                      <p className="text-xs text-gray-500 mt-1">
                        Catatan BK: {item.keterangan}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-red-500">
                    +{item.bobot} Poin
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrangTuaView;
