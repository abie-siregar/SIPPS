import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";

const IdentitasSiswaRedirect: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        const res = await axios.get("/siswa");
        const students = res.data?.data || res.data || [];
        
        // Find matching student by name or username (NISN)
        const match = students.find(
          (s: any) =>
            s.nama?.toLowerCase() === user?.nama?.toLowerCase() ||
            s.nisn === user?.username
        );

        if (match) {
          navigate(`/data-siswa/${match.id_siswa}?tab=identitas`, { replace: true });
        } else {
          setError("Data identitas siswa Anda tidak ditemukan di sistem.");
        }
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data identitas siswa.");
      }
    };

    if (user) {
      fetchAndRedirect();
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      {error ? (
        <p className="text-red-500 font-semibold text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/50">
          {error}
        </p>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Memuat Identitas Siswa Anda...
          </p>
        </div>
      )}
    </div>
  );
};

export default IdentitasSiswaRedirect;
