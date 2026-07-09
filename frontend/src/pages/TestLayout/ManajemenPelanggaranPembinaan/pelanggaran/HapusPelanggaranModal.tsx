import React, { useEffect, useState } from "react";
import axios from "../../../../api/axios";
import Button from "../../../../components/ui/button/Button";
import { Pelanggaran } from "./DataPelanggaran";

interface HapusModalProps {
  show: boolean;
  row: Pelanggaran | null;
  onClose: (didDelete?: boolean) => void;
}

const HapusPelanggaranModal: React.FC<HapusModalProps> = ({
  show,
  row,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (show && row) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [show, row]);
  if (!show || !row) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`/pelanggaran-siswa/${row.id_pelanggaran}`);
      onClose(true);
    } catch (err) {
      console.error("Gagal menghapus rekam pelanggaran:", err);
      alert("Gagal menghapus data pelanggaran.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300); // Sinkron durasi 300ms transisi fade-out
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      {/* Modal Box */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
        }`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            ⚠️ Konfirmasi Hapus Pelanggaran
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Apakah Anda yakin ingin menghapus rekam pelanggaran milik{" "}
            <strong>{row.nama_siswa}</strong> mengenai kasus{" "}
            <em>"{row.jenis_pelanggaran}"</em>? Tindakan ini tidak dapat
            dibatalkan.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-700">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onClose(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              {loading ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HapusPelanggaranModal;
