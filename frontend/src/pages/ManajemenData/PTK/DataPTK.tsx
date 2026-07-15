import { useEffect, useState, useMemo } from "react";
import axios from "../../../api/axios";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import DataTable, { Column } from "../../../components/ui/table/DataTable";
import Button from "../../../components/ui/button/Button";
import FilterPTKModal from "./FilterPTKModal";

export interface PTK {
  id_ptk: number;
  nama: string;
  nuptk: string;
  email: string;
  jabatan: string;
}

const DataPTK = () => {
  const [data, setData] = useState<PTK[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedJabatan, setSelectedJabatan] = useState<string[]>([]);
  const [nuptkFilter, setNuptkFilter] = useState<string>("");
  const [emailFilter, setEmailFilter] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/ptk");
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
      nama: row.nama ?? "-",
      jabatan: row.jabatan ?? "-",
      nuptk:
        row.nuptk !== null && row.nuptk !== undefined
          ? row.nuptk.toString()
          : "-",
      email: row.email ?? "-",
    }));
  }, [data]);

  // Extract unique jabatan options dynamically from processed data
  const availableJabatan = useMemo(() => {
    const list = processedData
      .map((item) => item.jabatan)
      .filter((jb) => jb && jb !== "-");
    return Array.from(new Set(list)).sort();
  }, [processedData]);

  // Compute local filteredData
  const filteredData = useMemo(() => {
    return processedData.filter((row) => {
      // 1. Jabatan filter (multiple select)
      if (
        selectedJabatan.length > 0 &&
        !selectedJabatan.includes(row.jabatan)
      ) {
        return false;
      }
      // 2. NUPTK filter
      if (
        nuptkFilter.trim() !== "" &&
        !row.nuptk.toLowerCase().includes(nuptkFilter.toLowerCase())
      ) {
        return false;
      }
      // 3. Email filter
      if (
        emailFilter.trim() !== "" &&
        !row.email.toLowerCase().includes(emailFilter.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [processedData, selectedJabatan, nuptkFilter, emailFilter]);

  const filterValues = useMemo(
    () => ({
      selectedJabatan,
      nuptk: nuptkFilter,
      email: emailFilter,
    }),
    [selectedJabatan, nuptkFilter, emailFilter],
  );

  const handleApplyFilters = (filters: typeof filterValues) => {
    setSelectedJabatan(filters.selectedJabatan);
    setNuptkFilter(filters.nuptk);
    setEmailFilter(filters.email);
  };

  const columns: Column<PTK>[] = [
    {
      header: "No",
      accessor: "id_ptk",
      render: (_row, rowIndex) => (rowIndex ?? 0) + 1,
      className: "w-16 !text-center ",
    },
    { header: "Nama", accessor: "nama", className: " w-40 " },
    {
      header: "Jabatan PTK",
      accessor: "jabatan",
      className: "w-48 !text-center",
    },
    { header: "NUPTK", accessor: "nuptk", className: "w-40 !text-center " },
    { header: "E-Mail", accessor: "email", className: "w-64 truncate" },
  ];

  // Calculate active filters badge count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedJabatan.length > 0) count++;
    if (nuptkFilter.trim() !== "") count++;
    if (emailFilter.trim() !== "") count++;
    return count;
  }, [selectedJabatan, nuptkFilter, emailFilter]);

  return (
    <>
      <PageMeta
        title="Data Pendidik dan Tenaga Kependidikan | Dashboard SMKN 1 Batam"
        description="Halaman menampilkan tabel data Pendidik dan Tenaga Kependidikan"
      />
      <PageBreadcrumb pageTitle="Data Pendidik dan Tenaga Kependidikan" />

      {/* Filter Modal */}
      <FilterPTKModal
        show={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        initialValues={filterValues}
        availableJabatan={availableJabatan}
      />

      <div className="space-y-6">
        <ComponentCard title="Tabel Data Pendidik dan Tenaga Kependidikan">
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

export default DataPTK;
