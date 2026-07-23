import React, { useEffect, useState } from "react";
import Button from "../../../components/ui/button/Button";

interface FilterPTKModalProps {
  show: boolean;
  onClose: () => void;
  onApply: (filters: {
    selectedJabatan: string[];
    nuptk: string;
    email: string;
  }) => void;
  initialValues: {
    selectedJabatan: string[];
    nuptk: string;
    email: string;
  };
  availableJabatan: string[];
}

const FilterPTKModal: React.FC<FilterPTKModalProps> = ({
  show,
  onClose,
  onApply,
  initialValues,
  availableJabatan,
}) => {
  const [tempJabatan, setTempJabatan] = useState<string[]>([]);
  const [tempNuptk, setTempNuptk] = useState<string>("");
  const [tempEmail, setTempEmail] = useState<string>("");
  const [searchJabatan, setSearchJabatan] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const filteredAvailableJabatan = availableJabatan.filter((jb) =>
    jb.toLowerCase().includes(searchJabatan.toLowerCase().trim())
  );

  useEffect(() => {
    if (show) {
      setTempJabatan(initialValues.selectedJabatan);
      setTempNuptk(initialValues.nuptk);
      setTempEmail(initialValues.email);
      setSearchJabatan("");
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
      selectedJabatan: tempJabatan,
      nuptk: tempNuptk,
      email: tempEmail,
    });
    handleClose();
  };

  const handleReset = () => {
    setTempJabatan([]);
    setTempNuptk("");
    setTempEmail("");
    setSearchJabatan("");
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
            Filter PTK
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
          {/* 1. Jabatan (Multiple Select Checkboxes with Search) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-white/90">
                Jabatan
              </label>
              {tempJabatan.length > 0 && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {tempJabatan.length} dipilih
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="🔍 Cari Jabatan..."
              value={searchJabatan}
              onChange={(e) => setSearchJabatan(e.target.value)}
              className="w-full mb-2 border px-3 py-1.5 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto border p-3 rounded dark:bg-gray-700 dark:border-gray-600 bg-gray-50/50">
              {filteredAvailableJabatan.length > 0 ? (
                filteredAvailableJabatan.map((jb) => (
                  <label
                    key={jb}
                    className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <input
                      type="checkbox"
                      checked={tempJabatan.includes(jb)}
                      onChange={() => {
                        if (tempJabatan.includes(jb)) {
                          setTempJabatan(tempJabatan.filter((item) => item !== jb));
                        } else {
                          setTempJabatan([...tempJabatan, jb]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{jb}</span>
                  </label>
                ))
              ) : (
                <span className="text-xs text-gray-400">Jabatan tidak ditemukan</span>
              )}
            </div>
          </div>

          {/* 2. NUPTK */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-white/90 mb-1">
              NUPTK
            </label>
            <input
              type="text"
              placeholder="Cari NUPTK..."
              value={tempNuptk}
              onChange={(e) => setTempNuptk(e.target.value)}
              className="w-full border px-3 py-1.5 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 3. Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-white/90 mb-1">
              Email
            </label>
            <input
              type="text"
              placeholder="Cari Email..."
              value={tempEmail}
              onChange={(e) => setTempEmail(e.target.value)}
              className="w-full border px-3 py-1.5 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500"
            />
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

export default FilterPTKModal;
