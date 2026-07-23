import React, { useEffect, useState, useMemo } from "react";
import axios from "../../../api/axios";
import Button from "../../../components/ui/button/Button";
import SearchableSelect from "../../../components/form/SearchableSelect";
import { useToast } from "../../../context/ToastContext";

interface TambahPopupProps {
  show: boolean;
  onClose: (didSave?: boolean) => void;
}

interface Role {
  id_role: number;
  nama_role: string;
}

const TambahUserModal: React.FC<TambahPopupProps> = ({ show, onClose }) => {
  const { showSuccess, showError } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [idRole, setIdRole] = useState("");
  const [roleList, setRoleList] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // 🔄 Sinkronisasi state animasi buka/tutup dan fetching data
  useEffect(() => {
    if (show) {
      setIsVisible(true);

      const loadRoles = async () => {
        try {
          const res = await axios.get("/role/all");
          const roleData = res.data?.data || res.data || [];
          setRoleList(roleData);

          if (roleData.length > 0) {
            const defaultId = roleData[0].id_role ?? roleData[0].id;
            if (defaultId !== undefined && defaultId !== null) {
              setIdRole(defaultId.toString());
            }
          }
        } catch (err) {
          console.error("Gagal memuat dropdown data:", err);
          showError("Gagal memuat data pendukung role.");
        }
      };

      loadRoles();
    } else {
      setIsVisible(false);
      setUsername("");
      setPassword("");
      setEmail("");
      setIdRole("");
    }
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim() || !email.trim() || !idRole) {
      showError("Semua field form wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/user/create", {
        username: username.trim(),
        password: password,
        email: email.trim(),
        id_role: idRole,
      });

      showSuccess("Pengguna baru berhasil ditambahkan!");
      setIsVisible(false);
      setTimeout(() => onClose(true), 300);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || "Gagal menambahkan data user baru.";
      showError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(false), 300);
  };

  // Mapping options untuk SearchableSelect
  const roleOptions = useMemo(() => {
    return (roleList || [])
      .filter(
        (r) => r && (r.id_role !== undefined || (r as any).id !== undefined),
      )
      .map((r) => {
        const id = r.id_role ?? (r as any).id;
        return {
          value: id.toString(),
          label: r.nama_role || "Tanpa Nama Role",
        };
      });
  }, [roleList]);

  if (!show) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal Wrapper */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-xl p-6 relative max-h-[90vh] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2">
            👤 Tambah User Baru
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                Username
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan Username"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Password"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan Alamat Email"
              />
            </div>

            {/* Role / Hak Akses */}
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                Role / Hak Akses
              </label>
              <SearchableSelect
                options={roleOptions}
                value={idRole}
                onChange={setIdRole}
                placeholder="Pilih Role"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t mt-4">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleClose}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Tambah User"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default TambahUserModal;
