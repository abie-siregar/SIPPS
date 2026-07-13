import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../../../../../api/axios";
import PageBreadcrumb from "../../../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../../../components/common/ComponentCard";
import PageMeta from "../../../../../components/common/PageMeta";
import Button from "../../../../../components/ui/button/Button";
import Toast from "../../../../../components/ui/alert/Toast";
import DataTable, { Column } from "../../../../../components/ui/table/DataTable";
import { Modal } from "../../../../../components/ui/modal";

interface ProgressStep {
  id_progres: number;
  tanggal: string;
  tahap_pembinaan: string;
  catatan_perkembangan: string;
  nama_pendamping: string;
}

interface PTK {
  id_ptk: number;
  nama: string;
}

interface StudentProfile {
  id_siswa: string;
  nama: string;
  nisn?: string;
  rombel?: string;
  total_poin: number;
}

interface ViolationRecord {
  id_pelanggaran: number;
  tanggal: string;
  jenis_pelanggaran: string;
  bobot: number;
  keterangan: string;
  nama_ptk: string;
}

const DetailPembinaan: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<ProgressStep[]>([]);
  const [ptkList, setPtkList] = useState<PTK[]>([]);
  const [namaSanksi, setNamaSanksi] = useState("");
  const [statusSanksi, setStatusSanksi] = useState("");
  const [tahapAkhir, setTahapAkhir] = useState("TAHAP_1");

  // Student Profile & Violation History states
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [violationHistory, setViolationHistory] = useState<ViolationRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Selected step in stepper to show details
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(-1);

  // Form states
  const [tanggalInput, setTanggalInput] = useState("");
  const [catatan, setCatatan] = useState("");
  const [idPtk, setIdPtk] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [toast, setToast] = useState<{
    show: boolean;
    variant: "success" | "error";
    message: string;
  }>({ show: false, variant: "success", message: "" });

  const predefinedStages = ["BARU", tahapAkhir, "SELESAI"];

  // Automatically calculate next stage based on completed ones
  const getNextStage = () => {
    const completedIndexes = history.map((step) =>
      predefinedStages.indexOf(step.tahap_pembinaan),
    ).filter(idx => idx !== -1);
    if (completedIndexes.length === 0) {
      return predefinedStages[1] || ""; // First stage after BARU
    }
    const maxIndex = Math.max(...completedIndexes);
    if (maxIndex < predefinedStages.length - 1) {
      return predefinedStages[maxIndex + 1];
    }
    return ""; // Already completed
  };

  const nextTahap = getNextStage();

  const fetchStepperData = async () => {
    setLoading(true);
    try {
      // 1. Determine nama_sanksi, status_sanksi, tahap_akhir and id_siswa
      let currentNamaSanksi = location.state?.nama_sanksi || "";
      let currentStatusSanksi = "";
      let resolvedStudentId = "";
      let currentTahapAkhir = "TAHAP_1";

      const listRes = await axios.get("/pembinaan");
      const list = listRes.data?.data || listRes.data || [];
      const match = list.find((item: any) => item.id_sanksi_siswa === Number(id));
      if (match) {
        currentNamaSanksi = match.nama_sanksi;
        currentStatusSanksi = match.status_sanksi;
        resolvedStudentId = match.id_siswa;
      }
      setNamaSanksi(currentNamaSanksi);
      setStatusSanksi(currentStatusSanksi);

      // 1. Fetch student details to get total points and determine correct tahap boundary
      if (resolvedStudentId) {
        setHistoryLoading(true);
        const studentRes = await axios.get("/siswa");
        const students: any[] = studentRes.data?.data || studentRes.data || [];
        const profile = students.find((s) => s.id_siswa === resolvedStudentId);
        if (profile) {
          setStudentProfile({
            id_siswa: profile.id_siswa,
            nama: profile.nama,
            nisn: profile.nisn,
            rombel: profile.rombel,
            total_poin: profile.total_poin,
          });

          // Tahap depends on student points boundary (batas_poin in master_sanksi)
          const pts = profile.total_poin || 0;
          if (pts >= 901) currentTahapAkhir = "TAHAP_5";
          else if (pts >= 701) currentTahapAkhir = "TAHAP_4";
          else if (pts >= 201) currentTahapAkhir = "TAHAP_3";
          else if (pts >= 101) currentTahapAkhir = "TAHAP_2";
          else currentTahapAkhir = "TAHAP_1";
        }

        // Fetch violation history
        const violationsRes = await axios.get("/pelanggaran-siswa");
        const violations: any[] = violationsRes.data?.data || violationsRes.data || [];
        const filteredViolations = violations
          .filter((v) => v.id_siswa === resolvedStudentId)
          .map((v) => ({
            id_pelanggaran: v.id_pelanggaran,
            tanggal: v.tanggal,
            jenis_pelanggaran: v.jenis_pelanggaran,
            bobot: v.bobot,
            keterangan: v.keterangan,
            nama_ptk: v.nama_ptk,
          }));
        setViolationHistory(filteredViolations);
        setHistoryLoading(false);
      }

      setTahapAkhir(currentTahapAkhir);

      // 2. Fetch stepper progress history
      const res = await axios.get(`/pembinaan/stepper/${id}`);
      const data: ProgressStep[] = res.data || [];

      // Calculate the highest TAHAP_x from match and stepper progress history
      let maxTahapNum = 1;
      if (currentTahapAkhir.startsWith("TAHAP_")) {
        maxTahapNum = parseInt(currentTahapAkhir.replace("TAHAP_", ""), 10) || 1;
      }
      data.forEach((step: any) => {
        if (step.tahap_pembinaan && step.tahap_pembinaan.startsWith("TAHAP_")) {
          const num = parseInt(step.tahap_pembinaan.replace("TAHAP_", ""), 10);
          if (!isNaN(num) && num > maxTahapNum) {
            maxTahapNum = num;
          }
        }
      });
      currentTahapAkhir = `TAHAP_${maxTahapNum}`;
      setTahapAkhir(currentTahapAkhir);
      
      const dynamicStages = ["BARU", currentTahapAkhir, "SELESAI"];

      const filteredData = data.filter((step) => dynamicStages.includes(step.tahap_pembinaan));
      setHistory(filteredData);

      if (filteredData.length > 0) {
        const latestStep = filteredData[filteredData.length - 1];
        const latestIdx = dynamicStages.indexOf(latestStep.tahap_pembinaan);
        setSelectedStepIndex(latestIdx !== -1 ? latestIdx : 0);
      } else {
        setSelectedStepIndex(0);
      }
    } catch (err) {
      console.error("Gagal memuat detail stepper:", err);
      setToast({
        show: true,
        variant: "error",
        message: "Gagal memuat riwayat pembinaan siswa.",
      });
    } finally {
      setLoading(false);
      setHistoryLoading(false);
    }
  };



  const fetchPTKList = async () => {
    try {
      const res = await axios.get("/ptk");
      setPtkList(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Gagal memuat data PTK:", err);
    }
  };

  useEffect(() => {
    fetchStepperData();
    fetchPTKList();
    const today = new Date().toISOString().split("T")[0];
    setTanggalInput(today);
  }, [id]);

  const handleFormSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextTahap || !catatan || !idPtk || !tanggalInput) {
      setToast({
        show: true,
        variant: "error",
        message: "Semua form perkembangan wajib diisi.",
      });
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    try {
      // 1. Submit the next stage (e.g. TAHAP_2)
      await axios.post("/pembinaan/next-step", {
        id_sanksi_siswa: Number(id),
        tahap_pembinaan: nextTahap,
        catatan_perkembangan: catatan,
        id_ptk_pendamping: idPtk,
        tanggal: tanggalInput,
      });

      // 2. If this is the last coaching stage before SELESAI, automatically submit SELESAI too
      const selesaiIndex = predefinedStages.indexOf("SELESAI");
      const currentNextIndex = predefinedStages.indexOf(nextTahap);
      const isLastBeforeSelesai = currentNextIndex === selesaiIndex - 1;

      if (isLastBeforeSelesai) {
        await axios.post("/pembinaan/next-step", {
          id_sanksi_siswa: Number(id),
          tahap_pembinaan: "SELESAI",
          catatan_perkembangan: "Pembinaan selesai: " + catatan,
          id_ptk_pendamping: idPtk,
          tanggal: tanggalInput,
        });
      }

      setToast({
        show: true,
        variant: "success",
        message: isLastBeforeSelesai
          ? "Berhasil menyelesaikan pembinaan."
          : `Berhasil memperbarui progres ke: ${nextTahap}`,
      });

      setCatatan("");
      setIdPtk("");
      const today = new Date().toISOString().split("T")[0];
      setTanggalInput(today);

      // Navigate back to the list page
      setTimeout(() => {
        navigate("/ManajemenPembinaan");
      }, 800);
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.response?.data?.error || "Gagal memperbarui progres.";
      setToast({
        show: true,
        variant: "error",
        message: errMsg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isCompleted = nextTahap === "";

  const completedStagesIndexes = history.map((step) =>
    predefinedStages.indexOf(step.tahap_pembinaan),
  );

  const getStepStatus = (index: number) => {
    if (completedStagesIndexes.length === 0) {
      return index === 0 ? "active" : "upcoming";
    }
    const latestCompletedIndex = Math.max(...completedStagesIndexes);
    
    // If SELESAI is completed
    const selesaiIndex = predefinedStages.indexOf("SELESAI");
    const isFinished =
      completedStagesIndexes.includes(selesaiIndex) ||
      statusSanksi.toUpperCase() === "SELESAI";
    
    if (isFinished) {
      return "completed";
    }
    
    if (index < latestCompletedIndex) {
      return "completed";
    }
    if (index === latestCompletedIndex) {
      return "active";
    }
    return "upcoming";
  };

  const getStageHistoryRecord = (index: number) => {
    const stageName = predefinedStages[index];
    return history.find((step) => step.tahap_pembinaan === stageName);
  };

  const selectedRecord = selectedStepIndex !== -1 ? getStageHistoryRecord(selectedStepIndex) : null;

  const progressColumns: Column<ProgressStep>[] = [
    {
      header: "No",
      accessor: "id_sanksi_pembinaan",
      render: (_, idx) => (idx ?? 0) + 1,
      className: "w-12 text-center",
    },
    {
      header: "Tanggal",
      accessor: "tanggal",
      render: (row) =>
        row.tanggal
          ? new Date(row.tanggal).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "-",
      className: "w-36",
    },
    {
      header: "Tahap Pembinaan",
      accessor: "tahap_pembinaan",
      render: (row) => getStageLabel(row.tahap_pembinaan),
      className: "w-48",
    },
    {
      header: "PTK Pembimbing",
      accessor: "nama_pendamping",
      render: (row) => row.nama_pendamping || "-",
      className: "w-48",
    },
    {
      header: "Catatan Pembinaan",
      accessor: "catatan_perkembangan",
      className: "w-96",
    },
  ];

  const violationColumns: Column<ViolationRecord>[] = [
    {
      header: "No",
      accessor: "id_pelanggaran",
      render: (_, idx) => (idx ?? 0) + 1,
      className: "w-12 text-center",
    },
    {
      header: "Tanggal",
      accessor: "tanggal",
      render: (row) =>
        row.tanggal
          ? new Date(row.tanggal).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "-",
      className: "w-28",
    },
    { header: "Jenis Pelanggaran", accessor: "jenis_pelanggaran", className: "w-48" },
    { header: "Bobot Poin", accessor: "bobot", className: "w-20 text-center" },
    { header: "Keterangan", accessor: "keterangan", className: "w-48" },
    { header: "PTK Pelapor", accessor: "nama_ptk", className: "w-36" },
  ];

  const getStageLabel = (stage: string) => {
    if (stage === "BARU") {
      return "MENUNGGU PEMBINAAN";
    }
    if (stage === "SELESAI") {
      if (tahapAkhir.toUpperCase() === "TAHAP_5") {
        return "SIDANG MAJELIS SELESAI DILAKUKAN";
      }
      return `PEMBINAAN ${tahapAkhir.replace("_", " ")} SELESAI`;
    }
    return "PROSES PEMBINAAN";
  };

  return (
    <>
      <PageMeta
        title="Detail Pembinaan Siswa | SMKN 1 Batam"
        description="Detail progres pembinaan siswa dengan stepper"
      />
      <PageBreadcrumb pageTitle="Detail Perkembangan Pembinaan" />

      <Toast
        show={toast.show}
        variant={toast.variant}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Back Button */}
        <div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Kembali ke Daftar
          </Button>
        </div>

        {/* Student Profile Info Section */}
        {studentProfile && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {studentProfile.nama}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                NISN: <span className="font-semibold">{studentProfile.nisn || "-"}</span> | Kelas: <span className="font-semibold">{studentProfile.rombel || "-"}</span>
              </p>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800/60">
              <div className="text-center">
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Total Poin
                </span>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {studentProfile.total_poin} Pts
                </span>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-800" />
              <div className="text-center">
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Sanksi Terbit
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {namaSanksi || "-"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stepper Card */}
        <ComponentCard title="Progres Pembinaan">
          {loading ? (
            <p className="text-center dark:text-gray-400 py-4">Loading data stepper...</p>
          ) : (
            <div className="py-8 px-4">
              {/* Horizontal Stepper Layout */}
              <div className="relative flex items-center justify-between">
                <div className="absolute left-[16.66%] right-[16.66%] top-1/2 -translate-y-1/2 h-1 bg-gray-200 dark:bg-gray-800 z-0" />

                {predefinedStages.map((stage, index) => {
                  const status = getStepStatus(index);
                  const isSelectable = completedStagesIndexes.includes(index);
                  const isCurrentSelected = selectedStepIndex === index;

                  let circleClass = "";
                  let textClass = "";

                  if (status === "completed") {
                    circleClass = "bg-green-500 text-white border-green-500";
                    textClass = "text-green-600 dark:text-green-400 font-semibold";
                  } else if (status === "active") {
                    circleClass = "bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/50 animate-pulse";
                    textClass = "text-blue-600 dark:text-blue-400 font-bold";
                  } else {
                    circleClass = "bg-white dark:bg-gray-900 text-gray-400 border-gray-200 dark:border-gray-800";
                    textClass = "text-gray-400 dark:text-gray-600";
                  }

                  if (isCurrentSelected) {
                    circleClass += " scale-110 ring-4 ring-indigo-200 dark:ring-indigo-900/60";
                  }

                  return (
                    <div
                      key={stage}
                      className={`relative flex flex-col items-center z-10 flex-1 ${
                        isSelectable ? "cursor-pointer" : "cursor-not-allowed"
                      }`}
                      onClick={() => {
                        if (isSelectable) {
                          setSelectedStepIndex(index);
                        }
                      }}
                    >
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-full border-2 text-sm font-medium transition-all ${circleClass}`}
                      >
                        {status === "completed" || (status === "active" && stage === "SELESAI") ? (
                          "✓"
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className={`mt-2 text-xs uppercase tracking-wider text-center max-w-[150px] ${textClass}`}>
                        {getStageLabel(stage)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Selected Stage Detail Card */}
              {selectedRecord && (
                <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800/80">
                  <div className="flex items-center justify-between mb-3 border-b border-gray-200/50 dark:border-gray-700/50 pb-2">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase">
                      Detail: {getStageLabel(selectedRecord.tahap_pembinaan)}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedRecord.tanggal
                        ? new Date(selectedRecord.tanggal).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Pendamping: <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedRecord.nama_pendamping || "-"}</span>
                  </p>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {selectedRecord.catatan_perkembangan}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </ComponentCard>

        {/* Next Step Form Card */}
        {!loading && !isCompleted && nextTahap && (
          <ComponentCard title="Perbarui Progres Pembinaan">
            <form onSubmit={handleFormSubmitClick} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={tanggalInput}
                    onChange={(e) => setTanggalInput(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tahap Selanjutnya
                  </label>
                  <div className="px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold uppercase">
                    {nextTahap === "SELESAI" ? tahapAkhir.replace("_", " ") : nextTahap.replace("_", " ")}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    PTK Pembimbing
                  </label>
                  <select
                    value={idPtk}
                    onChange={(e) => setIdPtk(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">-- Pilih PTK Pembimbing --</option>
                    {ptkList.map((ptk) => (
                      <option key={ptk.id_ptk} value={ptk.id_ptk}>
                        {ptk.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catatan Pembinaan
                </label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={4}
                  required
                  placeholder="Tuliskan catatan pembinaan saat ini..."
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? "Menyimpan..." : "Simpan Perkembangan"}
                </Button>
              </div>
            </form>
          </ComponentCard>
        )}

        {/* Progress History Table Card */}
        <ComponentCard title="Riwayat Progress Pembinaan">
          {loading ? (
            <p className="text-center dark:text-gray-400 py-4">Loading riwayat progress...</p>
          ) : history.length === 0 ? (
            <p className="text-center dark:text-gray-400 py-4">Tidak ada riwayat progress pembinaan.</p>
          ) : (
            <DataTable columns={progressColumns} data={history} searchable={false} paginated />
          )}
        </ComponentCard>

        {/* Student Violation History Table Card */}
        <ComponentCard title="Riwayat Pelanggaran Siswa">
          {historyLoading ? (
            <p className="text-center dark:text-gray-400 py-4">Loading riwayat pelanggaran...</p>
          ) : violationHistory.length === 0 ? (
            <p className="text-center dark:text-gray-400 py-4">Tidak ada riwayat pelanggaran.</p>
          ) : (
            <DataTable columns={violationColumns} data={violationHistory} searchable paginated />
          )}
        </ComponentCard>

        {/* Confirmation Modal */}
        <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} className="max-w-md p-6" disableBlur>
          <div className="text-center">
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Apakah Anda yakin ingin menyimpan progres pembinaan ini?
            </h3>
            <div className="flex justify-center gap-4">
              <Button onClick={handleConfirmSubmit} variant="primary" disabled={submitting}>
                Ya, Simpan
              </Button>
              <Button onClick={() => setShowConfirmModal(false)} variant="outline" disabled={submitting}>
                Batal
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default DetailPembinaan;
