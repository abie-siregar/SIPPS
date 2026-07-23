import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import Button from "../../../components/ui/button/Button";
import { Users } from "./DataUsers";
import { useToast } from "../../../context/ToastContext";

interface HapusProps {
  show: boolean;
  row: Users | null;
  onClose: (didDelete?: boolean) => void;
}

const HapusUserModal: React.FC<HapusProps> = ({ show, row, onClose }) => {
  const { showSuccess, showError } = useToast();
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

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(false), 300);
  };

  const handleDelete = async () => {
    const userId = row.id_user || row.id;
    if (!userId) return;

    setLoading(true);
    try {
      await axios.delete(`/user/${userId}`);
      showSuccess(`Pengguna "${row.nama}" berhasil dihapus.`);
      setIsVisible(false);
      setTimeout(() => onClose(true), 300);
    } catch (error: any) {
      console.error("Gagal menghapus user:", error);
      const msg = error?.response?.data?.error || "Gagal menghapus pengguna.";
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-[999] transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />
      <div
        className={`fixed inset-0 flex items-center justify-center z-[1000] p-4 transition-all duration-300 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            Konfirmasi Hapus
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Apakah Anda yakin ingin menghapus akun milik{" "}
            <strong>{row.nama}</strong> ({row.username})? Tindakan ini bersifat
            permanen.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-700">
            <Button
              size="sm"
              variant="outline"
              onClick={handleClose}
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

export default HapusUserModal;
