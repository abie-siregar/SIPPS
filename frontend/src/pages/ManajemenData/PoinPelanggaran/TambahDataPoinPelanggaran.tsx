import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../api/axios";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import SuccessPopup from "../../UiElements/SuccessPopup";

const TambahPelanggaran = () => {
  const navigate = useNavigate();
  const [jenisPelanggaran, setJenisPelanggaran] = useState("");
  const [bobot, setBobot] = useState<number | "">("");
  const [jenis, setJenis] = useState("Kelakuan");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!jenisPelanggaran || bobot === "" || isNaN(Number(bobot)) || !jenis) {
      setError("Semua field wajib diisi dan bobot harus berupa angka.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/pelanggaran", {
        jenis_pelanggaran: jenisPelanggaran,
        bobot: Number(bobot),
        jenis,
      });

      navigate("/data-poin-pelanggaran");
    } catch (err) {
      setError("Gagal menambahkan data. Silakan coba lagi.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Tambah Pelanggaran | Dashboard SMKN 1 Batam"
        description="Halaman untuk menambahkan data pelanggaran baru"
      />
      <PageBreadcrumb pageTitle="Tambah Data Poin Pelanggaran" />
      <div className="space-y-6">
        <ComponentCard title="Form Tambah Pelanggaran">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}

            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                Jenis Pelanggaran
              </label>
              <textarea
                value={jenisPelanggaran}
                onChange={(e) => setJenisPelanggaran(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-white/[0.03] dark:border-white/[0.1] dark:text-white/90"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                Bobot
              </label>
              <input
                type="number"
                value={bobot}
                onChange={(e) => setBobot(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-white/[0.03] dark:border-white/[0.1] dark:text-white/90"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                Jenis
              </label>
              <select
                value={jenis}
                onChange={(e) => setJenis(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-white/[0.03] dark:border-white/[0.1] dark:text-white/90"
              >
                <option value="Kelakuan">Kelakuan</option>
                <option value="Kerajinan">Kerajinan</option>
                <option value="Kerapian">Kerapian</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate("/data-poin-pelanggaran")}
                className="px-4 py-2 text-sm rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
          <SuccessPopup
            message="Data berhasil dibuat!"
            show={showPopup}
            onClose={() => setShowPopup(false)}
          />
        </ComponentCard>
      </div>
    </>
  );
};

export default TambahPelanggaran;
