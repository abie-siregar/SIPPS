import React, { useEffect, useState } from "react";
import axios from "../../../../api/axios";
import Button from "../../../../components/ui/button/Button";

interface TambahProps {
  show: boolean;
  onClose: (didSave?: boolean) => void;
}

const TambahSanksiModal: React.FC<TambahProps> = ({ show, onClose }) => {
  const [namaSanksi, setNamaSanksi] = useState("");
  const [batasPoin, setBatasPoin] = useState<number | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setError("");
      setNamaSanksi("");
      setBatasPoin("");
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  const handleClose = (didSave = false) => {
    setIsVisible(false);
    setTimeout(() => onClose(didSave), 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSanksi.trim()) {
      setError("Nama sanksi harus diisi");
      return;
    }
    if (batasPoin === "" || batasPoin < 0) {
      setError("Batas poin harus diisi dengan angka positif");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await axios.post("/sanksi", {
        nama_sanksi: namaSanksi.trim(),
        batas_poin: Number(batasPoin),
      });
      handleClose(true);
    } catch (err: any) {
      console.error("Gagal menambahkan data sanksi:", err);
      setError(err?.response?.data?.error || "Gagal menyimpan data sanksi.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm relative">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Tambah Data Sanksi
            </h2>
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-white/90 mb-1">
                Nama Sanksi
              </label>
              <input
                type="text"
                placeholder="Contoh: Peringatan Tertulis"
                value={namaSanksi}
                onChange={(e) => setNamaSanksi(e.target.value)}
                className="w-full border px-3 py-1.5 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-white/90 mb-1">
                Batas Poin s/d
              </label>
              <input
                type="number"
                placeholder="Masukkan akumulasi sanksi..."
                value={batasPoin}
                onChange={(e) =>
                  setBatasPoin(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="w-full border px-3 py-1.5 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t mt-6">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={loading}
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

export default TambahSanksiModal;
