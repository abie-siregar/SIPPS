import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import Button from "../../components/ui/button/Button";
import Toast from "../../components/ui/alert/Toast";
import { PelanggaranSiswa } from "../ManajemenData/PelanggaranSiswa/DataPelanggaranSiswa";
import SearchableSelect from "../../components/form/SearchableSelect";

interface EditPopupProps {
  show: boolean;
  onClose: (didSave?: boolean) => void;
  row: PelanggaranSiswa;
}

interface PoinPelanggaran {
  id_poin: number;
  jenis_pelanggaran: string;
  bobot: number;
}

interface PTK {
  id_ptk: number;
  nama: string;
}

interface Semester {
  id_semester: string;
  nama_semester: string;
}

const detail: React.FC<EditPopupProps> = ({ show, onClose, row }) => {
  const [poinList, setPoinList] = useState<PoinPelanggaran[]>([]);
  const [ptkList, setPtkList] = useState<PTK[]>([]);
  const [semesterList, setSemesterList] = useState<Semester[]>([]);

  const [idPoin, setIdPoin] = useState("");
  const [idPtk, setIdPtk] = useState("");
  const [idSemester, setIdSemester] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    variant: "success" | "error";
    message: string;
  }>({ show: false, variant: "success", message: "" });

  // --- [TAMBAHAN STATE UNTUK NAVIGASI TAB DI DALAM POPUP] ---
  const [activeTab, setActiveTab] = useState<"detail" | "biodata" | "riwayat">(
    "detail",
  );

  const showToast = (variant: "success" | "error", message: string) =>
    setToast({ show: true, variant, message });

  // Fetch dropdown data and set defaults on open (Isi Kode Tetap Sama)
  useEffect(() => {
    if (show) {
      const loadData = async () => {
        try {
          const [resPoin, resPtk, resSemester] = await Promise.all([
            axios.get("/poin-pelanggaran"),
            axios.get("/ptk"),
            axios.get("/pelanggaran-siswa/semesters"),
          ]);

          setPoinList(resPoin.data?.data || resPoin.data || []);
          setPtkList(resPtk.data?.data || resPtk.data || []);
          setSemesterList(resSemester.data?.data || resSemester.data || []);
        } catch (err) {
          console.error("Gagal memuat data pendukung edit:", err);
          showToast("error", "Gagal memuat data pendukung form.");
        }
      };

      loadData();

      // Initialize form from row
      setIdPoin(row.id_poin?.toString() || "");
      setIdPtk(row.id_ptk?.toString() || "");
      setIdSemester(row.id_semester?.toString() || "");

      // Date formatting for input type="date"
      if (row.tanggal) {
        const d = new Date(row.tanggal);
        const offset = d.getTimezoneOffset();
        const localD = new Date(d.getTime() - offset * 60 * 1000);
        setTanggal(localD.toISOString().split("T")[0]);
      } else {
        setTanggal("");
      }

      setKeterangan(row.keterangan || "");
      setToast({ show: false, variant: "success", message: "" });

      // Reset tab ke "detail" setiap kali popup baru dibuka
      setActiveTab("detail");
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [show, row]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idPoin || !idPtk || !idSemester || !tanggal || !keterangan) {
      showToast("error", "Semua field wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.put(`/pelanggaran-siswa/${row.id_pelanggaran}`, {
        id_poin: Number(idPoin),
        id_ptk: idPtk,
        id_semester: idSemester,
        tanggal,
        keterangan,
      });

      setIsVisible(false);
      setTimeout(() => onClose(true), 300);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || "Gagal mengupdate data pelanggaran.";
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

  // Maps for SearchableSelect options (Isi Kode Tetap Sama)
  const poinOptions = (poinList || [])
    .filter((p) => p && p.id_poin !== undefined && p.id_poin !== null)
    .map((p) => ({
      value: p.id_poin.toString(),
      label: `${p.jenis_pelanggaran || ""} (${p.bobot || 0} Poin)`,
    }));

  const ptkOptions = (ptkList || [])
    .filter((p) => p && p.id_ptk !== undefined && p.id_ptk !== null)
    .map((p) => ({
      value: p.id_ptk.toString(),
      label: p.nama || "",
    }));

  const semesterOptions = (semesterList || [])
    .filter((s) => s && s.id_semester !== undefined && s.id_semester !== null)
    .map((s) => ({
      value: s.id_semester.toString(),
      label: s.nama_semester || "",
    }));

  if (!show) return null;

  return (
    <>
      {/* Toast notification */}
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-xl p-6 relative max-h-[90vh] overflow-y-auto">
          {/* --- [PERUBAHAN STRUKTUR: NAVIGASI TAB BERDAMPINGAN] --- */}
          <div className="flex items-center gap-2 border-b pb-2 mb-4 overflow-x-auto separation-tabs">
            <button
              type="button"
              onClick={() => setActiveTab("detail")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                activeTab === "detail"
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              Detail Pelanggaran
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("biodata")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                activeTab === "biodata"
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              Biodata
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("riwayat")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                activeTab === "riwayat"
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              Full Riwayat
            </button>
          </div>

          {/* --- TAB CONTENT 1: DETAIL PELANGGARAN (FORM ASLI ANDA) --- */}
          {activeTab === "detail" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama Siswa (Read Only) */}
              <div>
                <label className="block text-sm mb-1 font-medium text-gray-500 dark:text-gray-400">
                  Nama Siswa
                </label>
                <input
                  type="text"
                  value={row.nama_siswa || "-"}
                  disabled
                  className="w-full bg-gray-100 border px-3 py-2 rounded dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-300 font-semibold text-sm"
                />
              </div>

              {/* Poin Pelanggaran */}
              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                  Jenis Pelanggaran (Poin)
                </label>
                <SearchableSelect
                  options={poinOptions}
                  value={idPoin}
                  onChange={setIdPoin}
                  placeholder="-- Cari & Pilih Pelanggaran --"
                />
              </div>

              {/* PTK (Pelapor) */}
              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                  Pendidik / Tenaga Kependidikan (Pelapor)
                </label>
                <SearchableSelect
                  options={ptkOptions}
                  value={idPtk}
                  onChange={setIdPtk}
                  placeholder="-- Cari & Pilih PTK --"
                />
              </div>

              {/* Semester */}
              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                  Semester
                </label>
                <SearchableSelect
                  options={semesterOptions}
                  value={idSemester}
                  onChange={setIdSemester}
                  placeholder="-- Cari & Pilih Semester --"
                />
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                  Tanggal Kejadian
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                  required
                />
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                  Keterangan Tambahan / Kronologi
                </label>
                <textarea
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  rows={3}
                  className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
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
          )}

          {/* --- TAB CONTENT 2: BIODATA SISWA --- */}
          {activeTab === "biodata" && (
            <div className="space-y-4 text-sm py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-0.5">
                    Nama Lengkap
                  </label>
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    {row.nama_siswa || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-0.5">
                    Kelas / Rombel
                  </label>
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    {row.nama_rombel || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-0.5">
                    Jurusan / Penilaian
                  </label>
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    {row.jenis_penilaian || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-0.5">
                    Current Weight / Bobot Kasus Ini
                  </label>
                  <p className="font-bold text-red-500">
                    {row.bobot ? `${row.bobot} Poin` : "-"}
                  </p>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t mt-4">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleClose}
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}

          {/* --- TAB CONTENT 3: FULL RIWAYAT --- */}
          {activeTab === "riwayat" && (
            <div className="space-y-4 py-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                Menampilkan rekam jejak pelanggaran aktif untuk siswa:{" "}
                <strong>{row.nama_siswa}</strong>
              </p>
              <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                  <thead className="bg-gray-50 dark:bg-gray-700 font-bold text-gray-900 dark:text-white">
                    <tr>
                      <th className="px-3 py-2">Tanggal</th>
                      <th className="px-3 py-2">Kasus</th>
                      <th className="px-3 py-2 text-center">Poin</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b dark:border-gray-700">
                      <td className="px-3 py-2 whitespace-nowrap">
                        {tanggal || "-"}
                      </td>
                      <td className="px-3 py-2 font-medium">
                        {row.jenis_pelanggaran || "Kasus saat ini"}
                      </td>
                      <td className="px-3 py-2 text-center text-red-500 font-bold">
                        {row.bobot || 0}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end pt-4 border-t mt-4">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleClose}
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default detail;
