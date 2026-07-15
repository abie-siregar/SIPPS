import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";

interface Child {
  id_siswa: string;
  nama: string;
  nisn: string;
  kelas: string;
  jurusan: string;
}

interface AnakRedirectProps {
  type: "identitas" | "riwayat";
}

const AnakRedirect: React.FC<AnakRedirectProps> = ({ type }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await axios.get("/orangtua/my-children");
        const list = res.data?.data || res.data || [];
        setChildren(list);

        if (list.length === 1) {
          // If only 1 child, redirect immediately
          navigate(`/data-siswa/${list[0].id_siswa}?tab=${type === "identitas" ? "identitas" : "riwayat"}`, {
            replace: true,
          });
        }
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || "Gagal memuat data anak.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchChildren();
    }
  }, [user, navigate, type]);

  const handleSelect = (childId: string) => {
    navigate(`/data-siswa/${childId}?tab=${type === "identitas" ? "identitas" : "riwayat"}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Memuat Data Anak Anda...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="p-6 max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl border border-red-100 dark:border-red-950 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center mx-auto mb-4 text-red-500 font-bold text-xl">
            !
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Terjadi Kesalahan</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="p-6 max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-yellow-50 dark:bg-yellow-950/20 flex items-center justify-center mx-auto mb-4 text-yellow-500 font-bold text-xl">
            ?
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Belum Terhubung</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Akun Anda belum terhubung dengan data Siswa manapun di sistem. Silakan hubungi pihak sekolah.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <span className="px-3 py-1 text-xs font-semibold bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full">
          ORANG TUA / WALI
        </span>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-3">
          Pilih Anak
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Silakan pilih data anak yang ingin Anda lihat detail {type === "identitas" ? "identitasnya" : "riwayat pelanggarannya"}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.map((child) => (
          <div
            key={child.id_siswa}
            onClick={() => handleSelect(child.id_siswa)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 dark:hover:border-blue-600 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {child.nama}
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  NISN: {child.nisn}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                    Kelas: {child.kelas || "-"}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300">
                    {child.jurusan || "-"}
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                →
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnakRedirect;
