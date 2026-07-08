import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import Button from "../../../components/ui/button/Button";
import Toast from "../../../components/ui/alert/Toast";

export interface OrangTuaWali {
  id_orangtua: string;
  ayah: string;
  ibu: string;
  wali: string;
  no_telp: string;
  no_telp_rumah: string;
  no_kk: string;
  id_siswa: string;
  nama: string;
}

interface OrtuDetailModalProps {
  show: boolean;
  onClose: (didSave?: boolean) => void;
  Ortu: OrangTuaWali | null;
}

const OrtuDetailModal: React.FC<OrtuDetailModalProps> = ({
  show,
  onClose,
  Ortu,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const [formValues, setFormValues] = useState<OrangTuaWali>({
    id_orangtua: "",
    ayah: "",
    ibu: "",
    wali: "",
    no_telp: "",
    no_telp_rumah: "",
    no_kk: "",
    id_siswa: "",
    nama: "",
  });

  const [toast, setToast] = useState<{
    show: boolean;
    variant: "success" | "error";
    message: string;
  }>({
    show: false,
    variant: "success",
    message: "",
  });

  useEffect(() => {
    if (show && Ortu) {
      setFormValues({ ...Ortu });
      setIsEditMode(false);
      setToast({ show: false, variant: "success", message: "" });

      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [show, Ortu]);

  const handleClose = (didSave: boolean = false) => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(didSave);
    }, 300);
  };

  if (!show || !Ortu) return null;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSubmit = async () => {
    if (
      !formValues.no_kk.trim() ||
      !formValues.ayah.trim() ||
      !formValues.ibu.trim() ||
      !formValues.no_telp.trim()
    ) {
      setToast({
        show: true,
        variant: "error",
        message:
          "Nomor Kartu Keluarga, Nomor Telepon, Nama Ayah dan Ibu Harus di Isi",
      });
      return;
    }

    const targetId = Ortu.id_orangtua;
    try {
      setSubmitting(true);
      await axios.put(`/orangtua/${targetId}`, formValues);

      setToast({
        show: true,
        variant: "success",
        message: "Biodata orang tua berhasil diperbarui!",
      });
      setIsEditMode(false);

      setTimeout(() => handleClose(true), 800);
    } catch (error: any) {
      console.error(error);
      const errorMsg =
        error?.response?.data?.error || "Gagal menyimpan perubahan.";
      setToast({ show: true, variant: "error", message: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        show ? "visible" : "invisible"
      }`}
    >
      {/* Toast ditaruh di dalam fixed container agar mengambang independen */}
      <Toast
        show={toast.show}
        variant={toast.variant}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      {/* Backdrop Latar Belakang Gelap / Blur */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => !submitting && handleClose(false)}
      />

      {/* Modal Box Container (Pasti di Tengah Layar) */}
      <div
        className={`w-full max-w-2xl overflow-hidden bg-white rounded-xl shadow-xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 transition-all duration-300 transform relative z-10 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Detail Keluarga
          </h3>
          <button
            onClick={() => handleClose(false)}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-semibold disabled:opacity-50"
          >
            &times;
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kolom Kiri: Data Orang Tua */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b pb-1 dark:border-gray-800">
                Data Orang Tua
              </h4>

              <div>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Nama Ayah
                </span>
                {isEditMode ? (
                  <input
                    type="text"
                    name="ayah"
                    value={formValues.ayah}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formValues.ayah}
                  </span>
                )}
              </div>

              <div>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Nama Ibu
                </span>
                {isEditMode ? (
                  <input
                    type="text"
                    name="ibu"
                    value={formValues.ibu}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formValues.ibu}
                  </span>
                )}
              </div>

              <div>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Wali
                </span>
                {isEditMode ? (
                  <input
                    type="text"
                    name="wali"
                    value={formValues.wali}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formValues.wali || "-"}
                  </span>
                )}
              </div>
            </div>

            {/* Kolom Kanan: No. KK & Kontak */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b pb-1 dark:border-gray-800">
                No. KK & Kontak
              </h4>

              <div>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  No. KK
                </span>
                {isEditMode ? (
                  <input
                    type="text"
                    name="no_kk"
                    value={formValues.no_kk}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900 dark:text-white break-all">
                    {formValues.no_kk}
                  </span>
                )}
              </div>

              <div>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Nomor Telepon
                </span>
                {isEditMode ? (
                  <input
                    type="text"
                    name="no_telp"
                    value={formValues.no_telp}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formValues.no_telp}
                  </span>
                )}
              </div>

              <div>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Nomor Telepon Rumah
                </span>
                {isEditMode ? (
                  <input
                    type="text"
                    name="no_telp_rumah"
                    value={formValues.no_telp_rumah}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formValues.no_telp_rumah || "-"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions Panel */}
        <div className="flex justify-end gap-2 px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
          {isEditMode ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditMode(false)}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleSaveSubmit}
                disabled={submitting}
              >
                {submitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsEditMode(true)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleClose(false)}
              >
                Tutup
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrtuDetailModal;
