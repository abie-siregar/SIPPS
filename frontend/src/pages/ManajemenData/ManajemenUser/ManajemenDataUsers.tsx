import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import DataUsers from "./DataUsers";

const ManajemenDataUsers = () => {
  return (
    <>
      <PageMeta
        title="Manajemen Data Pengguna | Dashboard SMKN 1 Batam"
        description="Halaman admin untuk mengelola data akun pengguna/users"
      />
      <PageBreadcrumb pageTitle="Manajemen Data Pengguna" />

      <div className="space-y-6">
        <DataUsers />
      </div>
    </>
  );
};

export default ManajemenDataUsers;
