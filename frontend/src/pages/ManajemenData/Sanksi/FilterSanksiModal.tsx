import React, { useEffect, useState } from "react";
import Button from "../../../components/ui/button/Button";

interface FilterSanksiModalProps {
  show: boolean;
  onClose: () => void;
  onApply: (filters: {
    minPoin: number | "";
    maxPoin: number | "";
  }) => void;
  initialValues: {
    minPoin: number | "";
    maxPoin: number | "";
  };
}

const FilterSanksiModal: React.FC<FilterSanksiModalProps> = ({
  show,
  onClose,
  onApply,
  initialValues,
}) => {
  const [tempMinPoin, setTempMinPoin] = useState<number | "">("");
  const [tempMaxPoin, setTempMaxPoin] = useState<number | "">("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setTempMinPoin(initialValues.minPoin);
      setTempMaxPoin(initialValues.maxPoin);
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
      minPoin: tempMinPoin,
      maxPoin: tempMaxPoin,
    });
    handleClose();
  };

  const handleReset = () => {
    setTempMinPoin("");
    setTempMaxPoin("");
  };

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      } bg-black/40 p-4`}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm transform transition-all duration-300 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 -translate-y-4"
        }`}
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filter Sanksi
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
          {/* Bobot Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-white/90 mb-1">
              Batas Poin Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  placeholder="Min"
                  value={tempMinPoin}
                  onChange={(e) =>
                    setTempMinPoin(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full border px-3 py-1.5 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max"
                  value={tempMaxPoin}
                  onChange={(e) =>
                    setTempMaxPoin(e.target.value === "" ? "" : Number(e.target.value))
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

export default FilterSanksiModal;
