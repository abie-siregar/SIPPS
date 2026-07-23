import React, { useEffect, useState } from "react";
import Button from "../../../components/ui/button/Button";

interface FilterUserModalProps {
  show: boolean;
  onClose: () => void;
  onApply: (filters: { selectedRole: string[] }) => void;
  initialValues: {
    selectedRole: string[];
  };
  availableRole: string[];
}

const FilterUserModal: React.FC<FilterUserModalProps> = ({
  show,
  onClose,
  onApply,
  initialValues,
  availableRole,
}) => {
  const [tempRole, setTempRole] = useState<string[]>([]);
  const [searchRole, setSearchRole] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const filteredAvailableRole = availableRole.filter((r) =>
    r.toLowerCase().includes(searchRole.toLowerCase().trim())
  );

  useEffect(() => {
    if (show) {
      setTempRole(initialValues.selectedRole);
      setSearchRole("");
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
      selectedRole: tempRole,
    });
    handleClose();
  };

  const handleReset = () => {
    setTempRole([]);
    setSearchRole("");
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
            Filter Users
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
          {/* 1. Role */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-white/90">
                Role
              </label>
              {tempRole.length > 0 && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {tempRole.length} dipilih
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="🔍 Cari Role..."
              value={searchRole}
              onChange={(e) => setSearchRole(e.target.value)}
              className="w-full mb-2 border px-3 py-1.5 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto border p-3 rounded dark:bg-gray-700 dark:border-gray-600 bg-gray-50/50">
              {filteredAvailableRole.length > 0 ? (
                filteredAvailableRole.map((rl) => (
                  <label
                    key={rl}
                    className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <input
                      type="checkbox"
                      checked={tempRole.includes(rl)}
                      onChange={() => {
                        if (tempRole.includes(rl)) {
                          setTempRole(tempRole.filter((item) => item !== rl));
                        } else {
                          setTempRole([...tempRole, rl]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{rl}</span>
                  </label>
                ))
              ) : (
                <span className="text-xs text-gray-400">
                  Role tidak ditemukan
                </span>
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
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleClose}
              >
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

export default FilterUserModal;
