import { useState, useRef } from "react";
import axios from "../../../api/axios";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import {
  DownloadIcon,
  FileIcon,
  ArrowDownIcon,
  ArrowRightIcon,
} from "../../../icons";
import { useToast } from "../../../context/ToastContext";

type TabType = "ptk" | "siswa" | "rombel";

const ImportDataPage = () => {
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("ptk");
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // State untuk konfirmasi kepemilikan data sebelum unggah
  const [isDataConfirmed, setIsDataConfirmed] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Konfigurasi dinamis urutan tab berdasarkan entitas sekolah
  const tabConfig = {
    ptk: {
      title: "Import Data PTK / Guru",
      description:
        "Silakan unggah data GTK, Guru, dan Tenaga Kependidikan menggunakan format Excel resmi yang tersedia di bawah.",
      endpoint: "/import/iptk",
      templateUrl: "/templates/data-ptk.xlsx",
      templateLabel: "Unduh Template PTK",
    },
    siswa: {
      title: "Import Data Siswa",
      description:
        "Silakan unggah data Biodata Siswa dan Peserta Didik Baru menggunakan format Excel resmi yang tersedia di bawah.",
      endpoint: "/import/isiswa",
      templateUrl: "/templates/data-siswa.xlsx",
      templateLabel: "Unduh Template Siswa",
    },
    rombel: {
      title: "Import Data Rombel",
      description:
        "Silakan unggah struktur Rombongan Belajar (Rombel) dan Wali Kelas menggunakan format Excel resmi yang tersedia di bawah.",
      endpoint: "/import/irombel",
      templateUrl: "/templates/data-rombel.xlsx",
      templateLabel: "Unduh Template Rombel",
    },
  };

  const currentTab = tabConfig[activeTab];

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setFile(null);
    setIsDataConfirmed(false);
    setUploadProgress(0);
  };

  const validateFile = (selectedFile: File): boolean => {
    const allowedExtensions = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!allowedExtensions.includes(selectedFile.type)) {
      showError(
        "Format file tidak valid! Harap gunakan file Excel (.xlsx atau .xls)"
      );
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setIsDataConfirmed(false); // Reset konfirmasi setiap kali file ganti
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setIsDataConfirmed(false); // Reset konfirmasi setiap kali file ganti
      }
    }
  };

  const handleImportSubmit = async () => {
    if (!file || !isDataConfirmed) return;

    setIsUploading(true);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("has_pre_existing_data", String(isDataConfirmed));

    try {
      setUploadProgress(50);
      const response = await axios.post(currentTab.endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadProgress(100);
      setIsUploading(false);

      const result = response.data;
      let successMsg =
        result.message || `Data ${activeTab.toUpperCase()} berhasil diimport.`;
      if (result.summary) {
        successMsg += ` (Sukses: ${result.summary.success_count}, Gagal: ${result.summary.failed_count})`;
      }

      showSuccess(successMsg);

      setFile(null);
      setIsDataConfirmed(false);
    } catch (error: any) {
      setIsUploading(false);
      setUploadProgress(0);

      const msg =
        error?.response?.data?.error ||
        "Gagal memproses berkas. Pastikan data prasyarat tidak kosong.";
      showError(msg);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setIsDataConfirmed(false);
  };

  return (
    <>
      <PageMeta
        title="Import Data Master | Dashboard SMKN 1 Batam"
        description="Halaman pengelolaan unggah data master sekolah"
      />
      <PageBreadcrumb pageTitle={currentTab.title} />

      <div className="space-y-6">
        {/* Navigasi Switch Tab Berurutan */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => handleTabChange("ptk")}
            className={`py-2 px-4 text-sm font-medium transition border-b-2 ${
              activeTab === "ptk"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Import Data PTK / Guru
          </button>
          <button
            onClick={() => handleTabChange("siswa")}
            className={`py-2 px-4 text-sm font-medium transition border-b-2 ${
              activeTab === "siswa"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Import Data Siswa
          </button>
          <button
            onClick={() => handleTabChange("rombel")}
            className={`py-2 px-4 text-sm font-medium transition border-b-2 ${
              activeTab === "rombel"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Import Data Rombel
          </button>
        </div>

        <ComponentCard title={`Unggah Berkas ${currentTab.title}`}>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">
              {currentTab.description}
            </p>

            {/* Kotak Seret & Letakkan Berkas */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition ${
                isUploading
                  ? "cursor-not-allowed bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700"
                  : isDragActive
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/10"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50/30 dark:border-gray-700 dark:hover:border-gray-600 cursor-pointer"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                disabled={isUploading}
              />

              <div className="p-3.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 mb-3 flex items-center justify-center">
                <ArrowDownIcon className="size-6 fill-current" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                {file
                  ? file.name
                  : "Tarik & letakkan file template Excel di sini"}
              </p>
              {!file && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  atau{" "}
                  <span className="text-blue-600 dark:text-blue-400 font-semibold underline">
                    buka browser berkas
                  </span>
                </p>
              )}
            </div>

            {/* Tautan Unduh Format Struktur Excel */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm gap-2">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <FileIcon className="size-4 text-emerald-600 dark:text-emerald-500 flex-shrink-0 fill-current" />
                <span>Gunakan Template yang sudah di sediakan</span>
              </div>
              <a
                href={currentTab.templateUrl}
                download
                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1.5 whitespace-nowrap"
              >
                <DownloadIcon className="size-3.5 fill-current" />
                <span>{currentTab.templateLabel}</span>
              </a>
            </div>

            {/* Pertanyaan Konfirmasi Validasi (Muncul HANYA setelah file dimasukkan) */}
            {file && !isUploading && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg p-4 flex items-start gap-3 shadow-sm animate-fadeIn">
                <input
                  id="confirm-data-checkbox"
                  type="checkbox"
                  checked={isDataConfirmed}
                  onChange={(e) => setIsDataConfirmed(e.target.checked)}
                  className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="confirm-data-checkbox"
                  className="text-sm cursor-pointer select-none"
                >
                  <span className="font-semibold text-amber-800 dark:text-amber-400">
                    Apakah Anda yakin ingin mengunggah berkas ini?
                  </span>
                </label>
              </div>
            )}

            {isUploading && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping" />
                    <span>Proses Unggah Berkas Sedang berjalan...</span>
                  </div>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Konfirmasi Form */}
            {file && !isUploading && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={isDataConfirmed ? "primary" : "outline"}
                  disabled={!isDataConfirmed}
                  onClick={handleImportSubmit}
                  endIcon={<ArrowRightIcon className="size-4 fill-current" />}
                  className={
                    !isDataConfirmed
                      ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700"
                      : ""
                  }
                >
                  Unggah
                </Button>
              </div>
            )}
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default ImportDataPage;
