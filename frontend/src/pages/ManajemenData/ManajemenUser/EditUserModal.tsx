import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import Button from "../../../components/ui/button/Button";
import { useToast } from "../../../context/ToastContext";

interface UsersExtended {
  id_user?: number | string;
  username: string;
  nama: string;
  nama_role: string;
  id_role?: number;
}

interface Role {
  id_role: number;
  nama_role: string;
}

interface EditPopupProps {
  show: boolean;
  onClose: (didSave?: boolean) => void;
  row: UsersExtended | null;
}

const EditUserModal: React.FC<EditPopupProps> = ({ show, onClose, row }) => {
  const { showSuccess, showError } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [idRole, setIdRole] = useState("");
  const [roleList, setRoleList] = useState<Role[]>([]);

  const [isVisible, setIsVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!show || !row) {
      setIsVisible(false);
      setUsername("");
      setPassword("");
      setIdRole("");
      return;
    }

    setUsername(row.username || "");
    setPassword("");

    const initModalData = async () => {
      try {
        const res = await axios.get("/role/all");
        const roles = res.data?.data || res.data || [];
        setRoleList(roles);

        setIdRole((currentSelected) => {
          if (currentSelected !== "") return currentSelected;

          const matched = roles.find(
            (r: Role) => r.nama_role === row.nama_role,
          );
          if (matched) return matched.id_role.toString();
          if (row.id_role) return row.id_role.toString();
          return "";
        });
      } catch (err) {
        console.error("Gagal memuat master data role:", err);
      }
    };

    initModalData();
    setTimeout(() => setIsVisible(true), 10);
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !idRole) {
      showError("Username dan Role wajib diisi");
      return;
    }

    if (!row || !row.id_user) {
      showError("ID User tidak valid.");
      return;
    }

    try {
      setSubmitting(true);

      const payload: any = {
        username: username.trim(),
        role: idRole,
      };

      if (password) {
        payload.password = password;
      }

      await axios.put(`/user/${row.id_user}`, payload);

      showSuccess("Data pengguna berhasil diperbarui!");
      setIsVisible(false);
      setTimeout(() => onClose(true), 300);
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Gagal mengupdate data User.";
      showError(msg);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(false), 300);
  };

  if (!show || !row) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      <div
        className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 transform ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-xl p-6 relative">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2">
            Edit Akun
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-400 dark:text-gray-500">
                Nama
              </label>
              <input
                type="text"
                value={row.nama}
                disabled
                className="w-full border px-3 py-2 rounded bg-gray-100 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-400 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                Username Baru
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Masukkan Username"
              />
            </div>

            {/* Dropdown Role */}
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                Role / Hak Akses
              </label>
              <select
                value={idRole}
                onChange={(e) => setIdRole(e.target.value)}
                className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="" disabled>
                  Pilih Role
                </option>
                {roleList.map((r) => (
                  <option key={r.id_role} value={r.id_role.toString()}>
                    {r.nama_role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-white/90">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Masukkan Password Baru jika ingin diganti"
              />
            </div>

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
                disabled={submitting}
              >
                {submitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditUserModal;
