import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import Button from "../../../components/ui/button/Button";
import Toast from "../../../components/ui/alert/Toast";
import { Siswa } from "./SiswaDetailModal";
import { OrangTuaWali } from "./OrtuDetailModal";

interface SiswaTabsDetailModalProps {
  show: boolean;
  onClose: (didSave?: boolean) => void;
  siswa: Siswa | null;
}

const SiswaTabsDetailModal: React.FC<SiswaTabsDetailModalProps> = ({
  show,
  onClose,
  siswa,
}) => {
  const [activeTab, setActiveTab] = useState<"siswa" | "ortu">("siswa");
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loadingOrtu, setLoadingOrtu] = useState(false);

  // Form states
  const [siswaForm, setSiswaForm] = useState<Siswa>({} as Siswa);
  const [ortuForm, setOrtuForm] = useState<OrangTuaWali>({} as OrangTuaWali);

  const [toast, setToast] = useState({
    show: false,
    variant: "success" as "success" | "error",
    message: "",
  });

  // Ambil data orang tua ketika modal terbuka atau tab orang tua diklik
  const fetchOrtuData = async (siswaId: string | number) => {
    setLoadingOrtu(true);
    try {
      const res = await axios.get(`/orangtua/${siswaId}`);
      setOrtuForm(res.data.data || res.data);
    } catch (error) {
      console.error(error);
      setOrtuForm({
        id_orangtua: "",
        ayah: "",
        ibu: "",
        wali: "",
        no_telp: "",
        no_telp_rumah: "",
        no_kk: "",
        id_siswa: String(siswaId),
        nama: "",
      });
    } finally {
      setLoadingOrtu(false);
    }
  };

  useEffect(() => {
    if (show && siswa) {
      setSiswaForm({ ...siswa });
      setActiveTab("siswa");
      setIsEditMode(false);
      setToast({ show: false, variant: "success", message: "" });
      fetchOrtuData(siswa.id_siswa ?? siswa.id ?? "");
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [show, siswa]);

  const handleClose = (didSave: boolean = false) => {
    setIsVisible(false);
    setTimeout(() => onClose(didSave), 300);
  };

  if (!show || !siswa) return null;

  const handleSiswaChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setSiswaForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrtuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrtuForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSubmit = async () => {
    const targetId = siswa.id_siswa ?? siswa.id;
    setSubmitting(true);
    try {
      if (activeTab === "siswa") {
        if (!siswaForm.nama.trim() || !siswaForm.nisn.trim()) {
          setToast({
            show: true,
            variant: "error",
            message: "Nama dan NISN wajib diisi!",
          });
          setSubmitting(false);
          return;
        }
        await axios.put(`/siswa/${targetId}`, siswaForm);
      } else {
        if (
          !ortuForm.no_kk.trim() ||
          !ortuForm.ayah.trim() ||
          !ortuForm.ibu.trim() ||
          !ortuForm.no_telp.trim()
        ) {
          setToast({
            show: true,
            variant: "error",
            message: "KK, Telepon, Nama Ayah & Ibu wajib diisi!",
          });
          setSubmitting(false);
          return;
        }
        await axios.put(`/orangtua/${ortuForm.id_orangtua}`, ortuForm);
      }

      setToast({
        show: true,
        variant: "success",
        message: "Data berhasil diperbarui!",
      });
      setIsEditMode(false);
      setTimeout(() => handleClose(true), 800);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error || "Gagal menyimpan perubahan.";
      setToast({ show: true, variant: "error", message: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${show ? "visible" : "invisible"}`}
    >
      <Toast
        show={toast.show}
        variant={toast.variant}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
        onClick={() => !submitting && handleClose(false)}
      />

      <div
        className={`w-full max-w-2xl overflow-hidden bg-white rounded-xl shadow-xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 transition-all duration-300 transform relative z-10 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Detail Profil Informasi
            </h3>
            <button
              onClick={() => handleClose(false)}
              disabled={submitting}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-semibold"
            >
              &times;
            </button>
          </div>

          {/* Navigasi Tab */}
          <div className="flex px-6 gap-4 text-sm font-medium">
            <button
              className={`pb-3 border-b-2 transition-colors ${activeTab === "siswa" ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
              onClick={() => {
                if (!isEditMode) setActiveTab("siswa");
              }}
              disabled={isEditMode}
            >
              👤 Biodata Siswa
            </button>
            <button
              className={`pb-3 border-b-2 transition-colors ${activeTab === "ortu" ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
              onClick={() => {
                if (!isEditMode) setActiveTab("ortu");
              }}
              disabled={isEditMode}
            >
              👨‍👩‍👦 Data Orang Tua / Wali
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto text-left">
          {activeTab === "siswa" ? (
            <div className="space-y-4">
              <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-1">
                    Nama Lengkap
                  </label>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="nama"
                      value={siswaForm.nama || ""}
                      onChange={handleSiswaChange}
                      className="w-full px-3 py-1.5 border rounded dark:bg-gray-800 dark:text-white font-bold"
                    />
                  ) : (
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {siswaForm.nama}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">
                    NISN
                  </label>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="nisn"
                      value={siswaForm.nisn || ""}
                      onChange={handleSiswaChange}
                      className="w-full px-3 py-1.5 border rounded dark:bg-gray-800 dark:text-white font-mono text-sm"
                    />
                  ) : (
                    <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
                      {siswaForm.nisn}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-gray-500 mb-1">
                    Kelas / Tingkat
                  </span>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="tingkat"
                      value={siswaForm.tingkat || ""}
                      onChange={handleSiswaChange}
                      className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:text-white"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {siswaForm.tingkat}
                    </span>
                  )}
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">
                    Rombongan Belajar
                  </span>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="rombel"
                      value={siswaForm.rombel || ""}
                      onChange={handleSiswaChange}
                      className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:text-white"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {siswaForm.rombel}
                    </span>
                  )}
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">
                    Jurusan
                  </span>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="jurusan"
                      value={siswaForm.jurusan || ""}
                      onChange={handleSiswaChange}
                      className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:text-white"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {siswaForm.jurusan}
                    </span>
                  )}
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">
                    Wali Kelas
                  </span>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="walikelas"
                      value={siswaForm.walikelas || ""}
                      onChange={handleSiswaChange}
                      className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:text-white"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {siswaForm.walikelas}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : loadingOrtu ? (
            <p className="text-center py-4 dark:text-gray-400">
              Memuat data orang tua...
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b pb-1">
                  Data Orang Tua
                </h4>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">
                    Nama Ayah
                  </span>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="ayah"
                      value={ortuForm.ayah || ""}
                      onChange={handleOrtuChange}
                      className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:text-white"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {ortuForm.ayah}
                    </span>
                  )}
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">
                    Nama Ibu
                  </span>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="ibu"
                      value={ortuForm.ibu || ""}
                      onChange={handleOrtuChange}
                      className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:text-white"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {ortuForm.ibu}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b pb-1">
                  Kontak & KK
                </h4>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">
                    No. KK
                  </span>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="no_kk"
                      value={ortuForm.no_kk || ""}
                      onChange={handleOrtuChange}
                      className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:text-white"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {ortuForm.no_kk}
                    </span>
                  )}
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">
                    Nomor Telepon
                  </span>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="no_telp"
                      value={ortuForm.no_telp || ""}
                      onChange={handleOrtuChange}
                      className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:text-white"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {ortuForm.no_telp}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
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
                Edit Tab Ini
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

export default SiswaTabsDetailModal;
