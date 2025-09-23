import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  itemsPerPageOptions: number[];
  onItemsPerPageChange: (value: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  itemsPerPageOptions,
  onItemsPerPageChange,
}) => {
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 3;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pages = generatePageNumbers();

  return (
    <div className="flex justify-between items-center mx-4 my-4 px-2 flex-wrap gap-3">
      {/* Info halaman */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Halaman {currentPage} dari {totalPages}
      </p>

      {/* Kontrol navigasi */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Select per halaman */}
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-2 py-1 border rounded text-sm dark:bg-gray-800 dark:text-white"
        >
          {itemsPerPageOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt} per halaman
            </option>
          ))}
        </select>

        {/* Tombol Previous */}
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1 border rounded text-sm dark:text-white dark:border-white/20 disabled:opacity-50"
        >
          ←
        </button>

        {/* Tombol nomor halaman dinamis */}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 border rounded text-sm ${
              currentPage === page
                ? "bg-blue-600 text-white border-blue-600"
                : "text-gray-700 dark:text-white dark:border-white/20"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Tombol Next */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1 border rounded text-sm dark:text-white dark:border-white/20 disabled:opacity-50"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default Pagination;
