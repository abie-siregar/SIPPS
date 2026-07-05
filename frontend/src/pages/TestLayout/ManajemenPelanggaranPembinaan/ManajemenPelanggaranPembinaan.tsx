import { useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";

// 👤 Import komponen tabel masing-masing (sesuaikan path foldernya)
import DataPembinaan from "../ManajemenPelanggaranPembinaan/Pembinaan/DataPembinaan";
import DataPelanggaran from "../ManajemenPelanggaranPembinaan/pelanggaran/DataPelanggaran";

const ManajemenPembinaanPelanggaran = () => {
  // Mengubah activeTab menjadi "pembinaan" atau "pelanggaran"
  const [activeTab, setActiveTab] = useState<"pembinaan" | "pelanggaran">(
    "pembinaan",
  );

  return (
    <>
      <PageMeta
        title="Manajemen Pembinaan & Pelanggaran | SMKN 1 Batam"
        description="Halaman kontrol data pelanggaran dan pembinaan siswa"
      />
      <PageBreadcrumb pageTitle="Manajemen Pelanggaran dan Pembinaan" />

      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 gap-4">
          <button
            onClick={() => setActiveTab("pembinaan")}
            className={`pb-3 text-sm font-semibold transition-all ${
              activeTab === "pembinaan"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Data Pembinaan Siswa
          </button>
          <button
            onClick={() => setActiveTab("pelanggaran")}
            className={`pb-3 text-sm font-semibold transition-all ${
              activeTab === "pelanggaran"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Data Pelanggaran Siswa
          </button>
        </div>

        {/* Conditional Rendering berdasarkan Tab Aktif */}
        <div className="mt-4">
          {activeTab === "pembinaan" ? <DataPembinaan /> : <DataPelanggaran />}
        </div>
      </div>
    </>
  );
};

export default ManajemenPembinaanPelanggaran;
