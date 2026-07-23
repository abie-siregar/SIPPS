import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../../api/axios";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import { useToast } from "../../../context/ToastContext";

interface Rombel {
  id_rombel: number;
  wali_kelas: string;
  rombel: string;
  tingkat: string;
  jmlh_l: number;
  jmlh_p: number;
  jurusan: string;
}

const EditDataRombel = () => {
  const { showSuccess, showError } = useToast();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Rombel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/rombel/${id}`);
        setFormData(res.data);
      } catch (err) {
        console.error("Gagal mengambil data rombel:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [name]: name === "l" || name === "p" ? Number(value) : value,
          }
        : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`/rombel/${id}`, formData);
      showSuccess("Data rombel berhasil diperbarui!");
      setTimeout(() => {
        navigate("/data-rombel");
      }, 800);
    } catch (err: any) {
      console.error("Gagal update data:", err);
      const msg = err?.response?.data?.error || "Gagal memperbarui data.";
      showError(msg);
    }
  };

  if (loading || !formData) {
    return <p className="text-center">Memuat data...</p>;
  }

  return (
    <>
      <PageMeta
        title="Edit Rombel"
        description="Halaman untuk mengedit data rombel"
      />
      <PageBreadcrumb pageTitle="Edit Rombel" />
      <div className="space-y-6 relative">
        <ComponentCard title="Form Edit Rombel">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
            <div>
              <label className="block text-sm font-medium">Wali Kelas</label>
              <input
                type="text"
                name="wali_kelas"
                value={formData.wali_kelas}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Rombel</label>
              <input
                type="text"
                name="rombel"
                value={formData.rombel}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Tingkat</label>
              <input
                type="text"
                name="tingkat"
                value={formData.tingkat}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Jurusan</label>
              <input
                type="text"
                name="jurusan"
                value={formData.jurusan}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Laki-laki</label>
                <input
                  type="number"
                  name="l"
                  value={formData.jmlh_l}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Perempuan</label>
                <input
                  type="number"
                  name="p"
                  value={formData.jmlh_p}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" variant="primary">
                Simpan
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Batal
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
};

export default EditDataRombel;
