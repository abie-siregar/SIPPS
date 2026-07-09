import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";
import DataPembinaan from "./Pembinaan/DataPembinaan";

const ManajemenPembinaan = () => {
  return (
    <>
      <PageMeta
        title="Manajemen Pembinaan Siswa | SMKN 1 Batam"
        description="Halaman kontrol data pembinaan siswa"
      />
      <PageBreadcrumb pageTitle="Manajemen Pembinaan Siswa" />

      <div className="space-y-6">
        <DataPembinaan />
      </div>
    </>
  );
};

export default ManajemenPembinaan;
