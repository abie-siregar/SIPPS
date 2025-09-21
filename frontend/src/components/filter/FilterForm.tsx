// components/table/FilterForm.tsx
import React, { useState } from "react";
import Select from "../ui/select/Select";

interface FilterFormProps {
  options: string[];
  onApply: (filters: { dropdown: string; min?: number; max?: number }) => void;
  onClose: () => void;
}

const FilterForm: React.FC<FilterFormProps> = ({
  options,
  onApply,
  onClose,
}) => {
  const [dropdown, setDropdown] = useState("all");
  const [min, setMin] = useState<number | undefined>();
  const [max, setMax] = useState<number | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({ dropdown, min, max });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Filter Data
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dropdown */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              Pilih Jenis
            </label>
            <Select
              value={dropdown}
              onChange={(e) => setDropdown(e.target.value)}
              options={[
                { value: "all", label: "Semua" },
                ...options.map((v) => ({ value: v, label: v })),
              ]}
            />
          </div>

          {/* Range Input */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              Rentang Bobot
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={min ?? ""}
                onChange={(e) =>
                  setMin(e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full border rounded px-3 py-1 text-sm dark:bg-gray-700 dark:text-white"
              />
              <input
                type="number"
                placeholder="Max"
                value={max ?? ""}
                onChange={(e) =>
                  setMax(e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full border rounded px-3 py-1 text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 text-sm border rounded dark:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
            >
              Terapkan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FilterForm;
