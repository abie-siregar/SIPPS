import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";
import DataPelanggaran from "./pelanggaran/DataPelanggaran";

const ManajemenPelanggaran = () => {
  return (
    <>
      <PageMeta
        title="Manajemen Pelanggaran Siswa | SMKN 1 Batam"
        description="Halaman kontrol data pelanggaran siswa"
      />
      <PageBreadcrumb pageTitle="Manajemen Pelanggaran Siswa" />

      <div className="space-y-6">
        <DataPelanggaran />
      </div>
    </>
  );
};

export default ManajemenPelanggaran;
