import { useEffect } from "react";

interface SuccessPopupProps {
  message: string;
  show: boolean;
  duration?: number;
  onClose: () => void;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({
  message,
  show,
  duration = 1500,
  onClose,
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-opacity-40">
      <div className="bg-white border border-gray-300 ring-2 ring-brand-500 px-10 py-6 rounded-lg shadow-2xl text-center transform transition-all duration-300 scale-100 opacity-100">
        <div className="text-4xl mb-3">✅</div>
        <p className="text-lg font-semibold text-gray-800">{message}</p>
      </div>
    </div>
  );
};

export default SuccessPopup;
