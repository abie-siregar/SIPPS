import React, { useEffect, useState } from "react";
import Select from "../ui/select/Select";
import Button from "../ui/button/Button";
import RangeSlider from "../rangeSlider/RangeSlider";

export interface FilterOption {
  label: string;
  value: string | number;
}

export interface DropdownFilter {
  label: string;
  key: string;
  options: FilterOption[];
}

export interface RangeFilter {
  label: string;
  key: string;
  min: number;
  max: number;
}

interface FilterFormProps {
  dropdownFilters?: DropdownFilter[];
  rangeFilters?: RangeFilter[];
  initialValues?: { [key: string]: any }; // currently applied filter values
  onApply: (filters: {
    [key: string]: string | number | [number, number];
  }) => void;
  onClose: () => void;
}

const FilterForm: React.FC<FilterFormProps> = ({
  dropdownFilters = [],
  rangeFilters = [],
  initialValues = {},
  onApply,
  onClose,
}) => {
  const [dropdownValues, setDropdownValues] = useState<{
    [key: string]: string | number;
  }>({});
  const [rangeValues, setRangeValues] = useState<{
    [key: string]: [number, number];
  }>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    // Seed from initialValues (last applied), fallback to defaults
    const initialDropdown: { [key: string]: string | number } = {};
    dropdownFilters.forEach((f) => {
      initialDropdown[f.key] = initialValues[f.key] ?? "all";
    });
    setDropdownValues(initialDropdown);

    const initialRanges: { [key: string]: [number, number] } = {};
    rangeFilters.forEach((r) => {
      initialRanges[r.key] = initialValues[r.key] ?? [r.min, r.max];
    });
    setRangeValues(initialRanges);
  }, [dropdownFilters, rangeFilters]);
  // NOTE: intentionally not depending on initialValues to avoid re-running on
  // every parent render — we only want to seed on mount.

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // gabungkan semua filter
    const combinedFilters: { [key: string]: any } = {};
    Object.entries(dropdownValues).forEach(([k, v]) => {
      if (v !== "all") combinedFilters[k] = v;
    });
    Object.entries(rangeValues).forEach(([k, v]) => {
      combinedFilters[k] = v;
    });

    onApply(combinedFilters);
    handleClose();
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      } bg-black/40`}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-96 transform transition-all duration-300 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Filter Data
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Multiple Dropdowns */}
          {dropdownFilters.map((df) => (
            <div key={df.key}>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                {df.label}
              </label>
              <Select
                value={dropdownValues[df.key]}
                onChange={(e) =>
                  setDropdownValues({
                    ...dropdownValues,
                    [df.key]: e.target.value,
                  })
                }
                options={[{ label: "Semua", value: "all" }, ...df.options]}
              />
            </div>
          ))}

          {/* Multiple Range Sliders */}
          {rangeFilters.map((rf) => (
            <div key={rf.key}>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                {rf.label}
              </label>
              <RangeSlider
                min={rf.min}
                max={rf.max}
                value={rangeValues[rf.key] || [rf.min, rf.max]}
                onChange={(val) =>
                  setRangeValues({ ...rangeValues, [rf.key]: val })
                }
              />
            </div>
          ))}

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Terapkan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FilterForm;
