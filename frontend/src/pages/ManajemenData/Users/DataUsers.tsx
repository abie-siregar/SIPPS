import { useEffect, useState, useMemo } from "react";
import axios from "../../../api/axios";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import DataTable, { Column } from "../../../components/ui/table/DataTable";
import Button from "../../../components/ui/button/Button";
import FilterUserModal from "./FilterUserModal";

export interface Users {
  id_user: string;
  username: string;
  nama: string;
  nama_role: string;
}

const DataUsers = () => {
  const [data, setData] = useState<Users[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string[]>([]);

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

  // Extract unique filter options dynamically from processed data
  const availableRole = useMemo(() => {
    const list = processedData
      .map((item) => item.nama_role)
      .filter((rl) => rl && rl !== "-");
    return Array.from(new Set(list)).sort();
  }, [processedData]);

  // Compute local filteredData
  const filteredData = useMemo(() => {
    return processedData.filter((row) => {
      // 1. Role filter
      if (selectedRole.length > 0 && !selectedRole.includes(row.nama_role)) {
        return false;
      }
      return true;
    });
  }, [processedData, selectedRole]);

  const filterValues = useMemo(
    () => ({
      selectedRole,
    }),
    [selectedRole],
  );

  const handleApplyFilters = (filters: typeof filterValues) => {
    setSelectedRole(filters.selectedRole);
  };

  const columns: Column<Users>[] = [
    {
      header: "No",
      accessor: "username",
      render: (_row, rowIndex) => (rowIndex ?? 0) + 1,
      className: "text-center w-16",
    },
    { header: "Username", accessor: "username", className: "w-40" },
    { header: "Nama", accessor: "nama", className: "w-48" },
    { header: "Role", accessor: "nama_role", className: "w-28 text-center" },
  ];

  // Calculate active filters badge count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedRole.length > 0) count++;
    return count;
  }, [selectedRole]);

  return (
    <>
      <PageMeta
        title="Data Users | Dashboard SMKN 1 Batam"
        description="Halaman menampilkan tabel data Users"
      />
      <PageBreadcrumb pageTitle="Data Users" />

      {/* Filter Modal */}
      <FilterUserModal
        show={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        initialValues={filterValues}
        availableRole={availableRole}
      />

      <div className="space-y-6">
        <ComponentCard title="Tabel Data User">
          {loading ? (
            <p className="text-center dark:text-gray-400">Loading...</p>
          ) : (
            <DataTable
              columns={columns}
              data={filteredData}
              searchable
              paginated
              itemsPerPageOptions={[5, 10, 20, 50]}
              defaultItemsPerPage={10}
              extraActions={
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={activeFiltersCount > 0 ? "primary" : "outline"}
                    onClick={() => setShowFilterModal(true)}
                    className="relative"
                  >
                    🔍 Filter
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {activeFiltersCount}
                      </span>
                    )}
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
