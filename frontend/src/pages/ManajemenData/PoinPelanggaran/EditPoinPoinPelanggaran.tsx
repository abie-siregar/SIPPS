import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../../api/axios";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";

const EditDataPoinPelanggaran = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [jenisPelanggaran, setJenisPelanggaran] = useState("");
  const [bobot, setBobot] = useState<number | "">("");
  const [jenis, setJenis] = useState("Kelakuan");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Ambil data lama berdasarkan ID
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/pelanggaran/${id}`);
        const data = res.data;
        setJenisPelanggaran(data.jenis_pelanggaran);
        setBobot(data.bobot);
        setJenis(data.jenis);
      } catch (err) {
        setError("Gagal memuat data pelanggaran.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Submit edit data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!jenisPelanggaran || bobot === "" || isNaN(Number(bobot)) || !jenis) {
      setError("Semua field wajib diisi dan bobot harus berupa angka.");
      return;
    }

    try {
      await axios.put(`/pelanggaran/${id}`, {
        jenis_pelanggaran: jenisPelanggaran,
        bobot: Number(bobot),
        jenis,
      });

      navigate("/data-poin-pelanggaran");
    } catch (err) {
      setError("Gagal mengupdate data.");
      console.error(err);
    }
  };

  return (
    <>
      <PageMeta
        title="Edit Pelanggaran | Dashboard SMKN 1 Batam"
        description="Halaman untuk mengubah data pelanggaran siswa"
      />
      <PageBreadcrumb pageTitle="Edit Data Poin Pelanggaran" />
      <div className="space-y-6">
        <ComponentCard title="Form Edit Pelanggaran">
          {loading ? (
            <p className="text-gray-500 text-sm">Memuat data...</p>
          ) : (
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
                  className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          )}
        </ComponentCard>
      </div>
    </>
  );
};

export default EditDataPoinPelanggaran;
