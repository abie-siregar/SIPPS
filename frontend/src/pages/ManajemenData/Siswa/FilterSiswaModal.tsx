import React, { useEffect, useState } from "react";
import Button from "../../../components/ui/button/Button";

interface FilterSiswaModalProps {
  show: boolean;
  onClose: () => void;
  onApply: (filters: {
    selectedRombel: string[];
    selectedTingkat: string[];
    selectedJurusan: string[];
  }) => void;
  initialValues: {
    selectedRombel: string[];
    selectedTingkat: string[];
    selectedJurusan: string[];
  };
  availableRombel: string[];
  availableTingkat: string[];
  availableJurusan: string[];
}

const FilterSiswaModal: React.FC<FilterSiswaModalProps> = ({
  show,
  onClose,
  onApply,
  initialValues,
  availableRombel,
  availableTingkat,
  availableJurusan,
}) => {
  const [tempRombel, setTempRombel] = useState<string[]>([]);
  const [tempTingkat, setTempTingkat] = useState<string[]>([]);
  const [tempJurusan, setTempJurusan] = useState<string[]>([]);
  const [searchRombel, setSearchRombel] = useState("");
  const [searchJurusan, setSearchJurusan] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const filteredAvailableRombel = availableRombel.filter((r) =>
    r.toLowerCase().includes(searchRombel.toLowerCase().trim())
  );

  const filteredAvailableJurusan = availableJurusan.filter((j) =>
    j.toLowerCase().includes(searchJurusan.toLowerCase().trim())
  );

  useEffect(() => {
    if (show) {
      setTempRombel(initialValues.selectedRombel);
      setTempTingkat(initialValues.selectedTingkat);
      setTempJurusan(initialValues.selectedJurusan);
      setSearchRombel("");
      setSearchJurusan("");
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [show, initialValues]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({
      selectedRombel: tempRombel,
      selectedTingkat: tempTingkat,
      selectedJurusan: tempJurusan,
    });
    handleClose();
  };

  const handleReset = () => {
    setTempRombel([]);
    setTempTingkat([]);
    setTempJurusan([]);
    setSearchRombel("");
    setSearchJurusan("");
  };

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      } bg-black/40 p-4`}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg transform transition-all duration-300 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 -translate-y-4"
        }`}
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filter Siswa
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleApply} className="space-y-4 font-sans">
          {/* 1. Rombel */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-white/90">
                Rombongan Belajar (Rombel)
              </label>
              {tempRombel.length > 0 && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {tempRombel.length} dipilih
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="🔍 Cari Rombel..."
              value={searchRombel}
              onChange={(e) => setSearchRombel(e.target.value)}
              className="w-full mb-2 border px-3 py-1.5 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto border p-3 rounded dark:bg-gray-700 dark:border-gray-600 bg-gray-50/50">
              {filteredAvailableRombel.length > 0 ? (
                filteredAvailableRombel.map((rb) => (
                  <label
                    key={rb}
                    className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <input
                      type="checkbox"
                      checked={tempRombel.includes(rb)}
                      onChange={() => {
                        if (tempRombel.includes(rb)) {
                          setTempRombel(tempRombel.filter((item) => item !== rb));
                        } else {
                          setTempRombel([...tempRombel, rb]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{rb}</span>
                  </label>
                ))
              ) : (
                <span className="text-xs text-gray-400">Rombel tidak ditemukan</span>
              )}
            </div>
          </div>

          {/* 2. Tingkat */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-white/90 mb-1">
              Tingkat
            </label>
            <div className="flex flex-wrap gap-4 border p-3 rounded dark:bg-gray-700 dark:border-gray-600 bg-gray-50/50">
              {availableTingkat.length > 0 ? (
                availableTingkat.map((tk) => (
                  <label
                    key={tk}
                    className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
                  >
                    <input
                      type="checkbox"
                      checked={tempTingkat.includes(tk)}
                      onChange={() => {
                        if (tempTingkat.includes(tk)) {
                          setTempTingkat(tempTingkat.filter((item) => item !== tk));
                        } else {
                          setTempTingkat([...tempTingkat, tk]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{tk}</span>
                  </label>
                ))
              ) : (
                <span className="text-xs text-gray-400">Tidak ada data tingkat</span>
              )}
            </div>
          </div>

          {/* 3. Jurusan */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-white/90">
                Jurusan
              </label>
              {tempJurusan.length > 0 && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {tempJurusan.length} dipilih
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="🔍 Cari Jurusan..."
              value={searchJurusan}
              onChange={(e) => setSearchJurusan(e.target.value)}
              className="w-full mb-2 border px-3 py-1.5 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto border p-3 rounded dark:bg-gray-700 dark:border-gray-600 bg-gray-50/50">
              {filteredAvailableJurusan.length > 0 ? (
                filteredAvailableJurusan.map((jr) => (
                  <label
                    key={jr}
                    className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <input
                      type="checkbox"
                      checked={tempJurusan.includes(jr)}
                      onChange={() => {
                        if (tempJurusan.includes(jr)) {
                          setTempJurusan(tempJurusan.filter((item) => item !== jr));
                        } else {
                          setTempJurusan([...tempJurusan, jr]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{jr}</span>
                  </label>
                ))
              ) : (
                <span className="text-xs text-gray-400">Jurusan tidak ditemukan</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t mt-6">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-red-500 hover:text-red-700 hover:underline font-semibold"
            >
              Reset Filter
            </button>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={handleClose}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Terapkan
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FilterSiswaModal;
