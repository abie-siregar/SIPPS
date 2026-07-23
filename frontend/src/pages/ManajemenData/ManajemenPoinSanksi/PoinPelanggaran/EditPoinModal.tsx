import axios from "../../../../api/axios";
import { useEffect, useState } from "react";
import { PoinPelanggaran } from "./DataPoinPelanggaran";
import Button from "../../../../components/ui/button/Button";
import { useToast } from "../../../../context/ToastContext";

interface EditPopupProps {
  show: boolean;
  onClose: (didSave?: boolean) => void;
  row: PoinPelanggaran | null;
}

const EditDataPoinPelanggaran: React.FC<EditPopupProps> = ({
  show,
  onClose,
  row,
}) => {
  const { showSuccess, showError } = useToast();
  const [jenisPenilaian, setJenisPenilaian] = useState(
    row?.jenis_penilaian || "Kelakuan",
  );
  const [jenisPelanggaran, setJenisPelanggaran] = useState(
    row?.jenis_pelanggaran || "",
  );
  const [bobot, setBobot] = useState<number | "">(row?.bobot ?? "");
  const [isActive, setIsActive] = useState<boolean>(row?.is_active ?? true);

  const [isVisible, setIsVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset form when popup opens
  useEffect(() => {
    if (show && row) {
      setJenisPenilaian(row.jenis_penilaian || "Kelakuan");
      setBobot(row.bobot ?? "");
      setJenisPelanggaran(row.jenis_pelanggaran || "");
      setIsActive(row.is_active ?? true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [show, row]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!row) return;

    if (
      !jenisPenilaian ||
      bobot === "" ||
      isNaN(Number(bobot)) ||
      !jenisPelanggaran
    ) {
      showError("Semua field wajib diisi dan bobot harus berupa angka.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.put(`/poin-pelanggaran/${row.id_poin}`, {
        jenis_penilaian: jenisPenilaian,
        bobot: Number(bobot),
        jenis_pelanggaran: jenisPelanggaran,
        is_active: isActive,
      });

      showSuccess("Data poin pelanggaran berhasil diperbarui!");
      setIsVisible(false);
      setTimeout(() => onClose(true), 300);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        "Gagal mengupdate data. Silakan coba lagi.";
      showError(msg);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(false), 300);
  };

  // 🟢 Cegah render komponen HTML jika modal tidak aktif atau data belum ada
  if (!show || !row) return null;

  return (
    <>
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
            Edit Poin Pelanggaran
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
                className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Bobot */}
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                Bobot
              </label>
              <input
                type="number"
                value={bobot}
                onChange={(e) =>
                  setBobot(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Status toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-white/90">
                Status:
              </span>
              <div
                className={`relative w-12 h-6 transition-all duration-300 rounded-full cursor-pointer ${
                  isActive ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
                onClick={() => setIsActive(!isActive)}
              >
                <span
                  className={`absolute left-0 top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${
                    isActive ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isActive ? "Aktif" : "Tidak Aktif"}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
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

export default EditDataPoinPelanggaran;
