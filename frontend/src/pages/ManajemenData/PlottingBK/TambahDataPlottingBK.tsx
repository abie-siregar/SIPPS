import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import Button from "../../../components/ui/button/Button";
import Toast from "../../../components/ui/alert/Toast";
import SearchableSelect from "../../../components/form/SearchableSelect";

interface TambahPopupProps {
  show: boolean;
  onClose: (didSave?: boolean) => void;
}

interface PTK {
  id_ptk: number;
  nama: string;
  id_jabatan: number | string;
  jabatan: string;
}

interface Rombel {
  id_rombel: number;
  rombel: string;
}

interface Semester {
  id_semester: string;
  nama_semester: string;
}

const TambahDataPlottingBK: React.FC<TambahPopupProps> = ({ show, onClose }) => {
  const [bkList, setBkList] = useState<PTK[]>([]);
  const [rombelList, setRombelList] = useState<Rombel[]>([]);
  const [semesterList, setSemesterList] = useState<Semester[]>([]);

  const [idPtkBk, setIdPtkBk] = useState("");
  const [idRombel, setIdRombel] = useState("");
  const [idSemester, setIdSemester] = useState("");

  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    variant: "success" | "error";
    message: string;
  }>({ show: false, variant: "success", message: "" });

  const showToast = (variant: "success" | "error", message: string) =>
    setToast({ show: true, variant, message });

  useEffect(() => {
    if (show) {
      const loadData = async () => {
        try {
          const [resPtk, resRombel, resSemester] = await Promise.all([
            axios.get("/ptk"),
            axios.get("/rombel"),
            axios.get("/pelanggaran-siswa/semesters"),
          ]);

          const ptkData: PTK[] = resPtk.data?.data || resPtk.data || [];
          const rombelData: any[] = resRombel.data?.data || resRombel.data || [];
          const semesterData: Semester[] = resSemester.data?.data || resSemester.data || [];

          // Filter only BK teachers (id_jabatan === 21904)
          const filteredBK = ptkData.filter(
            (p) =>
              p &&
              (p.id_jabatan === 21904 ||
                p.id_jabatan === "21904" ||
                p.jabatan?.toLowerCase().includes("bimbingan") ||
                p.jabatan?.toLowerCase().includes("bk"))
          );

          setBkList(filteredBK);
          setSemesterList(semesterData);

          const mappedRombel = rombelData.map((r: any) => ({
            id_rombel: r.id_rombel || r.id,
            rombel: r.rombel || r.nama_rombel,
          }));
          setRombelList(mappedRombel);

          if (filteredBK.length > 0 && filteredBK[0].id_ptk !== undefined && filteredBK[0].id_ptk !== null) {
            setIdPtkBk(filteredBK[0].id_ptk.toString());
          }
          if (mappedRombel.length > 0 && mappedRombel[0].id_rombel !== undefined && mappedRombel[0].id_rombel !== null) {
            setIdRombel(mappedRombel[0].id_rombel.toString());
          }
          if (semesterData.length > 0 && semesterData[0].id_semester !== undefined && semesterData[0].id_semester !== null) {
            setIdSemester(semesterData[0].id_semester.toString());
          }
        } catch (err) {
          console.error("Gagal memuat data pendukung:", err);
          showToast("error", "Gagal memuat data pendukung form.");
        }
      };

      loadData();
      setToast({ show: false, variant: "success", message: "" });
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idPtkBk || !idRombel || !idSemester) {
      showToast("error", "Semua field form wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/plotting", {
        id_ptk_bk: idPtkBk,
        id_rombel: Number(idRombel),
        id_semester: idSemester,
      });

      setIsVisible(false);
      setTimeout(() => onClose(true), 300);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || "Gagal menambahkan data Plotting BK.";
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

  const bkOptions = bkList.map((bk) => ({
    value: bk.id_ptk.toString(),
    label: bk.nama,
  }));

  const rombelOptions = rombelList.map((r) => ({
    value: (r.id_rombel ?? "").toString(),
    label: r.rombel,
  }));

  const semesterOptions = semesterList.map((s) => ({
    value: s.id_semester.toString(),
    label: s.nama_semester,
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
            Tambah Plotting BK
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Guru BK */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Guru BK
              </label>
              <SearchableSelect
                options={bkOptions}
                value={idPtkBk}
                onChange={setIdPtkBk}
                placeholder="-- Pilih Guru BK --"
              />
            </div>

            {/* Rombel */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Rombongan Belajar
              </label>
              <SearchableSelect
                options={rombelOptions}
                value={idRombel}
                onChange={setIdRombel}
                placeholder="-- Pilih Rombel --"
              />
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Semester
              </label>
              <SearchableSelect
                options={semesterOptions}
                value={idSemester}
                onChange={setIdSemester}
                placeholder="-- Pilih Semester --"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={handleClose}>
                Batal
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default TambahDataPlottingBK;
