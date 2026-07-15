import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import DataTable, { Column } from "../ui/table/DataTable";

interface ViolationRecord {
  id_pelanggaran: number;
  tanggal: string;
  jenis_pelanggaran: string;
  bobot: number;
  keterangan: string;
  nama_ptk: string;
  jenis_penilaian: string;
}

interface SiswaRiwayatPelanggaranProps {
  studentIdFromProp?: string;
  isDashboard?: boolean;
  isSelf?: boolean;
}

const SiswaRiwayatPelanggaran: React.FC<SiswaRiwayatPelanggaranProps> = ({
  studentIdFromProp,
  isDashboard = false,
  isSelf = true,
}) => {
  const { user } = useAuth();
  const [totalPoints, setTotalPoints] = useState(0);
  const [activeSanksi, setActiveSanksi] = useState("");
  const [violations, setViolations] = useState<ViolationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudentData = async () => {
      setLoading(true);
      try {
        let targetId = studentIdFromProp || "";

        // 1. Resolve student UUID if not provided
        if (!targetId && user) {
          const resSiswa = await axios.get("/siswa");
          const students = resSiswa.data?.data || resSiswa.data || [];
          const match = students.find(
            (s: any) =>
              s.nama?.toLowerCase() === user.nama?.toLowerCase() ||
              s.nisn === user.username,
          );
          if (match) {
            targetId = match.id_siswa;
            setTotalPoints(match.total_poin || 0);
          }
        } else if (targetId) {
          const resSiswa = await axios.get("/siswa");
          const students = resSiswa.data?.data || resSiswa.data || [];
          const match = students.find((s: any) => s.id_siswa === targetId);
          if (match) {
            setTotalPoints(match.total_poin || 0);
          }
        }

        if (targetId) {
          // 2. Fetch violation history
          const resViolations = await axios.get("/pelanggaran-siswa");
          const allViolations =
            resViolations.data?.data || resViolations.data || [];
          const filtered = allViolations
            .filter((v: any) => v.id_siswa === targetId)
            .map((v: any) => ({
              id_pelanggaran: v.id_pelanggaran,
              tanggal: v.tanggal,
              jenis_pelanggaran: v.jenis_pelanggaran,
              bobot: v.bobot || v.poin || 0,
              keterangan: v.keterangan,
              nama_ptk: v.nama_ptk,
              jenis_penilaian: v.jenis_penilaian || v.kategori || "-",
            }));
          setViolations(filtered);

          // 3. Fetch active sanksi / pembinaan status
          const resPembinaan = await axios.get(`/pembinaan/${targetId}`);
          const allPembinaan =
            resPembinaan.data?.data || resPembinaan.data || [];
          const activeMatch = allPembinaan.find(
            (p: any) => p.id_siswa === targetId && p.status_sanksi === "DIBINA",
          );
          if (activeMatch) {
            setActiveSanksi(activeMatch.nama_sanksi);
          } else {
            setActiveSanksi("Tidak Ada Sanksi Aktif");
          }
        }
      } catch (err) {
        console.error("Gagal memuat data pelanggaran siswa:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user || studentIdFromProp) {
      loadStudentData();
    }
  }, [user, studentIdFromProp]);

  const columns: Column<ViolationRecord>[] = [
    {
      header: "No",
      accessor: "id_pelanggaran",
      render: (_, idx) => (idx ?? 0) + 1,
      className: "w-12 text-center",
    },
    {
      header: "Tanggal",
      accessor: "tanggal",
      render: (row) =>
        row.tanggal
          ? new Date(row.tanggal).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "-",
      className: "w-28",
    },
    { header: "Pelanggaran", accessor: "jenis_pelanggaran" },
    { header: "Kategori", accessor: "jenis_penilaian", className: "w-32" },
    {
      header: "Poin",
      accessor: "bobot",
      render: (row) => (
        <span className="font-bold text-red-600 dark:text-red-400">
          {row.bobot}
        </span>
      ),
      className: "w-20 text-center",
    },
    { header: "Keterangan", accessor: "keterangan" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Memuat riwayat pelanggaran Anda...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title (Only if not on dashboard) */}
      {!isDashboard && (
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {isSelf ? "Riwayat Pelanggaran Saya" : "Riwayat Pelanggaran Siswa"}
        </h3>
      )}

      {/* Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accumulation Points Card */}
        <div className="rounded-2xl border border-[#FFE0E0] bg-[#FFF0F0] dark:border-[#5C2E2E]/40 dark:bg-[#3C1E1E]/20 p-6 flex flex-col justify-between shadow-sm">
          <span className="text-[#A92A2A] dark:text-[#E95A5A] uppercase text-xs font-bold tracking-wider mb-2">
            {isSelf
              ? "AKUMULASI POIN PELANGGARAN SAYA"
              : "AKUMULASI POIN PELANGGARAN SISWA"}
          </span>
          <div className="flex items-baseline mt-1">
            <span className="text-4xl md:text-5xl font-extrabold text-[#A92A2A] dark:text-[#E95A5A]">
              {totalPoints}
            </span>
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 ml-1">
              Pts
            </span>
          </div>
        </div>

        {/* Current Coaching Status Card */}
        <div className="rounded-2xl border border-[#FFF9C4] bg-[#FFFDEB] dark:border-[#5C532E]/40 dark:bg-[#3C381E]/20 p-6 flex flex-col justify-between shadow-sm">
          <span className="text-[#855D00] dark:text-[#E5B530] uppercase text-xs font-bold tracking-wider mb-3">
            STATUS PEMBINAAN TERKINI
          </span>
          <div className="mt-1">
            {activeSanksi === "Tidak Ada Sanksi Aktif" ? (
              <span className="inline-block bg-[#D97706] text-white font-bold rounded-lg px-4 py-2 text-sm shadow-sm">
                Tidak Ada Sanksi Aktif
              </span>
            ) : (
              <span className="inline-block bg-red-600 text-white font-bold rounded-lg px-4 py-2 text-sm shadow-sm animate-pulse">
                {activeSanksi} (Aktif)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chronology Section */}
      {!isDashboard && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-gray-800 dark:text-white">
            Kronologi Riwayat Pelanggaran
          </h4>

          {totalPoints === 0 || violations.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400 font-medium text-center">
                🎉 Bagus sekali! Kamu belum memiliki catatan pelanggaran.
                Pertahankan prestasimu!
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <DataTable
                columns={columns}
                data={violations}
                searchable={false}
                paginated={violations.length > 5}
                defaultItemsPerPage={5}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SiswaRiwayatPelanggaran;
