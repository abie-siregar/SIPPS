import { useEffect, useState } from "react";
import axios from "../../../api/axios";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import DataTable, { Column } from "../../../components/ui/table/DataTable";

export interface Users {
  id: number;
  username: string;
  nama: string;
  email: string;
  roles: string;
}

const DataUsers = () => {
  const [data, setData] = useState<Users[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/user/all");
      setData(res.data.data || res.data || []);
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

  const processedData = data.map((row) => ({
    ...row,
    username:
      row.username === null ||
      row.username === undefined ||
      row.username.toUpperCase() === "NULL"
        ? "-"
        : row.username,
    nama:
      row.nama === null ||
      row.nama === undefined ||
      row.nama.toUpperCase() === "NULL"
        ? "-"
        : row.nama,
    email:
      row.email === null ||
      row.email === undefined ||
      row.email.toUpperCase() === "NULL"
        ? "-"
        : row.email,
    roles:
      row.roles === null ||
      row.roles === undefined ||
      row.roles.toUpperCase() === "NULL"
        ? "-"
        : row.roles,
  }));

  const columns: Column<Users>[] = [
    {
      header: "No",
      accessor: "user_id",
      render: (_row, rowIndex) => (rowIndex ?? 0) + 1,
      className: "text-center w-16",
    },
    { header: "Username", accessor: "username", className: "w-40" },
    { header: "Nama", accessor: "nama", className: "w-48" },
    { header: "Email", accessor: "email", className: "text-center w-56 truncate" },
    { header: "Roles", accessor: "nama_role", className: "w-28 text-center" },
  ];

  return (
    <>
      <PageMeta
        title="Data Users | Dashboard SMKN 1 Batam"
        description="Halaman menampilkan tabel data Users"
      />
      <PageBreadcrumb pageTitle="Data Users" />
      <div className="space-y-6">
        <ComponentCard title="Tabel Data User">
          {loading ? (
            <p className="text-center dark:text-gray-400">Loading...</p>
          ) : (
            <DataTable
              columns={columns}
              data={processedData}
              searchable
              filterable
              filterColumns={["roles"]}
              paginated
              itemsPerPageOptions={[5, 10, 20, 50]}
              defaultItemsPerPage={10}
            />
          )}
        </ComponentCard>
      </div>
    </>
  );
};

export default DataUsers;
