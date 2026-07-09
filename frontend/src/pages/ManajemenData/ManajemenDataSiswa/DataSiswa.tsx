import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../../api/axios";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import Toast from "../../../components/ui/alert/Toast";
import ComponentCard from "../../../components/common/ComponentCard";
import Button from "../../../components/ui/button/Button";
import DataTable, { Column } from "../../../components/ui/table/DataTable";

export interface DetailSiswa {
  id_siswa?: number | string;
  id?: number | string;
  nama: string;
  nisn: string;
  alamat: string;
  no_telp: string;
  email: string;
  agama: string;
  tingkat: string;
  rombel: string;
  walikelas: string;
  jurusan: string;
}

export interface OrangTuaWali {
  id_orangtua: string;
  ayah: string;
  ibu: string;
  wali: string;
  no_telp: string;
  no_telp_rumah: string;
  no_kk: string;
  id_siswa: string;
  nama: string;
}

export interface RiwayatPelanggaran {
  id_pelanggaran: number;
  id_poin: number;
  id_semester: number;
  id_siswa: string;
  keterangan: string;
  jenis_penilaian: string;
  jenis_pelanggaran: string;
  poin: number;
  tanggal: string;
  id_ptk: string;
  nama_ptk: string;
  nama_jabatan: string;
  nama_semester: string;
  nama_siswa: string;
  nisn: string;
  walikelas: string;
  nama_rombel: string;
  nama_jurusan: string;
}

