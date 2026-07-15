import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../../api/axios";

interface StudentReportRow {
  id_siswa: string;
  nama_siswa: string;
  nisn: string;
  rombel: string;
  semester: string;
  jurusan: string;
  walikelas: string;
  bk: string;
  saldo_poin: number;
}

const PrintRombel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRombelReport = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await axios.get(`/print-report?id_rombel=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data && res.data.length > 0) {
          setStudents(res.data);
        } else {
          setError("Tidak ada data siswa untuk rombel ini.");
        }
      } catch (err: any) {
        console.error("Gagal mengambil rekapitulasi rombel:", err);
        setError(
          "Gagal memuat rekapitulasi rombel. Pastikan Anda memiliki akses.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRombelReport();
  }, [id]);

  useEffect(() => {
    if (students.length > 0) {
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [students]);

  const rombelInfo = students[0] || null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
          Mempersiapkan rekapitulasi rombel...
        </p>
      </div>
    );
  }

  if (error || students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
        <div className="bg-red-50 text-red-700 px-6 py-4 rounded-xl border border-red-200 max-w-md shadow-sm">
          <p className="font-semibold text-lg mb-1">Terjadi Kesalahan</p>
          <p className="text-sm">
            {error || "Data rekapitulasi tidak dapat dimuat."}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition shadow-sm"
        >
          Kembali ke Halaman Sebelumnya
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans p-8 print:p-0 leading-relaxed">
      <div className="no-print mb-8 flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg font-medium transition text-sm shadow-sm"
          >
            ←
          </button>
          <span className="text-sm font-medium text-gray-500">Preview</span>
        </div>
        <button
          onClick={() => window.print()}
          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition text-sm shadow-sm flex items-center gap-2"
        >
          🖨️ Cetak
        </button>
      </div>

      <div className="max-w-6xl mx-auto border border-gray-200 print:border-none p-10 print:p-0 rounded-2xl shadow-md print:shadow-none bg-white">
        <div className="text-center mb-8 border-b border-gray-300 pb-4">
          <h1 className="text-xl font-bold uppercase tracking-wider text-gray-900">
            Daftar Rekapitulasi Poin Pelanggaran Siswa
          </h1>
        </div>

        {rombelInfo && (
          <div className="border border-gray-300 rounded-xl p-5 mb-8 bg-gray-50/50 flex flex-wrap justify-between gap-4 text-xs">
            <div className="space-y-2">
              <div>
                <span className="font-semibold text-gray-500 w-32 inline-block">
                  Kelas
                </span>
                <span className="mr-2">:</span>
                <span className="text-gray-900 font-bold">
                  {rombelInfo.rombel}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 w-32 inline-block">
                  Jurusan
                </span>
                <span className="mr-2">:</span>
                <span className="text-gray-900">{rombelInfo.jurusan}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-semibold text-gray-500 w-32 inline-block">
                  Semester
                </span>
                <span className="mr-2">:</span>
                <span className="text-gray-900">
                  {rombelInfo.semester || "Semua Semester"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 w-32 inline-block">
                  Wali Kelas
                </span>
                <span className="mr-2">:</span>
                <span className="text-gray-900 font-semibold">
                  {rombelInfo.walikelas}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mb-12">
          <table className="w-full text-left border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-300">
                <th className="p-3 border-r border-gray-300 w-12 text-center">
                  NO
                </th>
                <th className="p-3 border-r border-gray-300">NAMA SISWA</th>
                <th className="p-3 border-r border-gray-300 w-44">NISN</th>
                <th className="p-3 w-48 text-center">AKUMULASI POIN</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr
                  key={student.id_siswa}
                  className="border-b border-gray-300 hover:bg-gray-50/40"
                >
                  <td className="p-3 border-r border-gray-300 text-center font-medium">
                    {idx + 1}
                  </td>
                  <td className="p-3 border-r border-gray-300 font-semibold text-gray-800 uppercase">
                    {student.nama_siswa}
                  </td>
                  <td className="p-3 border-r border-gray-300 font-mono text-xs">
                    {student.nisn || "-"}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() =>
                        navigate(`/print-laporan/${student.id_siswa}`)
                      }
                      className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1.5 no-print"
                      title="Cetak Kartu Kendali Siswa"
                    >
                      {student.saldo_poin} Poin
                    </button>
                    <span className="hidden print:inline font-semibold">
                      {student.saldo_poin} Poin
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rombelInfo && (
          <div className="flex justify-end mt-16 text-center text-sm print:break-inside-avoid">
            <div className="mr-8">
              <p className="text-gray-500 mb-20">
                Mengetahui,
                <br />
                Wali Kelas
              </p>
              <p className="font-bold text-gray-900 border-b border-gray-400 pb-1 inline-block min-w-[200px]">
                {rombelInfo.walikelas}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Global Print-only Stylesheet */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          tr {
            break-inside: avoid !important;
          }
          td, th {
            padding: 8px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintRombel;
