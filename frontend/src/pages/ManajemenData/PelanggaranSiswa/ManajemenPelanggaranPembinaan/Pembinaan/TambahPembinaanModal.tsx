import React, { useEffect, useState } from "react";
import axios from "../../../../../api/axios";
import Button from "../../../../../components/ui/button/Button";
import Toast from "../../../../../components/ui/alert/Toast";
import SearchableSelect from "../../../../../components/form/SearchableSelect";

interface TambahModalProps {
  show: boolean;
  onClose: (didSave?: boolean) => void;
}

interface Siswa {
  id_siswa: string;
  nama: string;
  rombel?: string;
  total_poin: number;
}

interface Poin {
  id_poin: number;
  jenis_pelanggaran: string;
  bobot: number;
}

interface PTK {
  id_ptk: number;
  nama: string;
}

interface Semester {
  id_semester: number;
  nama_semester: string;
}

const TambahPembinaanModal: React.FC<TambahModalProps> = ({ show, onClose }) => {
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [poinList, setPoinList] = useState<Poin[]>([]);
  const [ptkList, setPtkList] = useState<PTK[]>([]);
  const [semesterList, setSemesterList] = useState<Semester[]>([]);

  const [idSiswa, setIdSiswa] = useState("");
  const [idPoin, setIdPoin] = useState("");
  const [idPtk, setIdPtk] = useState("");
  const [idSemester, setIdSemester] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    variant: "success" | "error";
    message: string;
  }>({ show: false, variant: "success", message: "" });

  const fetchDropdownData = async () => {
    try {
      const [resSiswa, resPoin, resPtk, resSemester] = await Promise.all([
        axios.get("/siswa"),
        axios.get("/poin-pelanggaran"),
        axios.get("/ptk"),
        axios.get("/pelanggaran-siswa/semesters"),
      ]);

      const rawSiswa: Siswa[] = resSiswa.data?.data || resSiswa.data || [];
      // Filter only students with points >= 100
      const filteredSiswa = rawSiswa.filter((s) => s.total_poin >= 100);
      setSiswaList(filteredSiswa);

      const rawPoin: Poin[] = resPoin.data?.data || resPoin.data || [];
      setPoinList(rawPoin);

      const rawPtk: PTK[] = resPtk.data?.data || resPtk.data || [];
      setPtkList(rawPtk);

      const rawSemester: Semester[] = resSemester.data?.data || resSemester.data || [];
      setSemesterList(rawSemester);

      // Pre-select defaults
      if (filteredSiswa.length > 0) setIdSiswa(filteredSiswa[0].id_siswa.toString());
      if (rawPoin.length > 0) setIdPoin(rawPoin[0].id_poin.toString());
      if (rawPtk.length > 0) setIdPtk(rawPtk[0].id_ptk.toString());
      if (rawSemester.length > 0) setIdSemester(rawSemester[0].id_semester.toString());
    } catch (err) {
      console.error("Gagal memuat data pendukung:", err);
    }
  };

  useEffect(() => {
    if (show) {
      fetchDropdownData();
      setKeterangan("Inisiasi Pembinaan Siswa (Poin >= 100)");
      const today = new Date().toISOString().split("T")[0];
      setTanggal(today);
    }
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idSiswa || !idPoin || !idPtk || !idSemester || !tanggal || !keterangan) {
      setToast({
        show: true,
        variant: "error",
        message: "Semua form wajib diisi.",
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post("/pelanggaran-siswa", {
        id_siswa: idSiswa,
        id_poin: Number(idPoin),
        id_ptk: idPtk,
        id_semester: idSemester,
        tanggal,
        keterangan,
      });

      setToast({
        show: true,
        variant: "success",
        message: "Progres pembinaan berhasil diinisiasi.",
      });

      setTimeout(() => onClose(true), 1000);
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.response?.data?.error || "Gagal menginisiasi pembinaan.";
      setToast({
        show: true,
        variant: "error",
        message: errMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Toast
        show={toast.show}
        variant={toast.variant}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Inisiasi Pembinaan Baru
          </h3>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pilih Siswa (Poin ≥ 100)
            </label>
            {siswaList.length === 0 ? (
              <p className="text-sm text-red-500 font-semibold py-1">
                Tidak ada siswa dengan poin 100 atau lebih yang membutuhkan pembinaan baru.
              </p>
            ) : (
              <SearchableSelect
                options={siswaList.map((s) => ({
                  value: s.id_siswa.toString(),
                  label: `${s.nama} (${s.rombel || "-"}) - ${s.total_poin} Poin`,
                }))}
                value={idSiswa}
                onChange={(val) => setIdSiswa(val)}
                placeholder="-- Pilih Siswa --"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tanggal Inisiasi
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                PTK Companion / Pelapor
              </label>
              <SearchableSelect
                options={ptkList.map((p) => ({
                  value: p.id_ptk.toString(),
                  label: p.nama,
                }))}
                value={idPtk}
                onChange={(val) => setIdPtk(val)}
                placeholder="-- Pilih PTK --"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pelanggaran Pemicu (id_poin)
              </label>
              <SearchableSelect
                options={poinList.map((p) => ({
                  value: p.id_poin.toString(),
                  label: `${p.jenis_pelanggaran} (${p.bobot} Poin)`,
                }))}
                value={idPoin}
                onChange={(val) => setIdPoin(val)}
                placeholder="-- Pilih Pelanggaran --"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Semester
              </label>
              <SearchableSelect
                options={semesterList.map((s) => ({
                  value: s.id_semester.toString(),
                  label: s.nama_semester,
                }))}
                value={idSemester}
                onChange={(val) => setIdSemester(val)}
                placeholder="-- Pilih Semester --"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Catatan / Keterangan
            </label>
            <textarea
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              rows={3}
              required
              placeholder="Keterangan inisiasi pembinaan..."
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 pt-4 mt-6">
            <Button variant="outline" type="button" onClick={() => onClose(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading || siswaList.length === 0}
            >
              {loading ? "Memproses..." : "Inisiasi Pembinaan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahPembinaanModal;
