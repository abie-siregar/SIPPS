import { useEffect, useState } from "react";
import axios from "../../../api/axios";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import DataTable, { Column } from "../../../components/ui/table/DataTable";

export interface PTK {
  ptk_id: number;
  nama: string;
  nuptk: string;
  nip: string;
  email: string;
  jenis_ptk_id_str: string;
  jabatan_ptk_id_str: string;
}

const DataPTK = () => {
  const [data, setData] = useState<PTK[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/ptk");
      setData(res.data.data || res.data || []);
      console.log("API result:", res.data);
      console.table(res.data?.data ?? res.data);

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
    jenis: row.jenis_ptk_id_str ?? "-",
    jabatan:
      row.jabatan_ptk_id_str === null ||
      row.jabatan_ptk_id_str === undefined ||
      row.jabatan_ptk_id_str.toUpperCase() === "NULL"
        ? "-"
        : row.jabatan_ptk_id_str,
    nuptk: row.nuptk !== null ? row.nuptk.toString() : "-",
    nip: row.nip !== null ? row.nip.toString() : "-",
    email: row.email ?? "-",
  }));

  const columns: Column<PTK>[] = [
    {
      header: "No",
      accessor: "ptk_id",
      render: (_row, rowIndex) => (rowIndex ?? 0) + 1,
      className: "w-16 !text-center ",
    },
    { header: "Nama", accessor: "nama", className: " w-40 "},
    // { header: "Jenis PTK", accessor: "jenis" },
    { header: "Jabatan PTK", accessor: "jabatan", className:"w-48 !text-center" },
    { header: "NUPTK", accessor: "nuptk", className:"w-40 !text-center " },
    { header: "E-Mail", accessor: "email", className:"w-64 truncate" },
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
              filterColumns={["jenis", "jabatan"]}
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
