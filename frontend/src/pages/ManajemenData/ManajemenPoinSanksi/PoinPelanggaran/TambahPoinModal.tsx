import React, { useEffect, useState } from "react";
import axios from "../../../../api/axios";
import Button from "../../../../components/ui/button/Button";
import Toast from "../../../../components/ui/alert/Toast";

interface TambahModalProps {
  show: boolean;
  onClose: (didSave?: boolean) => void;
}

const TambahPoinModal: React.FC<TambahModalProps> = ({ show, onClose }) => {
  const [jenisPenilaian, setJenisPenilaian] = useState("Kelakuan");
  const [jenisPelanggaran, setJenisPelanggaran] = useState("");
  const [bobot, setBobot] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Toast state lokal modal
  const [toast, setToast] = useState<{
    show: boolean;
    variant: "success" | "error";
    message: string;
  }>({ show: false, variant: "success", message: "" });

  const showToast = (variant: "success" | "error", message: string) => {
    setToast({ show: true, variant, message });
  };

  // 🔄 Sinkronisasi animasi transisi masuk/keluar modal
  useEffect(() => {
    if (show) {
      setTimeout(() => setIsVisible(true), 10);
      setToast({ show: false, variant: "success", message: "" });
    } else {
      setIsVisible(false);
      // Reset form input ketika modal ditutup
      setJenisPenilaian("Kelakuan");
      setJenisPelanggaran("");
      setBobot("");
    }
  }, [show]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(false), 300); // Sinkron dengan durasi CSS transition 300ms
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !jenisPelanggaran.trim() ||
      bobot === "" ||
      isNaN(Number(bobot)) ||
      !jenisPenilaian
    ) {
      showToast(
        "error",
        "Semua field wajib diisi dan bobot harus berupa angka.",
      );
      return;
    }

    try {
      setLoading(true);
      await axios.post("/poin-pelanggaran", {
        jenis_penilaian: jenisPenilaian,
        jenis_pelanggaran: jenisPelanggaran.trim(),
        bobot: Number(bobot),
      });

      setIsVisible(false);
      setTimeout(() => onClose(true), 300); // Kirim flag `true` untuk refresh data table utama
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || "Gagal menambahkan data master poin.";
      showToast("error", msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <>
      {/* Toast Notification */}
      <Toast
        show={toast.show}
        variant={toast.variant}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      {/* Backdrop Latar Belakang Gelap (z-[999] agar AppSidebar aman) */}
      <div
        className={`fixed inset-0 bg-black/40 z-[999] transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Kontainer Wrapper Modal (z-[1000] mengunci layout atas) */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-[1000] p-4 transition-all duration-300 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-xl p-6 relative max-h-[90vh] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2">
            Tambah Master Poin Pelanggaran
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Jenis Penilaian */}
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                Jenis Penilaian
              </label>
              <select
                value={jenisPenilaian}
                onChange={(e) => setJenisPenilaian(e.target.value)}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Kelakuan">Kelakuan</option>
                <option value="Kerajinan">Kerajinan</option>
                <option value="Kerapian">Kerapian</option>
              </select>
            </div>

            {/* Jenis Pelanggaran */}
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                Jenis Pelanggaran
              </label>
              <textarea
                value={jenisPelanggaran}
                onChange={(e) => setJenisPelanggaran(e.target.value)}
                rows={3}
                placeholder="Masukkan deskripsi bentuk pelanggaran master..."
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {/* Bobot */}
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                Bobot Poin
              </label>
              <input
                type="number"
                min={1}
                value={bobot}
                onChange={(e) =>
                  setBobot(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="Masukkan bobot angka sanksi"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {/* Tombol Aksi Mandiri */}
            <div className="flex justify-end gap-2 pt-2 border-t mt-4">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleClose}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default TambahPoinModal;
