// File: src/pages/Siswa/components/BiodataDiriSiswa.tsx
import { useEffect, useState } from "react";
import axios from "../../../api/axios";

interface SiswaProfile {
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

interface BiodataProps {
  targetId?: string | number;
  viewerRole: "Siswa" | "Orang Tua";
}

const BiodataDiriSiswa: React.FC<BiodataProps> = ({ targetId, viewerRole }) => {
  const [profile, setProfile] = useState<SiswaProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!targetId) return;

      setLoading(true);
      try {
        const endpointUrl =
          viewerRole === "Orang Tua"
            ? `/orangtua/${targetId}`
            : `/siswa/${targetId}`;

        const res = await axios.post(endpointUrl);

        const profileData = res.data?.data || res.data || null;
        setProfile(profileData);
      } catch (err) {
        console.error("Gagal memuat informasi biodata profil siswa:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [targetId, viewerRole]);

  const formatTanggal = (tanggalMentah?: string) => {
    if (!tanggalMentah) return "-";
    try {
      const cleanDate = tanggalMentah.split("T")[0];
      const [year, month, day] = cleanDate.split("-");
      return `${day}-${month}-${year}`;
    } catch (e) {
      return tanggalMentah;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-center">
        <div className="space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Memuat informasi data profil...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-center text-gray-400">
        ⚠️ Data biodata profil tidak berhasil ditemukan atau belum dikaitkan
        oleh sistem.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
      {/* Visual Header Profil */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex items-center gap-5">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center font-bold text-2xl border border-white/40 uppercase">
          {profile.nama?.substring(0, 2) || "ST"}
        </div>
        <div>
          <h2 className="text-xl font-bold">
            {profile.nama || "Nama Tidak Terdaftar"}
          </h2>
          <p className="text-sm text-blue-100 mt-0.5">
            Kelas: {profile.rombel || "-"} | NISN: {profile.nisn || "-"}
          </p>
        </div>
      </div>

      {/* Grid Informasi Detail */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Nomor Induk Siswa (NIS)
          </label>
          <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
            {profile.nisn || "-"}
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Kompetensi Keahlian (Jurusan)
          </label>
          <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
            {profile.jurusan || "-"}
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Kontak
          </label>
          <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
            {profile.no_telp || "-"}
          </p>
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Alamat Domisili Rumah
          </label>
          <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 leading-relaxed">
            {profile.alamat || "-"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BiodataDiriSiswa;
