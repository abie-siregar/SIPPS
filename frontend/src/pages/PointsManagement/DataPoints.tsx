import { useEffect, useState } from "react";
import axios from "../../api/axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

interface Pelanggaran {
  id: number;
  jenis_pelanggaran: string;
  bobot: number;
  jenis: string;
}

const DataPoints = () => {
  const [data, setData] = useState<Pelanggaran[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPelanggaran = async () => {
      try {
        const res = await axios.get("/pelanggaran");
        setData(res.data);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPelanggaran();
  }, []);

  return (
    <>
      <PageMeta
        title="Data Pelanggaran | Dashboard SMKN 1 Batam"
        description="Halaman menampilkan tabel data pelanggaran siswa"
      />
      <PageBreadcrumb pageTitle="Data Pelanggaran" />
      <div className="space-y-6">
        <ComponentCard title="Tabel Pelanggaran Siswa">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-auto w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border">No</th>
                    <th className="px-4 py-2 border text-left">
                      Jenis Pelanggaran
                    </th>
                    <th className="px-4 py-2 border">Bobot</th>
                    <th className="px-4 py-2 border">Jenis</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border text-center">
                        {index + 1}
                      </td>
                      <td className="px-4 py-2 border">
                        {row.jenis_pelanggaran}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {row.bobot}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {row.jenis}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
};

export default DataPoints;
