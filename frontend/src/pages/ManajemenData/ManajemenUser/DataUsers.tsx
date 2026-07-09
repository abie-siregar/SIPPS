import { useEffect, useState, useMemo } from "react";
import axios from "../../../api/axios";
import ComponentCard from "../../../components/common/ComponentCard";
import DataTable, { Column } from "../../../components/ui/table/DataTable";
import Button from "../../../components/ui/button/Button";
import FilterUserModal from "../../ManajemenData/Users/FilterUserModal";
import TambahUserModal from "../ManajemenUser/TambahUserModal";
import EditUserModal from "./EditUserModal";
import HapusUserModal from "./HapusUserModal";

export interface Users {
  id_user?: number | string; // Pastikan backend melempar ID (id_user / id)
  id?: number | string;
  username: string;
  nama: string;
  nama_role: string;
}

const DataUsers = () => {
  const [data, setData] = useState<Users[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"all" | "ptk" | "siswa" | "ortu">(
    "all",
  );

  const [showTambahModal, setShowTambahModal] = useState(false);
  const [showHapusModal, setShowHapusModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Users | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/user/all");
      const fetchedData = res.data.data || res.data || [];
      setData(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const processedData = useMemo(() => {
    return data.map((row) => ({
      ...row,
      username: row.username ?? "-",
      nama: row.nama ?? "-",
      nama_role: row.nama_role ?? "-",
    }));
  }, [data]);

  const availableRole = useMemo(() => {
    const list = processedData
      .map((item) => item.nama_role)
      .filter((rl) => rl && rl !== "-");
    return Array.from(new Set(list)).sort();
  }, [processedData]);

  const filteredData = useMemo(() => {
    return processedData.filter((row) => {
      const roleLower = row.nama_role.toLowerCase();

      if (activeTab === "ptk") {
        if (
          !(
            roleLower.includes("ptk") ||
            roleLower.includes("guru") ||
            roleLower.includes("admin")
          )
        ) {
          return false;
        }
      }
      if (activeTab === "siswa") {
        if (!roleLower.includes("siswa")) return false;
      }
      if (activeTab === "ortu") {
        if (
          !(
            roleLower.includes("orangtua") ||
            roleLower.includes("ortu") ||
            roleLower.includes("wali")
          )
        ) {
          return false;
        }
      }

      if (selectedRole.length > 0 && !selectedRole.includes(row.nama_role)) {
        return false;
      }
      return true;
    });
  }, [processedData, selectedRole, activeTab]);

  const filterValues = useMemo(() => ({ selectedRole }), [selectedRole]);

  const handleApplyFilters = (filters: typeof filterValues) => {
    setSelectedRole(filters.selectedRole);
  };
  const handleEditUser = (row: Users) => {
    setSelectedUser(row);
    setShowEditModal(true);
  };

  const handleHapusUser = (row: Users) => {
    setSelectedUser(row);
    setShowHapusModal(true);
  };

  const columns: Column<Users>[] = [
    {
      header: "No",
      accessor: "username",
      render: (_row, rowIndex) => (rowIndex ?? 0) + 1,
      className: "w-12",
    },
    { header: "Nama", accessor: "nama", className: "w-48" },
    { header: "Username", accessor: "username", className: "w-40" },
    { header: "Role", accessor: "nama_role", className: "w-32" },
    {
      header: "Aksi",
      accessor: "username",
      className: "text-center w-52",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditUser(row)} // Otomatis mengirim data baris spesifik
            className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-blue-950/30"
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleHapusUser(row)}
            className="text-amber-600 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-900/50 dark:hover:bg-amber-950/30"
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <FilterUserModal
        show={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        initialValues={filterValues}
        availableRole={availableRole}
      />

      <TambahUserModal
        show={showTambahModal}
        onClose={(didSave) => {
          setShowTambahModal(false);
          if (didSave) {
            fetchData();
          }
        }}
      />

      <EditUserModal
        show={showEditModal}
        row={selectedUser}
        onClose={(didSave) => {
          setShowEditModal(false);
          setSelectedUser(null); // Bersihkan state setelah ditutup
          if (didSave) {
            fetchData(); // Auto refresh tabel jika user berhasil diedit ke database
          }
        }}
      />

      <HapusUserModal
        show={showHapusModal}
        row={selectedUser}
        onClose={(didSave) => {
          setShowHapusModal(false);
          setSelectedUser(null);
          if (didSave) {
            fetchData();
          }
        }}
      />

      <div className="space-y-6">
        <ComponentCard title="Manajemen Akun">
          {loading ? (
            <p className="dark:text-gray-400 text-center py-4">Loading...</p>
          ) : (
            <DataTable
              columns={columns}
              data={filteredData}
              searchable
              paginated
              itemsPerPageOptions={[5, 10, 20, 50]}
              defaultItemsPerPage={10}
              extraActions={
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 mr-2">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Kategori:
                    </label>
                    <select
                      value={activeTab}
                      onChange={(e) => setActiveTab(e.target.value as any)}
                      className="text-sm px-3 py-1.5 font-medium border border-gray-200 bg-white rounded-lg text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                    >
                      <option value="all">Semua Pengguna</option>
                      <option value="ptk">PTK</option>
                      <option value="siswa">Siswa</option>
                      <option value="ortu">Wali Kelas / Orang Tua</option>
                    </select>
                  </div>

                  <Button
                    size="sm"
                    variant={selectedRole.length > 0 ? "primary" : "outline"}
                    onClick={() => setShowFilterModal(true)}
                    className="relative"
                  >
                    🔍 Filter Role
                    {selectedRole.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {selectedRole.length}
                      </span>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setShowTambahModal(true)}
                  >
                    + Tambah User
                  </Button>
                </div>
              }
            />
          )}
        </ComponentCard>
      </div>
    </>
  );
};

export default DataUsers;
