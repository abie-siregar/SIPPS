import { useEffect, useState } from "react";
import axios from "../../../api/axios";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import DataTable, { Column } from "../../../components/ui/table/DataTable";

export interface PTK {
  id: number;
  nama: string;
  alamat: string;
  jenis_ptk: string;
  tugas_tambahan: string;
  hp: string;
  email: string;
}

const DataPTK = () => {
  const [data, setData] = useState<PTK[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/ptk");
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
    nama: row.nama ?? "-",
    jenis_ptk: row.jenis_ptk ?? "-",
    tugas_tambahan:
      row.tugas_tambahan === null ||
      row.tugas_tambahan === undefined ||
      row.tugas_tambahan.toUpperCase() === "NULL"
        ? "-"
        : row.tugas_tambahan,
    hp: row.hp !== null ? row.hp.toString() : "-",
    email: row.email ?? "-",
    alamat: row.alamat ?? "-",
  }));

  const columns: Column<PTK>[] = [
    {
      header: "No",
      accessor: "id",
      render: (_row, rowIndex) => (rowIndex ?? 0) + 1,
      className: "text-center w-16",
    },
    { header: "Nama", accessor: "nama" },
    { header: "Jenis PTK", accessor: "jenis_ptk" },
    { header: "Tugas Tambahan", accessor: "tugas_tambahan" },
    { header: "No Handphone", accessor: "hp", className: "text-center w-32" },
    { header: "E-Mail", accessor: "email" },
  ];

  return (
    <>
      <PageMeta
        title="Data Pendidik dan Tenaga Kependidikan | Dashboard SMKN 1 Batam"
        description="Halaman menampilkan tabel data Pendidik dan Tenaga Kependidikan"
      />
      <PageBreadcrumb pageTitle="Data Pendidik dan Tenaga Kependidikan" />
      <div className="space-y-6">
        <ComponentCard title="Tabel Data Pendidik dan Tenaga Kependidikan">
          {loading ? (
            <p className="text-center dark:text-gray-400">Loading...</p>
          ) : (
            <DataTable
              columns={columns}
              data={processedData}
              searchable
              filterable
              filterColumns={["jenis_ptk", "tugas_tambahan"]}
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

export default DataPTK;
