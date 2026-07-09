import React, { useEffect, useState } from "react";
import axios from "../../../../api/axios";
import Button from "../../../../components/ui/button/Button";
import { Sanksi } from "./DataSanksi";

interface HapusProps {
  show: boolean;
  row: Sanksi | null;
  onClose: (didDelete?: boolean) => void;
}

const HapusSanksiModal: React.FC<HapusProps> = ({ show, row, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show && row) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [show, row]);

  const handleClose = (didDelete = false) => {
    setIsVisible(false);
    setTimeout(() => onClose(didDelete), 300);
  };

  const handleDelete = async () => {
    if (!row) return;

    try {
      setLoading(true);
      await axios.delete(`/sanksi/${row.id_master_sanksi}`);
      handleClose(true);
    } catch (error) {
      console.error("Gagal menghapus kriteria sanksi:", error);
      alert("Gagal menghapus data kriteria sanksi.");
    } finally {
      setLoading(false);
    }
  };

  if (!show || !row) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-[999] transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => handleClose(false)}
      />

      {/* Container Modal */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-[1000] p-4 transition-all duration-300 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-sm p-6 relative">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            Konfirmasi Hapus Sanksi
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Apakah Anda yakin ingin menghapus tingkatan sanksi master{" "}
            <strong>{row.nama_sanksi}</strong> dengan ambang poin s/d{" "}
            <strong>{row.batas_poin}</strong>? Tindakan ini tidak dapat
            dibatalkan.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-700">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white border-none focus:ring-red-500"
            >
              {loading ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HapusSanksiModal;