const DataSiswa = () => {
  const { id } = useParams<{ id: string }>(); // Mengambil ID siswa dinamis dari URL router
  const navigate = useNavigate();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingOrtu, setLoadingOrtu] = useState(false);
  const [loadingPelanggaran, setLoadingPelanggaran] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data states dengan inisialisasi lengkap mematuhi aturan tipe data kontrak TypeScript
  const [siswaForm, setSiswaForm] = useState<DetailSiswa>({
    nama: "",
    nisn: "",
    alamat: "",
    no_telp: "",
    email: "",
    agama: "",
    tingkat: "",
    rombel: "",
    walikelas: "",
    jurusan: "",
  });

  const [ortuForm, setOrtuForm] = useState<OrangTuaWali>({
    id_orangtua: "",
    ayah: "",
    ibu: "",
    wali: "",
    no_telp: "",
    no_telp_rumah: "",
    no_kk: "",
    id_siswa: "",
    nama: "",
  });

  const [riwayatPelanggaran, setRiwayatPelanggaran] = useState<
    RiwayatPelanggaran[]
  >([]);

  // UI Control states
  const [isEditMode, setIsEditMode] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    variant: "success" | "error";
    message: string;
  }>({
    show: false,
    variant: "success",
    message: "",
  });

  // 1. Ambil Biodata Siswa
  const fetchSiswaData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await axios.post(`/siswa/${id}`);
      const fetchedData = res.data.data || res.data;
      setSiswaForm(fetchedData);
    } catch (error) {
      console.error("Gagal mengambil biodata siswa:", error);
      setToast({
        show: true,
        variant: "error",
        message: "Gagal memuat biodata siswa.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. Ambil Data Orang Tua
  const fetchOrtuData = async () => {
    if (!id) return;
    setLoadingOrtu(true);
    try {
      const res = await axios.post(`/orangtua/${id}`);
      const fetchedData = res.data.data || res.data || {};

      // Menggabungkan data fallback agar properti kosong tidak memicu error TS
      setOrtuForm({
        id_orangtua: fetchedData.id_orangtua || "",
        ayah: fetchedData.ayah || "",
        ibu: fetchedData.ibu || "",
        wali: fetchedData.wali || "",
        no_telp: fetchedData.no_telp || "",
        no_telp_rumah: fetchedData.no_telp_rumah || "",
        no_kk: fetchedData.no_kk || "",
        id_siswa: fetchedData.id_siswa || String(id),
        nama: fetchedData.nama || "",
      });
    } catch (error) {
      console.error("Data orang tua belum ada, inisialisasi form kosong.");
      setOrtuForm({
        id_orangtua: "",
        ayah: "",
        ibu: "",
        wali: "",
        no_telp: "",
        no_telp_rumah: "",
        no_kk: "",
        id_siswa: String(id),
        nama: "",
      });
    } finally {
      setLoadingOrtu(false);
    }
  };

  // 3. Ambil Riwayat Pelanggaran
  const fetchPelanggaranData = async () => {
    if (!id) return;
    setLoadingPelanggaran(true);
    try {
      const res = await axios.post(`/pelanggaran-siswa/${id}`);
      const fetchedData = res.data.data || res.data || [];
      setRiwayatPelanggaran(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (error) {
      console.error("Gagal memuat riwayat pelanggaran:", error);
      setRiwayatPelanggaran([]);
    } finally {
      setLoadingPelanggaran(false);
    }
  };

  useEffect(() => {
    fetchSiswaData();
    fetchOrtuData();
    fetchPelanggaranData();
  }, [id]);

  // Handle Input Changes
  const handleSiswaChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setSiswaForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleOrtuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrtuForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle Update Action (Simpan Sekaligus)
  const handleSaveData = async () => {
    if (!siswaForm.nama?.trim() || !siswaForm.nisn?.trim()) {
      setToast({
        show: true,
        variant: "error",
        message: "Nama dan NISN siswa wajib diisi!",
      });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Update Data Siswa
      await axios.put(`/siswa/${id}`, siswaForm);

      // 2. Update atau Buat Baru Data Orang Tua
      if (ortuForm.id_orangtua) {
        await axios.put(`/orangtua/${ortuForm.id_siswa}`, ortuForm);
      } else {
        await axios.post(`/orangtua`, ortuForm);
      }

      setToast({
        show: true,
        variant: "success",
        message: "Seluruh data siswa berhasil diperbarui!",
      });
      setIsEditMode(false);
      fetchSiswaData();
      fetchOrtuData();
    } catch (error: any) {
      console.error(error);
      setToast({
        show: true,
        variant: "error",
        message:
          error?.response?.data?.error || "Gagal menyimpan perubahan data.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Kolom konfigurasi untuk Tabel Riwayat Pelanggaran
  const pelanggaranColumns: Column<RiwayatPelanggaran>[] = [
    {
      header: "No",
      accessor: "id_pelanggaran",
      render: (_, index) => (index ?? 0) + 1,
      className: "w-12",
    },
    {
      header: "Tanggal",
      accessor: "tanggal",
      className: "w-32",
      render: (row) => {
        if (!row.tanggal) return "-";
        try {
          // Ambil bagian "2026-06-11" sebelum huruf T, lalu pecah berdasarkan '-'
          const [year, month, day] = row.tanggal.split("T")[0].split("-");
          return `${day}-${month}-${year}`; // Hasil: 11-06-2026
        } catch (error) {
          return "-";
        }
      },
    },
    {
      header: "Pelanggaran",
      accessor: "jenis_pelanggaran",
      className: "w-64",
    },
    { header: "Kategori", accessor: "jenis_penilaian", className: "w-32" },
    {
      header: "Poin",
      accessor: "poin",
      className: "w-20 font-bold text-red-600 dark:text-red-400",
    },
    { header: "Keterangan", accessor: "keterangan" },
  ];

  if (loading) {
    return (
      <div className="p-6 text-center dark:text-gray-400 animate-pulse">
        Memuat profil data siswa...
      </div>
    );
  }

  return (
    <>
      <PageBreadcrumb pageTitle={`Profil : ${siswaForm.nama || "Siswa"}`} />
      <Toast
        show={toast.show}
        variant={toast.variant}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      <div className="space-y-6">
        <ComponentCard title="">
          <div className="flex justify-between items-center w-full pb-4 mb-4 border-b border-gray-200 dark:border-gray-800">
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              Manajemen Profil
            </h4>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => navigate(-1)}>
                Kembali
              </Button>
              {isEditMode ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditMode(false)}
                    disabled={submitting}
                  >
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSaveData}
                    disabled={submitting}
                  >
                    {submitting ? "Menyimpan..." : "Simpan"}
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsEditMode(true)}
                >
                  Perbarui Data
                </Button>
              )}
            </div>
          </div>

          <div className="p-2 space-y-6 text-left">
            <div>
              <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3 border-b pb-1 dark:border-gray-800">
                A. Data Diri Siswa
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Nama Lengkap
                  </label>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="nama"
                      value={siswaForm.nama || ""}
                      disabled
                      className="w-full px-3 py-1.5 text-sm border rounded border-gray-300 bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 cursor-not-allowed"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {siswaForm.nama || "-"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    NISN
                  </label>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="nisn"
                      value={siswaForm.nisn || ""}
                      disabled
                      className="w-full px-3 py-1.5 text-sm border rounded border-gray-300 bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 cursor-not-allowed"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {siswaForm.nisn || "-"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Agama
                  </label>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="agama"
                      value={siswaForm.agama || ""}
                      onChange={handleSiswaChange}
                      className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-700"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {siswaForm.agama || "-"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Nomor Telepon
                  </label>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="no_telp"
                      value={siswaForm.no_telp || ""}
                      onChange={handleSiswaChange}
                      className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-700"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {siswaForm.no_telp || "-"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Email
                  </label>
                  {isEditMode ? (
                    <input
                      type="email"
                      name="email"
                      value={siswaForm.email || ""}
                      onChange={handleSiswaChange}
                      className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-700"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white break-all">
                      {siswaForm.email || "-"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Alamat Tempat Tinggal
                  </label>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="alamat"
                      value={siswaForm.alamat || ""}
                      onChange={handleSiswaChange}
                      className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-700"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {siswaForm.alamat || "-"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-3 border-b pb-1 dark:border-gray-800">
                B. Data Akademik
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Tingkat
                  </label>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="tingkat"
                      value={siswaForm.tingkat || ""}
                      disabled
                      className="w-full px-3 py-1.5 text-sm border rounded border-gray-300 bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 cursor-not-allowed"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {siswaForm.tingkat || "-"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Rombongan Belajar
                  </label>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="rombel"
                      value={siswaForm.rombel || ""}
                      disabled
                      className="w-full px-3 py-1.5 text-sm border rounded border-gray-300 bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 cursor-not-allowed"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {siswaForm.rombel || "-"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Jurusan
                  </label>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="jurusan"
                      value={siswaForm.jurusan || ""}
                      disabled
                      className="w-full px-3 py-1.5 text-sm border rounded border-gray-300 bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 cursor-not-allowed"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {siswaForm.jurusan || "-"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Wali Kelas
                  </label>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="walikelas"
                      value={siswaForm.walikelas || ""}
                      disabled
                      className="w-full px-3 py-1.5 text-sm border rounded border-gray-300 bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 cursor-not-allowed"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {siswaForm.walikelas || "-"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3 border-b pb-1 dark:border-gray-800">
                C. Data Orang Tua / Wali
              </h4>
              {loadingOrtu ? (
                <p className="text-xs text-gray-400 animate-pulse">
                  Memuat data orang tua...
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      No. Kartu Keluarga (KK)
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        name="no_kk"
                        value={ortuForm.no_kk || ""}
                        onChange={handleOrtuChange}
                        className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-700"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {ortuForm.no_kk || "-"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Nama Ayah
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        name="ayah"
                        value={ortuForm.ayah || ""}
                        onChange={handleOrtuChange}
                        className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-700"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {ortuForm.ayah || "-"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Nama Ibu
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        name="ibu"
                        value={ortuForm.ibu || ""}
                        onChange={handleOrtuChange}
                        className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-700"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {ortuForm.ibu || "-"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Nama Wali (Opsional)
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        name="wali"
                        value={ortuForm.wali || ""}
                        onChange={handleOrtuChange}
                        className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-700"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {ortuForm.wali || "-"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Nomor Telepon Seluler
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        name="no_telp"
                        value={ortuForm.no_telp || ""}
                        onChange={handleOrtuChange}
                        className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-700"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {ortuForm.no_telp || "-"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Telepon Rumah
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        name="no_telp_rumah"
                        value={ortuForm.no_telp_rumah || ""}
                        onChange={handleOrtuChange}
                        className="w-full px-3 py-1.5 text-sm border rounded bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-700"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {ortuForm.no_telp_rumah || "-"}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Riwayat Pelanggaran Siswa">
          {loadingPelanggaran ? (
            <p className="text-center py-4 dark:text-gray-400 animate-pulse">
              Memuat riwayat catatan...
            </p>
          ) : (
            <DataTable
              columns={pelanggaranColumns}
              data={riwayatPelanggaran}
              searchable={false}
              paginated={riwayatPelanggaran.length > 5}
              defaultItemsPerPage={5}
            />
          )}
        </ComponentCard>
      </div>
    </>
  );
};

export default DataSiswa;
