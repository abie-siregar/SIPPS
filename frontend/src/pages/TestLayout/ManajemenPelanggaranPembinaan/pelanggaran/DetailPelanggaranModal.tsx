import React, { useEffect, useState } from "react";
import Button from "../../../../components/ui/button/Button";
import { Pelanggaran } from "./DataPelanggaran";

interface DetailModalProps {
  show: boolean;
  row: Pelanggaran | null;
  onClose: () => void;
}

const DetailPelanggaranModal: React.FC<DetailModalProps> = ({
  show,
  row,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show && row) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [show, row]);

  // Kembalikan null jika rekam data kosong agar aman dari error pembacaan properti objek
  if (!show || !row) return null;

  // Format tanggal ISO menjadi format lokal Indonesia (contoh: 29 Juni 2026)
  const formatTanggal = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300); // Sinkron durasi 300ms transisi fade-out
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      <div
        className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
        }`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b pb-3 mb-4 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              Rincian Pelanggaran Siswa
            </h2>
            <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500 dark:text-gray-400">
              ID: #{row.id_pelanggaran}
            </span>
          </div>

          {/* Grid Informasi Utama */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-6">
            {/* Bagian Un-commented Profil Siswa */}
            <div className="space-y-3 bg-gray-50 dark:bg-gray-900/40 p-4 rounded-lg">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                Profil Siswa
              </h3>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Nama Lengkap
                </p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {row.nama_siswa}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">NISN</p>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  {row.nisn || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Kelas / Rombel
                </p>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  {row.nama_rombel} ({row.nama_jurusan})
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Wali Kelas
                </p>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  {row.walikelas}
                </p>
              </div>
            </div>

            {/* Kolom Kasus Pelanggaran */}
            <div className="space-y-3 bg-gray-50 dark:bg-gray-900/40 p-4 rounded-lg">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">
                Detail Kasus
              </h3>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Bentuk Pelanggaran
                </p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {row.jenis_pelanggaran}
                </p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Bobot Sanksi
                  </p>
                  <span className="inline-block mt-0.5 px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-bold">
                    {row.bobot} Poin
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Kategori Penilaian
                  </p>
                  <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-300 font-medium">
                    {row.jenis_penilaian}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Tanggal Kejadian
                </p>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  {formatTanggal(row.tanggal)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Periode Pelanggaran
                </p>
                <p className="font-medium text-gray-600 dark:text-gray-400 text-xs">
                  {row.nama_semester}
                </p>
              </div>
            </div>
          </div>

          {/* Baris Keterangan Tambahan & Pelapor */}
          <div className="space-y-4 border-t pt-4 dark:border-gray-700 text-sm">
            <div className="bg-amber-50/50 dark:bg-amber-950/10 p-3 rounded border border-amber-100 dark:border-amber-900/30">
              <p className="text-xs text-amber-700 dark:text-amber-400 font-bold mb-1">
                Kronologi / Keterangan Tambahan:
              </p>
              <p className="text-gray-700 dark:text-gray-300 italic">
                "{row.keterangan || "Tidak ada keterangan tambahan."}"
              </p>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <p>
                Pelapor:{" "}
                <strong className="text-gray-700 dark:text-gray-300">
                  {row.nama_ptk}
                </strong>{" "}
                ({row.nama_jabatan?.trim()})
              </p>
            </div>
          </div>

          {/* Footer Tombol Tutup */}
          <div className="flex justify-end pt-4 border-t mt-6 dark:border-gray-700">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleClose}
            >
              Tutup
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailPelanggaranModal;
