import { useEffect, useState } from "react";
import axios from "../../../api/axios";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import { PencilIcon } from "../../../icons";
import DataTable, { Column } from "../../../components/ui/table/DataTable";

export interface Rombel {
  id_rombel: number;
  wali_kelas: string;
  rombel: string;
  tingkat: string;
  jmlh_l: number;
  jmlh_p: number;
  jurusan: string;
}

const DataRombel = () => {
  const [data, setData] = useState<Rombel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<Rombel | null>(null);

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

  const handleEdit = (row: Rombel) => {
    setSelectedRow(row);
  };

  const columns: Column<Rombel>[] = [
    {
      header: "No",
      accessor: "id_rombel",
      render: (_row, rowIndex) => (rowIndex ?? 0) + 1,
      className: "text-center w-16",
    },
    { header: "Wali Kelas", accessor: "wali_kelas" },
    { header: "Rombel", accessor: "rombel" },
    { header: "Tingkat", accessor: "tingkat", className: "text-center w-24" },
    { header: "L", accessor: "jmlh_l", className: "text-center w-20" },
    { header: "P", accessor: "jmlh_p", className: "text-center w-20" },
    { header: "Jurusan", accessor: "jurusan" },
    // {
    //   header: "Aksi",
    //   accessor: "id_rombel",
    //   render: (row) => (
    //     <Button
    //       size="sm"
    //       variant="primary"
    //       startIcon={<PencilIcon className="size-4" />}
    //       onClick={() => handleEdit(row)}
    //     >
    //       Edit
    //     </Button>
    //   ),
    //   className: "text-center w-32",
    // },
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
              filterColumns={["wali_kelas", "rombel", "tingkat", "jurusan"]}
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
