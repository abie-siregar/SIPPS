import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../api/axios";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import Toast from "../../../components/ui/alert/Toast";
import { useAuth } from "../../../context/AuthContext";

const TambahPelanggaran = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const navigate = useNavigate();
  const [jenisPelanggaran, setJenisPelanggaran] = useState("");
  const [bobot, setBobot] = useState<number | "">("");
  const [jenisPenilaian, setJenisPenilaian] = useState("Kelakuan");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/data-poin-pelanggaran");
    }
  }, [isAdmin, navigate]);

  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    variant: "success" | "error";
    message: string;
  }>({ show: false, variant: "success", message: "" });

  const showToast = (variant: "success" | "error", message: string) => {
    setToast({ show: true, variant, message });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jenisPelanggaran || bobot === "" || isNaN(Number(bobot)) || !jenisPenilaian) {
      showToast("error", "Semua field wajib diisi dan bobot harus berupa angka.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/poin-pelanggaran", {
        jenis_penilaian: jenisPenilaian,
        jenis_pelanggaran: jenisPelanggaran,
        bobot: Number(bobot),
      });

      showToast("success", "Data poin pelanggaran berhasil ditambahkan!");
      setTimeout(() => navigate("/data-poin-pelanggaran"), 1500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || "Gagal menambahkan data. Silakan coba lagi.";
      showToast("error", msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Tambah Poin Pelanggaran | Dashboard SMKN 1 Batam"
        description="Halaman untuk menambahkan data poin pelanggaran baru"
      />
      <PageBreadcrumb pageTitle="Tambah Data Poin Pelanggaran" />

      {/* Toast notification */}
      <Toast
        show={toast.show}
        variant={toast.variant}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      <div className="space-y-6">
        <ComponentCard title="Form Tambah Poin Pelanggaran">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
            {/* Jenis Penilaian */}
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                Jenis Penilaian
              </label>
              <select
                value={jenisPenilaian}
                onChange={(e) => setJenisPenilaian(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-white/[0.03] dark:border-white/[0.1] dark:text-white/90"
              >
                <option value="Kelakuan">Kelakuan</option>
                <option value="Kerajinan">Kerajinan</option>
                <option value="Kerapian">Kerapian</option>
              </select>
            </div>

            {/* Jenis Pelanggaran */}
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                Jenis Pelanggaran
              </label>
              <textarea
                value={jenisPelanggaran}
                onChange={(e) => setJenisPelanggaran(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-white/[0.03] dark:border-white/[0.1] dark:text-white/90"
                required
              />
            </div>

            {/* Bobot */}
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                Bobot
              </label>
              <input
                type="number"
                min={1}
                value={bobot}
                onChange={(e) => setBobot(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-white/[0.03] dark:border-white/[0.1] dark:text-white/90"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate("/data-poin-pelanggaran")}
                className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
};

export default TambahPelanggaran;
