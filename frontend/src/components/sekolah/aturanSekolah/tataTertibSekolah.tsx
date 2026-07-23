import rulesPdf from "../../../assets/docs/tata-tertib-smkn1batam-siswa.pdf";

export default function SchoolRulesCard() {
  const pdfUrl = rulesPdf;

  const handlePreviewPDF = () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Tata Tertib Sekolah
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Dokumen resmi mengenai peraturan, hak, dan kewajiban siswa selama
          berada di lingkungan sekolah.
        </p>
      </div>

      <div className="flex-shrink-0">
        <button
          onClick={handlePreviewPDF}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          {/* SVG Icon PDF Document */}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 2 0 01-2-2V5a2 2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 2 0 01-2 2z"
            />
          </svg>
          Preview PDF
        </button>
      </div>
    </div>
  );
}
