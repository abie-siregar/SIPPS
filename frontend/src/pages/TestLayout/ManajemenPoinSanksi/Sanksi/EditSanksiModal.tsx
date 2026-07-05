import axios from "../../../../api/axios";
import { useEffect, useState } from "react";
import { Sanksi } from "./DataSanksi";
import Button from "../../../../components/ui/button/Button";
import Toast from "../../../../components/ui/alert/Toast";

interface EditPopupProps {
  show: boolean;
  onClose: (didSave?: boolean) => void;
  row: Sanksi | null; // 🟢 Ubah ke union type dengan 'null'
}

const EditSanksi: React.FC<EditPopupProps> = ({ show, onClose, row }) => {
  // 🟢 Ambil data secara aman menggunakan optional chaining (?.) untuk cegah white screen
  const [namaSanksi, setNamaSanksi] = useState(row?.nama_sanksi || "");
  const [batasPoin, setBatasPoin] = useState<number | "">(
    row?.batas_poin ?? "",
  );
  const [isVisible, setIsVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Local toast for errors inside the popup
  const [toast, setToast] = useState<{
    show: boolean;
    variant: "success" | "error";
    message: string;
  }>({ show: false, variant: "success", message: "" });

  const showToast = (variant: "success" | "error", message: string) =>
    setToast({ show: true, variant, message });

  // Reset form ketika modal terbuka dan row telah tersedia
  useEffect(() => {
    if (show && row) {
      setNamaSanksi(row.nama_sanksi || "");
      setBatasPoin(row.batas_poin ?? "");
      setToast({ show: false, variant: "success", message: "" });
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [show, row]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!row) return; // Guard clause keselamatan data

    if (batasPoin === "" || isNaN(Number(batasPoin)) || !namaSanksi.trim()) {
      showToast(
        "error",
        "Semua field wajib diisi dan batas poin harus berupa angka.",
      );
      return;
    }

    try {
      setSubmitting(true);
      // 🟢 Diubah ke endpoint sanksi yang benar, bukan poin-pelanggaran
      await axios.put(`/sanksi/${row.id_master_sanksi}`, {
        nama_sanksi: namaSanksi.trim(),
        batas_poin: Number(batasPoin),
      });

      setIsVisible(false);
      setTimeout(() => onClose(true), 300);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        "Gagal mengupdate data. Silakan coba lagi.";
      showToast("error", msg);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(false), 300);
  };

  // 🟢 Mencegah rendering struktur form bawah jika parameter modal mati atau data belum siap
  if (!show || !row) return null;

  return (
    <>
      <Toast
        show={toast.show}
        variant={toast.variant}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Popup */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
        }`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-xl p-6 relative">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Edit Data Sanksi
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama Sanksi */}
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                Nama Sanksi
              </label>
              <textarea
                value={namaSanksi}
                onChange={(e) => setNamaSanksi(e.target.value)}
                rows={3}
                className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Batas Poin */}
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                Batas Poin
              </label>
              <input
                type="number"
                value={batasPoin}
                onChange={(e) =>
                  setBatasPoin(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>

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
                disabled={submitting}
              >
                {submitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditSanksi;
