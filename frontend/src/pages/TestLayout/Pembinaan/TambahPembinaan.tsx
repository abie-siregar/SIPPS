import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import Button from "../../../components/ui/button/Button";
import Toast from "../../../components/ui/alert/Toast";
import SearchableSelect from "../../../components/form/SearchableSelect";

interface TambahPopupProps {
  show: boolean;
  onClose: (didSave?: boolean) => void;
}

interface Siswa {
  id_siswa: number;
  nama: string;
  rombel?: string;
}

interface Sanksi {
  id_master_sanksi: number;
  nama_sanksi: string;
  batas_poin: number;
}

interface ProgresPembinaan {
  id_progres: number;
  nama: string;
  tanggal_sanksi: string;
  tahap_akhir: string;
}

const TambahPembinaan: React.FC<TambahPopupProps> = ({ show, onClose }) => {
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [progresList, setProgresList] = useState<ProgresPembinaan[]>([]);
  const [sanksiList, setSanksiList] = useState<Sanksi[]>([]);

  const [idSiswa, setIdSiswa] = useState("");
  const [idPoin, setIdPoin] = useState("");
  const [idPtk, setIdPtk] = useState("");
  const [idSemester, setIdSemester] = useState("");
  const [tanggal, setTanggal] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - offset * 60 * 1000);
    return localToday.toISOString().split("T")[0];
  });
  const [keterangan, setKeterangan] = useState("");

  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    variant: "success" | "error";
    message: string;
  }>({ show: false, variant: "success", message: "" });

  const showToast = (variant: "success" | "error", message: string) =>
    setToast({ show: true, variant, message });

  // Fetch dropdown data
  useEffect(() => {
    if (show) {
      const loadData = async () => {
        try {
          const [resSiswa, resPoin, resPtk, resSemester] = await Promise.all([
            axios.get("/siswa"),
            axios.get("/poin-pelanggaran"),
            axios.get("/ptk"),
            axios.get("/pelanggaran-siswa/semesters"),
          ]);

          setSiswaList(resSiswa.data?.data || resSiswa.data || []);
          setPoinList(resPoin.data?.data || resPoin.data || []);
          setPtkList(resPtk.data?.data || resPtk.data || []);
          setSemesterList(resSemester.data?.data || resSemester.data || []);

          const siswaData = resSiswa.data?.data || resSiswa.data || [];
          const poinData = resPoin.data?.data || resPoin.data || [];
          const ptkData = resPtk.data?.data || resPtk.data || [];
          const semesterData = resSemester.data?.data || resSemester.data || [];

          if (siswaData.length > 0)
            setIdSiswa((siswaData[0].id_siswa || siswaData[0].id).toString());
          if (poinData.length > 0) setIdPoin(poinData[0].id_poin.toString());
          if (ptkData.length > 0) setIdPtk(ptkData[0].id_ptk.toString());
          if (semesterData.length > 0)
            setIdSemester(semesterData[0].id_semester.toString());
        } catch (err) {
          console.error("Gagal memuat dropdown data:", err);
          showToast("error", "Gagal memuat data pendukung form.");
        }
      };

      loadData();
      setKeterangan("");
      const today = new Date();
      const offset = today.getTimezoneOffset();
      const localToday = new Date(today.getTime() - offset * 60 * 1000);
      setTanggal(localToday.toISOString().split("T")[0]);
      setToast({ show: false, variant: "success", message: "" });
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !idSiswa ||
      !idPoin ||
      !idPtk ||
      !idSemester ||
      !tanggal ||
      !keterangan
    ) {
      showToast("error", "Semua field form wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/pelanggaran-siswa", {
        id_siswa: idSiswa,
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
        err?.response?.data?.error || "Gagal menambahkan data pelanggaran.";
      showToast("error", msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(false), 300);
  };

  // Maps for SearchableSelect options
  const siswaOptions = (siswaList || [])
    .filter(
      (s) =>
        s &&
        ((s.id_siswa !== undefined && s.id_siswa !== null) ||
          ((s as any).id !== undefined && (s as any).id !== null)),
    )
    .map((s) => ({
      value: (s.id_siswa || (s as any).id).toString(),
      label: `${s.nama || ""} ${s.rombel ? `(${s.rombel})` : ""}`,
    }));

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
      <Toast
        show={toast.show}
        variant={toast.variant}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      <div
        className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
        }`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-xl p-6 relative max-h-[90vh] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2">
            Tambah Pelanggaran Siswa
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Siswa */}
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                Pilih Siswa
              </label>
              <SearchableSelect
                options={siswaOptions}
                value={idSiswa}
                onChange={setIdSiswa}
                placeholder="-- Cari & Pilih Siswa --"
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
                placeholder="Tulis kronologi atau keterangan tambahan..."
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

export default TambahPembinaan;
