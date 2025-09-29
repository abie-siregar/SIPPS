import { useEffect, useState } from "react";
import axios from "../../../api/axios";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import DataTable, { Column } from "../../../components/ui/table/DataTable";

export interface Siswa {
  id: number;
  nama: string;
  nisn: string;
  rombel: string;
}

const DataSiswa = () => {
  const [data, setData] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/siswa");
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
    nama:
      row.nama === null ||
      row.nama === undefined ||
      row.nama.toUpperCase() === "NULL"
        ? "-"
        : row.nama,
    nisn:
      row.nisn === null ||
      row.nisn === undefined ||
      row.nisn.toUpperCase() === "NULL"
        ? "-"
        : row.nisn,
    rombel:
      row.rombel === null ||
      row.rombel === undefined ||
      row.rombel.toUpperCase() === "NULL"
        ? "-"
        : row.rombel,
  }));

  const columns: Column<Siswa>[] = [
    {
      header: "No",
      accessor: "siswa_id",
      render: (_row, rowIndex) => (rowIndex ?? 0) + 1,
      className: "text-center w-16",
    },
    { header: "Nama", accessor: "nama" },
    { header: "NISN", accessor: "nisn", className: "text-center w-32" },
    { header: "Rombel", accessor: "rombel" },
  ];

  return (
    <>
      <PageMeta
        title="Data Siswa | Dashboard SMKN 1 Batam"
        description="Halaman menampilkan tabel data siswa"
      />
      <PageBreadcrumb pageTitle="Data Siswa" />
      <div className="space-y-6">
        <ComponentCard title="Tabel Data Siswa">
          {loading ? (
            <p className="text-center dark:text-gray-400">Loading...</p>
          ) : (
            <DataTable
              columns={columns}
              data={processedData}
              searchable
              filterable
              filterColumns={["rombel"]}
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

export default DataSiswa;
