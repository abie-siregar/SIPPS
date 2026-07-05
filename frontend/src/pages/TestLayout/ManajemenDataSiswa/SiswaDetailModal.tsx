import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import Button from "../../../components/ui/button/Button";
import Toast from "../../../components/ui/alert/Toast";

export interface Siswa {
  id_siswa?: number | string; // Tambahkan field identifier unik siswa untuk hit API
  id?: number | string;
  nama: string;
  nisn: string;
  alamat: string;
  no_telp: string;
  email: string;
  agama: string;
  tingkat: string;
  rombel: string;
  walikelas: string;
  jurusan: string;
}

interface SiswaDetailModalProps {
  show: boolean;
  onClose: (didSave?: boolean) => void; // Izinkan boolean argumen untuk trigger refresh di parent
  siswa: Siswa | null;
}

const SiswaDetailModal: React.FC<SiswaDetailModalProps> = ({
  show,
  onClose,
  siswa,
}) => {
  // 🟢 State Mode Kontrol (Mode Lihat vs Mode Edit)
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 🟢 State Form Input lokal
  const [formValues, setFormValues] = useState<Siswa>({
    nama: "",
    nisn: "",
    alamat: "",
    no_telp: "",
    email: "",
    agama: "",
    tingkat: "",
    rombel: "",
    walikelas: "",
    jurusan: "",
  });

  // State Toast Alert lokal di dalam modal
  const [toast, setToast] = useState<{
    show: boolean;
    variant: "success" | "error";
    message: string;
  }>({
    show: false,
    variant: "success",
    message: "",
  });

  // Sinkronisasi data form lokal saat modal menerima object data siswa baru
  useEffect(() => {
    if (show && siswa) {
      setFormValues({ ...siswa });
      setIsEditMode(false); // Kembalikan default ke mode baca setiap dibuka baru
      setToast({ show: false, variant: "success", message: "" });
    }
  }, [show, siswa]);

  if (!show || !siswa) return null;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSubmit = async () => {
    // Validasi singkat data krusial sebelum kirim
    if (!formValues.nama.trim() || !formValues.nisn.trim()) {
      setToast({
        show: true,
        variant: "error",
        message: "Nama dan NISN wajib diisi!",
      });
      return;
    }

    const targetId = siswa.id_siswa ?? siswa.id;
    try {
      setSubmitting(true);

      // 🟢 API Hit update data siswa
      await axios.put(`/siswa/${targetId}`, formValues);

      setToast({
        show: true,
        variant: "success",
        message: "Biodata siswa berhasil diperbarui!",
      });
      setIsEditMode(false);

      // Beri sedikit delay visual sebelum memberi tahu parent untuk mereload datatable
      setTimeout(() => onClose(true), 800);
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
    <>
      <Toast
        show={toast.show}
        variant={toast.variant}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
        <div className="w-full max-w-2xl overflow-hidden bg-white rounded-xl shadow-xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {isEditMode ? "Biodata Siswa" : "Biodata Siswa"}
            </h3>
            <button
              onClick={() => onClose(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-semibold"
            >
              &times;
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 text-left">
            {/* Profil Utama (Nama & NISN) */}
            <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50 space-y-3">
              <div>
                <label className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
                  Nama Lengkap
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="nama"
                    value={formValues.nama}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold text-lg"
                  />
                ) : (
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formValues.nama}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                  NISN
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="nisn"
                    value={formValues.nisn}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono text-sm"
                  />
                ) : (
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-300 font-medium">
                    {formValues.nisn}
                  </p>
                )}
              </div>
            </div>

            {/* Grid Data Akademik & Personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kolom Kiri: Akademik */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b pb-1 dark:border-gray-800">
                  Akademik
                </h4>

                {/* Field Kelas */}
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Kelas / Tingkat
                  </span>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="tingkat"
                      value={formValues.tingkat}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formValues.tingkat}
                    </span>
                  )}
                </div>

                {/* Field Rombel */}
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Rombongan Belajar
                  </span>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="rombel"
                      value={formValues.rombel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formValues.rombel}
                    </span>
                  )}
                </div>

                {/* Field Jurusan */}
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Jurusan
                  </span>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="jurusan"
                      value={formValues.jurusan}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formValues.jurusan}
                    </span>
                  )}
                </div>

                {/* Field Wali Kelas */}
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Wali Kelas
                  </span>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="walikelas"
                      value={formValues.walikelas}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formValues.walikelas}
                    </span>
                  )}
                </div>
              </div>

              {/* Kolom Kanan: Kontak & Agama */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b pb-1 dark:border-gray-800">
                  Kontak & Agama
                </h4>

                {/* Field Email */}
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Email
                  </span>
                  {isEditMode ? (
                    <input
                      type="email"
                      name="email"
                      value={formValues.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900 dark:text-white break-all">
                      {formValues.email}
                    </span>
                  )}
                </div>

                {/* Field No Telp */}
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    No. Telepon
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

                {/* Field Agama */}
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Agama
                  </span>
                  {isEditMode ? (
                    <select
                      name="agama"
                      value={formValues.agama}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-white"
                    >
                      <option value="Islam">Islam</option>
                      <option value="Kristen Protestan">
                        Kristen Protestan
                      </option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Khonghucu">Khonghucu</option>
                    </select>
                  ) : (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formValues.agama}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Alamat Rumah Lengkap */}
            <div className="border-t pt-4 dark:border-gray-800">
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Alamat Rumah
              </span>
              {isEditMode ? (
                <textarea
                  name="alamat"
                  value={formValues.alamat}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-1.5 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              ) : (
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-lg border dark:border-gray-800">
                  {formValues.alamat}
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions Panel */}
          <div className="flex justify-end gap-2 px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
            {isEditMode ? (
              <>
                {/* Tampilan Tombol saat sedang Mengedit */}
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
                {/* Tampilan Tombol Utama (Default) */}
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
                  onClick={() => onClose(false)}
                >
                  Tutup
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SiswaDetailModal;
