import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import Button from "../../../components/ui/button/Button";
import SearchableSelect from "../../../components/form/SearchableSelect";
import { PlottingBK } from "./DataPlottingBK";
import { useToast } from "../../../context/ToastContext";

interface EditPopupProps {
  show: boolean;
  onClose: (didSave?: boolean) => void;
  row: PlottingBK;
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

const EditDataPlottingBK: React.FC<EditPopupProps> = ({ show, onClose, row }) => {
  const { showSuccess, showError } = useToast();
  const [bkList, setBkList] = useState<PTK[]>([]);
  const [rombelList, setRombelList] = useState<Rombel[]>([]);
  const [semesterList, setSemesterList] = useState<Semester[]>([]);

  const [idPtkBk, setIdPtkBk] = useState("");
  const [idRombel, setIdRombel] = useState("");
  const [idSemester, setIdSemester] = useState("");

  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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

          let ptkId = row.id_ptk_bk ? row.id_ptk_bk.toString() : "";
          if (!ptkId && row.nama) {
            const foundPtk = filteredBK.find(
              (p) => p.nama?.trim().toLowerCase() === row.nama?.trim().toLowerCase()
            );
            if (foundPtk) ptkId = foundPtk.id_ptk.toString();
          }

          let rombelId = row.id_rombel ? row.id_rombel.toString() : "";
          if (!rombelId && row.rombel) {
            const foundRombel = mappedRombel.find(
              (r) => r.rombel?.trim().toLowerCase() === row.rombel?.trim().toLowerCase()
            );
            if (foundRombel) rombelId = foundRombel.id_rombel.toString();
          }

          let semesterId = row.id_semester ? row.id_semester.toString() : "";
          if (!semesterId && row.semester) {
            const foundSemester = semesterData.find(
              (s) => s.nama_semester?.trim().toLowerCase() === row.semester?.trim().toLowerCase()
            );
            if (foundSemester) semesterId = foundSemester.id_semester.toString();
          }

          setIdPtkBk(ptkId);
          setIdRombel(rombelId);
          setIdSemester(semesterId);
        } catch (err) {
          console.error("Gagal memuat data pendukung:", err);
          showError("Gagal memuat data pendukung form.");
        }
      };

      loadData();
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [show, row]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idPtkBk || !idRombel || !idSemester) {
      showError("Semua field form wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      await axios.put(`/plotting/${row.id_plotting}`, {
        id_ptk_bk: idPtkBk,
        id_rombel: idRombel,
        id_semester: idSemester,
      });

      showSuccess("Plotting Guru BK berhasil diperbarui!");
      setIsVisible(false);
      setTimeout(() => onClose(true), 300);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || "Gagal mengupdate data Plotting BK.";
      showError(msg);
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
            Edit Plotting BK
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

export default EditDataPlottingBK;
