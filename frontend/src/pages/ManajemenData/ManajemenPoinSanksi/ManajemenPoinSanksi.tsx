import { useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard"; // Opsional: Sesuaikan layout jika dipakai

import DataPoinPelanggaran from "../ManajemenPoinSanksi/PoinPelanggaran/DataPoinPelanggaran";
import DataSanksi from "../ManajemenPoinSanksi/Sanksi/DataSanksi";

const ManajemenPoinSanksi = () => {
  const [activeTab, setActiveTab] = useState<"Poin" | "Sanksi">("Poin");

  return (
    <>
      <PageMeta
        title="Manajemen Poin dan Sanksi Pelanggaran | SMKN 1 Batam"
        description="Halaman kontrol data Poin dan Sanksi pelanggaran"
      />
      <PageBreadcrumb pageTitle="Manajemen Poin dan Sanksi Pelanggaran" />

      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 gap-4 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => setActiveTab("Poin")}
            className={`pb-3 text-sm font-semibold transition-all relative ${
              activeTab === "Poin"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Data Poin Pelanggaran
          </button>
          <button
            onClick={() => setActiveTab("Sanksi")}
            className={`pb-3 text-sm font-semibold transition-all relative ${
              activeTab === "Sanksi"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Data Master Sanksi
          </button>
        </div>

        {/* 🟢 Perbaikan Conditional Rendering berdasarkan Tab Aktif */}
        <div className="mt-4">
          {activeTab === "Poin" ? (
            <ComponentCard title="Daftar Poin Pelanggaran">
              <DataPoinPelanggaran />
            </ComponentCard>
          ) : (
            <ComponentCard title="Daftar Master Data Sanksi">
              <DataSanksi />
            </ComponentCard>
          )}
        </div>
      </div>
    </>
  );
};

export default ManajemenPoinSanksi;
