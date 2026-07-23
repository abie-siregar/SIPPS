import React, { useEffect, useState } from "react";
import Button from "../../../components/ui/button/Button";

interface FilterPoinPelanggaranModalProps {
  show: boolean;
  onClose: () => void;
  onApply: (filters: {
    selectedJenisPenilaian: string[];
    minBobot: number | "";
    maxBobot: number | "";
  }) => void;
  initialValues: {
    selectedJenisPenilaian: string[];
    minBobot: number | "";
    maxBobot: number | "";
  };
}

const FilterPoinPelanggaranModal: React.FC<FilterPoinPelanggaranModalProps> = ({
  show,
  onClose,
  onApply,
  initialValues,
}) => {
  const [tempJenisPenilaian, setTempJenisPenilaian] = useState<string[]>([]);
  const [tempMinBobot, setTempMinBobot] = useState<number | "">("");
  const [tempMaxBobot, setTempMaxBobot] = useState<number | "">("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setTempJenisPenilaian(initialValues.selectedJenisPenilaian);
      setTempMinBobot(initialValues.minBobot);
      setTempMaxBobot(initialValues.maxBobot);
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
      selectedJenisPenilaian: tempJenisPenilaian,
      minBobot: tempMinBobot,
      maxBobot: tempMaxBobot,
    });
    handleClose();
  };

  const handleReset = () => {
    setTempJenisPenilaian([]);
    setTempMinBobot("");
    setTempMaxBobot("");
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
            Filter Poin Pelanggaran
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
          {/* 1. Jenis Penilaian (Multiple Select) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-white/90 mb-1">
              Jenis Penilaian
            </label>
            <div className="flex flex-wrap gap-4 border p-2 rounded dark:bg-gray-700 dark:border-gray-600 bg-gray-50/50">
              {["Kelakuan", "Kerajinan", "Kerapian"].map((jp) => (
                <label
                  key={jp}
                  className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
                >
                  <input
                    type="checkbox"
                    checked={tempJenisPenilaian.includes(jp)}
                    onChange={() => {
                      if (tempJenisPenilaian.includes(jp)) {
                        setTempJenisPenilaian(tempJenisPenilaian.filter((item) => item !== jp));
                      } else {
                        setTempJenisPenilaian([...tempJenisPenilaian, jp]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{jp}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 2. Bobot Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-white/90 mb-1">
              Bobot Range (Poin)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  placeholder="Min"
                  value={tempMinBobot}
                  onChange={(e) =>
                    setTempMinBobot(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full border px-3 py-1.5 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max"
                  value={tempMaxBobot}
                  onChange={(e) =>
                    setTempMaxBobot(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full border px-3 py-1.5 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
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

export default FilterPoinPelanggaranModal;
