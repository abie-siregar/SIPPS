import { useEffect, useState } from "react";
import axios from "../../../api/axios";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
// import Button from "../../../components/ui/button/Button"; //un-comment original -run test server ta2022
// import { PencilIcon } from "../../../icons"; //un-comment original -run test server ta2022
import DataTable, { Column } from "../../../components/ui/table/DataTable";

export interface Rombel {
  rombel_id: number;
  wali_kelas: string;
  nama: string;
  tingkat: string;
  jurusan: string;
}

const DataRombel = () => {
  const [data, setData] = useState<Rombel[]>([]);
  const [loading, setLoading] = useState(true);
  // const [, setSelectedRow] = useState<Rombel | null>(null); // un-comment original -run test server ta2022
  // const [selectedRow, setSelectedRow] = useState<Rombel | null>(null); //un-comment original -run test server ta2022

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/rombel", {
        params: {
          search: "",
          tingkat: [],
          jurusan: [],
        },
      });

      setData(res.data || []); // pastikan selalu array
      console.log("Data rombel:", data);
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

  // const handleEdit = (row: Rombel) => { //un-comment original -run test server ta2022
  //   setSelectedRow(row); //un-comment original -run test server ta2022
  // }; //un-comment original -run test server ta2022

  const columns: Column<Rombel>[] = [
    {
      header: "No",
      accessor: "rombel_id",
      render: (_row, rowIndex) => (rowIndex ?? 0) + 1,
      className: "text-center w-16",
    },
    { header: "Wali Kelas", accessor: "wali_kelas" },
    { header: "Rombel", accessor: "nama" },
    { header: "Tingkat", accessor: "tingkat_id", className: "text-center w-24" },
    { header: "Jurusan", accessor: "jurusan_id_str" },
  ];

  return (
    <>
      <PageMeta
        title="Data Rombongan Belajar | Dashboard SMKN 1 Batam"
        description="Halaman menampilkan tabel data rombel"
      />
      <PageBreadcrumb pageTitle="Data Rombongan Belajar" />
      <div className="space-y-6">
        <ComponentCard title="Tabel Rombongan Belajar">
          {loading ? (
            <p className="text-center dark:text-gray-400">Loading...</p>
          ) : (
            <DataTable
              columns={columns}
              data={data}
              searchable
              filterable
              filterColumns={["wali_kelas", "nama", "tingkat", "jurusan"]}
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

export default DataRombel;
