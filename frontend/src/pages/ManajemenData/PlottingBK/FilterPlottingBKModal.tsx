import React, { useEffect, useState } from "react";
import Button from "../../../components/ui/button/Button";

interface FilterPlottingBKModalProps {
  show: boolean;
  onClose: () => void;
  onApply: (filters: {
    selectedGuru: string[];
    selectedSemester: string[];
  }) => void;
  initialValues: {
    selectedGuru: string[];
    selectedSemester: string[];
  };
  availableGuru: string[];
  availableSemester: string[];
}

const FilterPlottingBKModal: React.FC<FilterPlottingBKModalProps> = ({
  show,
  onClose,
  onApply,
  initialValues,
  availableGuru,
  availableSemester,
}) => {
  const [tempGuru, setTempGuru] = useState<string[]>([]);
  const [tempSemester, setTempSemester] = useState<string[]>([]);
  const [searchGuru, setSearchGuru] = useState("");
  const [searchSemester, setSearchSemester] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const filteredAvailableGuru = availableGuru.filter((g) =>
    g.toLowerCase().includes(searchGuru.toLowerCase().trim())
  );

  const filteredAvailableSemester = availableSemester.filter((s) =>
    s.toLowerCase().includes(searchSemester.toLowerCase().trim())
  );

  useEffect(() => {
    if (show) {
      setTempGuru(initialValues.selectedGuru);
      setTempSemester(initialValues.selectedSemester);
      setSearchGuru("");
      setSearchSemester("");
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
      selectedGuru: tempGuru,
      selectedSemester: tempSemester,
    });
    handleClose();
  };

  const handleReset = () => {
    setTempGuru([]);
    setTempSemester([]);
    setSearchGuru("");
    setSearchSemester("");
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
            Filter Plotting BK
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleApply} className="space-y-4">
          {/* 1. Guru BK */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-white/90">
                Guru BK
              </label>
              {tempGuru.length > 0 && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {tempGuru.length} dipilih
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="🔍 Cari Guru BK..."
              value={searchGuru}
              onChange={(e) => setSearchGuru(e.target.value)}
              className="w-full mb-2 border px-3 py-1.5 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto border p-3 rounded dark:bg-gray-700 dark:border-gray-600 bg-gray-50/50">
              {filteredAvailableGuru.length > 0 ? (
                filteredAvailableGuru.map((guru) => (
                  <label
                    key={guru}
                    className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <input
                      type="checkbox"
                      checked={tempGuru.includes(guru)}
                      onChange={() => {
                        if (tempGuru.includes(guru)) {
                          setTempGuru(tempGuru.filter((item) => item !== guru));
                        } else {
                          setTempGuru([...tempGuru, guru]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{guru}</span>
                  </label>
                ))
              ) : (
                <span className="text-xs text-gray-400">Guru BK tidak ditemukan</span>
              )}
            </div>
          </div>

          {/* 2. Semester */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-white/90">
                Semester
              </label>
              {tempSemester.length > 0 && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {tempSemester.length} dipilih
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="🔍 Cari Semester..."
              value={searchSemester}
              onChange={(e) => setSearchSemester(e.target.value)}
              className="w-full mb-2 border px-3 py-1.5 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto border p-3 rounded dark:bg-gray-700 dark:border-gray-600 bg-gray-50/50">
              {filteredAvailableSemester.length > 0 ? (
                filteredAvailableSemester.map((sem) => (
                  <label
                    key={sem}
                    className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <input
                      type="checkbox"
                      checked={tempSemester.includes(sem)}
                      onChange={() => {
                        if (tempSemester.includes(sem)) {
                          setTempSemester(tempSemester.filter((item) => item !== sem));
                        } else {
                          setTempSemester([...tempSemester, sem]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{sem}</span>
                  </label>
                ))
              ) : (
                <span className="text-xs text-gray-400">Semester tidak ditemukan</span>
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

export default FilterPlottingBKModal;
