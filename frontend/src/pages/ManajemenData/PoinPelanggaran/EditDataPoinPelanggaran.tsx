import axios from "../../../api/axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pelanggaran } from "./DataPoinPelanggaran";
import Alert from "../../../components/ui/alert/Alert";
import Button from "../../../components/ui/button/Button";

interface EditPopupProps {
  show: boolean;
  onClose: () => void;
  row: Pelanggaran;
}

const EditDataPoinPelanggaran: React.FC<EditPopupProps> = ({
  show,
  onClose,
  row,
}) => {
  const [jenisPenilaian, setjenisPenilaian] = useState(row.jenis_penilaian);
  const [bobot, setBobot] = useState<number | "">(row.bobot);
  const [jenisPelanggaran, setJenisPelanggaran] = useState(
    row.jenis_pelanggaran
  );
  const [isActive, setIsActive] = useState<boolean>(row.is_active);
  const [error, setError] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const navigate = useNavigate();

  // Reset form saat popup dibuka
  useEffect(() => {
    if (show) {
      setjenisPenilaian(row.jenis_penilaian);
      setBobot(row.bobot);
      setJenisPelanggaran(row.jenis_pelanggaran);
      setIsActive(row.is_active);
      setError("");
      setTimeout(() => setIsVisible(true), 10); // trigger transisi masuk
    } else {
      setIsVisible(false);
    }
  }, [show, row]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !jenisPenilaian ||
      bobot === "" ||
      isNaN(Number(bobot)) ||
      !jenisPelanggaran
    ) {
      setError("Semua field wajib diisi dan bobot harus berupa angka.");
      return;
    }

    try {
      const res = await axios.put(`/poin-pelanggaran/${row.id_poin}`, {
        jenis_penilaian: jenisPenilaian,
        bobot: Number(bobot),
        jenis_pelanggaran: jenisPelanggaran,
        is_active: isActive,
      });

      if (res.status === 200) {
        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowSuccessPopup(false);
          setIsVisible(false);
          setTimeout(onClose, 1500);
        }, 1500);
      } else {
        setError("Update gagal");
      }
    } catch (error) {
      setError("Gagal mengupdate data.");
      console.error(error);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // durasi sama dengan transisi
  };

  if (!show) return null;

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
          <h2 className="text-lg font-semibold mb-4">Edit Poin Pelanggaran</h2>

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label>Jenis Penilaian</label>
              <textarea
                value={jenisPenilaian}
                onChange={(e) => setjenisPenilaian(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label>Bobot</label>
              <input
                type="number"
                value={bobot}
                onChange={(e) => setBobot(Number(e.target.value))}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label>Jenis Pelanggaran</label>
              <select
                value={jenisPelanggaran}
                onChange={(e) => setJenisPelanggaran(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="Kelakuan">Kelakuan</option>
                <option value="Kerajinan">Kerajinan</option>
                <option value="Kerapian">Kerapian</option>
              </select>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <span>Status:</span>
              <div
                className={`relative w-12 h-6 transition-all duration-300 rounded-full ${
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
              <span>{isActive ? "Aktif" : "Tidak Aktif"}</span>
            </label>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleClose}
              >
                Batal
              </Button>

              <Button type="submit" variant="primary" size="sm">
                Simpan
              </Button>
            </div>
          </form>

          {showSuccessPopup && (
            <Alert
              variant="success"
              title="Sukses"
              message="Data berhasil diperbarui"
              show={showSuccessPopup}
              onClose={() => setShowSuccessPopup(false)}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default EditDataPoinPelanggaran;
