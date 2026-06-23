import React, { useEffect, useState } from "react";
import Button from "../../../components/ui/button/Button";

interface FilterUserModalProps {
  show: boolean;
  onClose: () => void;
  onApply: (filters: {
    selectedRole: string[];
  }) => void;
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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setTempRole(initialValues.selectedRole);
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
            <label className="block text-sm font-semibold text-gray-700 dark:text-white/90 mb-1">
              Role
            </label>
            <div className="flex flex-col gap-2 max-h-36 overflow-y-auto border p-2 rounded dark:bg-gray-700 dark:border-gray-600 bg-gray-50/50">
              {availableRole.length > 0 ? (
                availableRole.map((rl) => (
                  <label
                    key={rl}
                    className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
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
                <span className="text-xs text-gray-400">Tidak ada data role</span>
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

export default FilterUserModal;
