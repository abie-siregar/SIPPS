/**
 * Mengubah ISO String dari backend menjadi format DD-MM-YYYY untuk tampilan user.
 * Menggunakan split untuk menghindari pergeseran hari akibat timezone UTC (Z).
 */
export const formatDateToDisplay = (
  isoString: string | null | undefined,
): string => {
  if (!isoString) return "-";
  try {
    // Mengambil bagian "2026-06-11" sebelum huruf T
    const datePart = isoString.split("T")[0];
    const [year, month, day] = datePart.split("-");
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error("Format tanggal salah:", error);
    return "-";
  }
};

/**
 * Mengubah ISO String menjadi format YYYY-MM-DD yang WAJIB digunakan oleh <input type="date">
 */
export const formatDateForInput = (
  isoString: string | null | undefined,
): string => {
  if (!isoString) return "";
  // Mengembalikan "2026-06-11"
  return isoString.split("T")[0];
};
