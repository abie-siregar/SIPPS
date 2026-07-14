import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

interface LaporanSiswa {
  id_siswa: string;
  nama_siswa: string;
  nisn: string;
  rombel: string;
  semester: string;
  jurusan: string;
  walikelas: string;
  bk: string;
  saldo_poin: number;
  riwayat_pelanggaran: Array<{
    tanggal: string;
    jenis_pelanggaran: string;
    poin: number;
    keterangan: string;
  }>;
  riwayat_pembinaan: Array<{
    tanggal: string;
    catatan_perkembangan: string;
    status_sanksi: string;
    tahap_akhir: string;
    guru_penamping: string;
    pelaksana_bk: string;
  }>;
}

const PrintLaporan: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<LaporanSiswa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLaporan = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/api/print-report?id_siswa=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data && res.data.length > 0) {
          setData(res.data[0]);
        } else {
          setError("Data siswa tidak ditemukan.");
        }
      } catch (err: any) {
        console.error("Gagal mengambil laporan siswa:", err);
        setError("Gagal memuat laporan. Pastikan Anda memiliki akses.");
      } finally {
        setLoading(false);
      }
    };

    fetchLaporan();
  }, [id]);

  useEffect(() => {
    if (data) {
      // Auto trigger print dialog after content is fully loaded
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const formatTanggal = (tanggalMentah: string) => {
    if (!tanggalMentah) return "-";
    try {
      const cleanDate = tanggalMentah.split("T")[0];
      const parts = cleanDate.split("-");
      if (parts.length !== 3) return cleanDate;
      const [year, month, day] = parts;
      return `${day}-${month}-${year}`;
    } catch {
      return tanggalMentah;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Mempersiapkan dokumen cetak...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
        <div className="bg-red-50 text-red-700 px-6 py-4 rounded-xl border border-red-200 max-w-md shadow-sm">
          <p className="font-semibold text-lg mb-1">Terjadi Kesalahan</p>
          <p className="text-sm">{error || "Data laporan tidak dapat dimuat."}</p>
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
      {/* Control Panel (Hidden during Print) */}
      <div className="no-print mb-8 flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg font-medium transition text-sm shadow-sm"
          >
            ← Kembali
          </button>
          <span className="text-sm font-medium text-gray-500">
            Preview Kartu Kendali Siswa
          </span>
        </div>
        <button
          onClick={() => window.print()}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition text-sm shadow-sm flex items-center gap-2"
        >
          🖨️ Cetak Sekarang
        </button>
      </div>

      {/* Printable Report Card Sheet */}
      <div className="max-w-5xl mx-auto border border-gray-200 print:border-none p-10 print:p-0 rounded-2xl shadow-md print:shadow-none bg-white">
        
        {/* Document Header */}
        <div className="text-center mb-8 border-b-2 border-double border-gray-400 pb-4">
          <h1 className="text-xl font-bold uppercase tracking-wider text-gray-900">
            Kartu Kendali Poin Pelanggaran & Pembinaan Siswa
          </h1>
          <p className="text-sm text-gray-600 font-medium mt-1">
            Semester: {data.semester || "Semua Semester"}
          </p>
        </div>

        {/* Student Biodata Summary Grid */}
        <div className="border border-gray-300 rounded-xl p-5 mb-8 bg-gray-50/50 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div className="space-y-2.5">
            <div className="flex">
              <span className="w-32 font-semibold text-gray-700">Nama Siswa</span>
              <span className="mr-2">:</span>
              <span className="text-gray-900 font-medium">{data.nama_siswa}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold text-gray-700">NISN</span>
              <span className="mr-2">:</span>
              <span className="text-gray-900 font-mono">{data.nisn || "-"}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold text-gray-700">Rombel</span>
              <span className="mr-2">:</span>
              <span className="text-gray-900">{data.rombel || "-"}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold text-gray-700">Jurusan</span>
              <span className="mr-2">:</span>
              <span className="text-gray-900">{data.jurusan || "-"}</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex">
              <span className="w-32 font-semibold text-gray-700">Wali Kelas</span>
              <span className="mr-2">:</span>
              <span className="text-gray-900">{data.walikelas || "-"}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold text-gray-700">Guru BK</span>
              <span className="mr-2">:</span>
              <span className="text-gray-900">{data.bk || "-"}</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-semibold text-gray-700">Total Saldo Poin</span>
              <span className="mr-2">:</span>
              <span className="text-red-600 font-bold text-base bg-red-50 border border-red-200/50 px-2 py-0.5 rounded">
                {data.saldo_poin} Poin
              </span>
            </div>
          </div>
        </div>

        {/* Section: Riwayat Pelanggaran */}
        <div className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 border-l-4 border-red-500 pl-2">
            Riwayat Pelanggaran
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-300">
                  <th className="p-3 border-r border-gray-300 w-1/5">TANGGAL</th>
                  <th className="p-3 border-r border-gray-300 w-2/5">JENIS PELANGGARAN</th>
                  <th className="p-3 border-r border-gray-300 w-1/12 text-center">POIN</th>
                  <th className="p-3">KETERANGAN</th>
                </tr>
              </thead>
              <tbody>
                {data.riwayat_pelanggaran.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-500 border-b border-gray-300 bg-gray-50/30">
                      🎉 Tidak ada data pelanggaran siswa yang tercatat.
                    </td>
                  </tr>
                ) : (
                  data.riwayat_pelanggaran.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-300 hover:bg-gray-50/40">
                      <td className="p-3 border-r border-gray-300 font-mono text-xs">{formatTanggal(item.tanggal)}</td>
                      <td className="p-3 border-r border-gray-300 text-gray-800">{item.jenis_pelanggaran}</td>
                      <td className="p-3 border-r border-gray-300 text-center font-semibold text-red-600">+{item.poin}</td>
                      <td className="p-3 text-gray-600 text-xs italic">{item.keterangan || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Riwayat Pembinaan */}
        <div className="mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 border-l-4 border-indigo-500 pl-2">
            Riwayat Pembinaan / Konseling
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-300">
                  <th className="p-3 border-r border-gray-300 w-1/5">TANGGAL PEMBINAAN</th>
                  <th className="p-3 border-r border-gray-300 w-3/5">TINDAKAN / CATATAN PERKEMBANGAN</th>
                  <th className="p-3">PELAKSANA BK</th>
                </tr>
              </thead>
              <tbody>
                {data.riwayat_pembinaan.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-gray-500 border-b border-gray-300 bg-gray-50/30">
                      Tidak ada catatan pembinaan/konseling yang tercatat.
                    </td>
                  </tr>
                ) : (
                  data.riwayat_pembinaan.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-300 hover:bg-gray-50/40">
                      <td className="p-3 border-r border-gray-300 font-mono text-xs">{formatTanggal(item.tanggal)}</td>
                      <td className="p-3 border-r border-gray-300 text-gray-800">
                        {item.tahap_akhir && (
                          <span className="font-semibold block mb-1 text-indigo-700 text-xs">
                            [{item.tahap_akhir}] {item.status_sanksi}
                          </span>
                        )}
                        <span className="text-gray-700">{item.catatan_perkembangan}</span>
                        {item.guru_penamping && (
                          <span className="block text-xs text-gray-400 mt-1 italic">
                            Pendamping: {item.guru_penamping}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-gray-800">{item.pelaksana_bk}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signature Box Section */}
        <div className="grid grid-cols-2 gap-12 mt-16 text-center text-sm print:break-inside-avoid">
          <div>
            <p className="text-gray-500 mb-16">Mengetahui,<br />Wali Kelas</p>
            <p className="font-semibold text-gray-900 border-b border-gray-400 pb-1 inline-block min-w-[200px]">
              {data.walikelas || "( ____________________ )"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-16">Mengetahui,<br />Guru BK</p>
            <p className="font-semibold text-gray-900 border-b border-gray-400 pb-1 inline-block min-w-[200px]">
              {data.bk || "( ____________________ )"}
            </p>
          </div>
        </div>

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

export default PrintLaporan;
