import React, { useEffect, useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options = [],
  value = "",
  onChange,
  placeholder = "-- Pilih --",
  disabled = false,
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Defensive lookup of selected option
  const selectedOption =
    value && options && options.length > 0
      ? options.find(
          (o) =>
            o &&
            o.value !== undefined &&
            o.value !== null &&
            o.value.toString() === value.toString()
        )
      : undefined;

  const displayValue = isOpen ? searchQuery : selectedOption ? selectedOption.label : "";

  // Defensive filtering
  const filteredOptions = (options || []).filter((option) => {
    if (!option || !option.label) return false;
    return option.label.toLowerCase().includes((searchQuery || "").toLowerCase());
  });

  const handleSelect = (val: string) => {
    if (onChange) {
      onChange(val);
    }
    setSearchQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          placeholder={selectedOption ? selectedOption.label : placeholder}
          disabled={disabled}
          className={`w-full border px-3 py-2 pr-10 rounded text-sm transition focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 disabled:dark:bg-gray-700/50 disabled:dark:text-gray-400 disabled:cursor-not-allowed`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute left-0 mt-1 z-[100] w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              if (!option || option.value === undefined || option.value === null) return null;
              const isSelected = value !== undefined && value !== null && value !== "" && option.value.toString() === value.toString();
              return (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value.toString())}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-white/90 flex justify-between items-center ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-900/40 font-semibold text-blue-600 dark:text-blue-400"
                      : ""
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center italic">
              Tidak ada hasil ditemukan
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
