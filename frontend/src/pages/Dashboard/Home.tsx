import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import SiswaRiwayatPelanggaran from "../../components/siswa/SiswaRiwayatPelanggaran";
import AturanSekolah from "../../components/sekolah/aturanSekolah/tataTertibSekolah";
import Chart from "react-apexcharts";
import axios from "../../api/axios";

// ────────────────────────────────────────────────
// Role configuration — keys match DB nama_role exactly
// ────────────────────────────────────────────────
interface RoleConfig {
  label: string;
  emoji: string;
  gradient: string;
  border: string;
  badge: string;
  description: string;
  icon: string;
}

const ROLE_CONFIG: Record<string, RoleConfig> = {
  Admin: {
    label: "Admin",
    emoji: "🛡️",
    gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    border: "#6366f1",
    badge: "#ede9fe",
    description: "Akses penuh ke seluruh sistem SIPPS.",
    icon: "⚙️",
  },
  Guru: {
    label: "Guru",
    emoji: "📚",
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
    border: "#0ea5e9",
    badge: "#e0f2fe",
    description: "Pantau data siswa dan pelanggaran di kelas Anda.",
    icon: "👩‍🏫",
  },
  PTK: {
    label: "PTK",
    emoji: "🏫",
    gradient: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
    border: "#14b8a6",
    badge: "#ccfbf1",
    description: "Tenaga Pendidik & Kependidikan – Kelola data kepegawaian.",
    icon: "🗂️",
  },
  Siswa: {
    label: "Siswa",
    emoji: "🎓",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    border: "#f59e0b",
    badge: "#fef3c7",
    description: "Lihat catatan poin pelanggaran Anda secara real-time.",
    icon: "📋",
  },
  "Orang Tua": {
    label: "Orang Tua",
    emoji: "👨‍👩‍👧",
    gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
    border: "#ec4899",
    badge: "#fce7f3",
    description: "Pantau perkembangan dan catatan anak Anda.",
    icon: "📱",
  },
  "Kepala Sekolah": {
    label: "Kepala Sekolah",
    emoji: "🏅",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    border: "#8b5cf6",
    badge: "#ede9fe",
    description: "Rekap dan laporan seluruh pelanggaran sekolah.",
    icon: "📊",
  },
  BK: {
    label: "BK",
    emoji: "💬",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    border: "#10b981",
    badge: "#d1fae5",
    description: "Bimbingan Konseling – Kelola dan tindak lanjut pelanggaran.",
    icon: "🤝",
  },
  "Wali Kelas": {
    label: "Wali Kelas",
    emoji: "🏷️",
    gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    border: "#f97316",
    badge: "#ffedd5",
    description: "Kelola rombel dan pantau pelanggaran kelas Anda.",
    icon: "📝",
  },
};

const FALLBACK_ROLE: RoleConfig = {
  label: "Pengguna",
  emoji: "👤",
  gradient: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
  border: "#6b7280",
  badge: "#f3f4f6",
  description: "Selamat datang di SIPPS.",
  icon: "🏠",
};

export default function Home() {
  const { user } = useAuth();
  // const navigate = useNavigate();

  // useEffect(() => {
  //   if (user?.role === "Orang Tua") {
  //     navigate("/IdentitasAnak", { replace: true });
  //   }
  // }, [user, navigate]);

  const roleConfig =
    (user?.role ? ROLE_CONFIG[user.role] : null) ?? FALLBACK_ROLE;

  const displayName = user?.nama || user?.username || "Pengguna";

  const [analyticsData, setAnalyticsData] = useState<
    { nama: string; total_poin: number }[]
  >([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [rombelName, setRombelName] = useState<string | null>(null);
  const [rombelNames, setRombelNames] = useState<string[]>([]);
  const [violationsData, setViolationsData] = useState<
    { jenis_pelanggaran: string; count: number }[]
  >([]);
  const [trendsData, setTrendsData] = useState<
    { tanggal_pelanggaran: string; count: number }[]
  >([]);

  useEffect(() => {
    if (["Admin", "Guru", "BK", "Wali Kelas"].includes(user?.role || "")) {
      const fetchAnalytics = async () => {
        setLoading(true);
        try {
          const params: any = {};
          if (user?.role === "Admin" && selectedCategory) {
            params.jenis_penilaian = selectedCategory;
          }
          const res = await axios.get("/dashboard/analytics", { params });
          setAnalyticsData(res.data?.data || []);
          setViolationsData(res.data?.violations || []);
          setTrendsData(res.data?.trends || []);
          if (res.data?.categories) {
            setCategories(res.data.categories);
          }
          if (res.data?.rombelName) {
            setRombelName(res.data.rombelName);
          }
          if (res.data?.rombelNames) {
            setRombelNames(res.data.rombelNames);
          }
        } catch (err) {
          console.error("Gagal memuat analitik dashboard:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchAnalytics();
    }
  }, [user?.role, selectedCategory]);

  const chartOptions: any = {
    colors: ["#6366f1"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: analyticsData.map((s) => s.nama),
      labels: {
        rotate: -45,
        style: {
          fontSize: "11px",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Poin Pelanggaran",
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} Pts`,
      },
    },
  };

  const chartSeries = [
    {
      name: "Total Poin",
      data: analyticsData.map((s) => s.total_poin),
    },
  ];

  const isDarkMode = document.documentElement.classList.contains("dark");

  const pieChartOptions: any = {
    colors: [
      "#6366f1",
      "#0ea5e9",
      "#14b8a6",
      "#f59e0b",
      "#ec4899",
      "#8b5cf6",
      "#10b981",
      "#ef4444",
    ],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "pie",
    },
    theme: {
      mode: isDarkMode ? "dark" : "light",
    },
    labels: violationsData.slice(0, 5).map((v) => v.jenis_pelanggaran),
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "12px",
        colors: ["#ffffff"],
      },
      dropShadow: {
        enabled: true,
      },
    },
    plotOptions: {
      pie: {
        customScale: 0.9,
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (val: number) => `${val} Siswa`,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const pieChartSeries = violationsData.slice(0, 5).map((v) => v.count);

  const lineChartOptions: any = {
    colors: ["#3b82f6"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "line",
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    xaxis: {
      type: "category",
      categories: trendsData.map((t) => t.tanggal_pelanggaran),
      labels: {
        formatter: (val: string) => {
          const index = trendsData.findIndex(
            (t) => t.tanggal_pelanggaran === val,
          );
          if (index === -1) return val;
          try {
            const parts = val.split("-");
            if (parts.length === 3) {
              const y = parseInt(parts[0], 10);
              const m = parseInt(parts[1], 10) - 1;
              const d = parseInt(parts[2], 10);
              const date = new Date(y, m, d);
              const month = date.toLocaleDateString("id-ID", {
                month: "short",
              });
              if (index === 0) {
                return `1 ${month}`;
              }
              const prevItem = trendsData[index - 1];
              if (prevItem) {
                const prevParts = prevItem.tanggal_pelanggaran.split("-");
                if (prevParts.length === 3) {
                  const prevM = parseInt(prevParts[1], 10) - 1;
                  if (m !== prevM) {
                    return `1 ${month}`;
                  }
                }
              }
            }
            return "";
          } catch {
            return val;
          }
        },
        style: {
          fontSize: "11px",
          colors: isDarkMode ? "#e5e7eb" : "#374151",
        },
      },
    },
    yaxis: {
      title: {
        text: "Frekuensi Pelanggaran",
        style: {
          color: isDarkMode ? "#e5e7eb" : "#374151",
        },
      },
      labels: {
        style: {
          colors: isDarkMode ? "#e5e7eb" : "#374151",
        },
      },
    },
    tooltip: {
      theme: "light",
      x: {
        formatter: (val: any) => {
          try {
            let dateStr = val;
            if (typeof val === "number" || isNaN(Date.parse(val))) {
              const item = trendsData[Number(val)];
              if (item) {
                dateStr = item.tanggal_pelanggaran;
              }
            }
            const parts = dateStr.split("-");
            if (parts.length === 3) {
              const y = parseInt(parts[0], 10);
              const m = parseInt(parts[1], 10) - 1;
              const d = parseInt(parts[2], 10);
              const date = new Date(y, m, d);
              return date.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
            }
            const date = new Date(dateStr);
            return date.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
          } catch {
            return val;
          }
        },
      },
      y: {
        formatter: (val: number) => `${val} Kasus`,
      },
    },
    markers: {
      size: 4,
      colors: ["#3b82f6"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
  };

  const lineChartSeries = [
    {
      name: "Pelanggaran",
      data: trendsData.map((t) => t.count),
    },
  ];

  return (
    <>
      <PageMeta
        title="SIPPS - SMKN 1 Batam"
        description="Sistem Informasi Poin Pelanggaran Siswa - SMKN 1 Batam"
      />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* ── Role Banner ──────────────────────────────── */}
        <div className="col-span-12">
          <div
            style={{
              background: roleConfig.gradient,
              borderRadius: "1rem",
              padding: "2rem 2rem",
              position: "relative",
              overflow: "hidden",
              boxShadow: `0 8px 32px ${roleConfig.border}33`,
            }}
          >
            {/* Decorative circles */}
            <div
              style={{
                position: "absolute",
                top: "-40px",
                right: "-40px",
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-60px",
                right: "80px",
                width: "250px",
                height: "250px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
                pointerEvents: "none",
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              {/* Role badge */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(255,255,255,0.18)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "999px",
                  padding: "4px 14px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#fff",
                  marginBottom: "1rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {roleConfig.icon}&nbsp;{roleConfig.label}
              </span>

              {/* Greeting */}
              <h1
                style={{
                  color: "#fff",
                  fontSize: "clamp(1.4rem, 3vw, 2rem)",
                  fontWeight: 700,
                  margin: "0 0 0.5rem 0",
                  lineHeight: 1.2,
                }}
              >
                {roleConfig.emoji} Selamat Datang,{" "}
                <span style={{ opacity: 0.9 }}>{displayName}</span>!
              </h1>

              <p
                style={{
                  color: "rgba(255,255,255,0.82)",
                  fontSize: "0.95rem",
                  margin: 0,
                  maxWidth: "480px",
                }}
              >
                {roleConfig.description}
              </p>
            </div>
          </div>
        </div>

        {/* ── Role Info Card ───────────────────────────── */}
        <div className="col-span-12 md:col-span-4">
          <div
            style={{
              background: "var(--color-white, #fff)",
              borderRadius: "0.875rem",
              padding: "1.5rem",
              border: `2px solid ${roleConfig.border}44`,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
            className="dark:bg-gray-800 dark:border-white/10"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: roleConfig.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  flexShrink: 0,
                  boxShadow: `0 4px 16px ${roleConfig.border}44`,
                }}
              >
                {roleConfig.emoji}
              </div>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.75rem",
                    color: "#6b7280",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                  className="dark:text-gray-400"
                >
                  Role Anda
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                  className="dark:text-white"
                >
                  {roleConfig.label}
                </p>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "4px",
                    background: roleConfig.badge,
                    color: roleConfig.border,
                    borderRadius: "999px",
                    padding: "2px 10px",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                >
                  Role: {user?.role ?? "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── User Info Card ───────────────────────────── */}
        <div className="col-span-12 md:col-span-8">
          <div
            style={{
              background: "var(--color-white, #fff)",
              borderRadius: "0.875rem",
              padding: "1.5rem",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
            className="dark:bg-gray-800 dark:border-white/10"
          >
            <h2
              style={{
                margin: "0 0 1rem 0",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
              className="dark:text-gray-400"
            >
              Informasi Akun
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "1rem",
              }}
            >
              {[
                { label: "Username", value: user?.username },
                { label: "Nama", value: user?.nama },
                { label: "Email", value: user?.email },
                { label: "No. HP", value: user?.no_hp },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.7rem",
                      color: "#9ca3af",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: "#1f2937",
                    }}
                    className="dark:text-white"
                  >
                    {value || (
                      <span style={{ color: "#d1d5db", fontWeight: 400 }}>
                        —
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12">
          <div
            style={{
              background: "var(--color-white, #fff)",
              borderRadius: "0.875rem",
              padding: "1.5rem",
              border: `2px solid ${roleConfig.border}44`,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
            className="dark:bg-gray-800 dark:border-white/10"
          >
            <AturanSekolah />
          </div>
        </div>

        {["Admin", "Guru", "BK", "Wali Kelas"].includes(user?.role || "") && (
          <div className="col-span-12 mt-4">
            <div className="grid grid-cols-12 gap-6">
              {/* Bar Chart - Top 10 Students */}
              <div
                style={{
                  background: "var(--color-white, #fff)",
                  borderRadius: "0.875rem",
                  padding: "1.5rem",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
                className="col-span-12 dark:bg-gray-800 dark:border-white/10"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Analisis Akumulasi Poin Pelanggaran Siswa
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user?.role === "Admin"
                        ? "Peringkat 10 siswa dengan akumulasi poin pelanggaran tertinggi sekolah."
                        : user?.role === "Guru" || user?.role === "Wali Kelas"
                          ? `Peringkat 10 siswa dengan akumulasi poin pelanggaran tertinggi di rombel Anda (${rombelName || "-"}).`
                          : `Peringkat 10 siswa dengan akumulasi poin pelanggaran tertinggi di rombel dampingan Anda (${rombelNames.join(", ") || "-"}).`}
                    </p>
                  </div>

                  {user?.role === "Admin" && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        Jenis Penilaian:
                      </span>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-1.5 border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="">Semua</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {loading ? (
                  <p className="text-center dark:text-gray-400 py-8">
                    Memuat data analitik...
                  </p>
                ) : analyticsData.length === 0 ? (
                  <p className="text-center dark:text-gray-400 py-8">
                    Tidak ada data pelanggaran siswa yang tercatat.
                  </p>
                ) : (
                  <div className="max-w-full overflow-x-auto custom-scrollbar">
                    <div className="min-w-[600px] h-[350px]">
                      <Chart
                        options={chartOptions}
                        series={chartSeries}
                        type="bar"
                        height={320}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Pie Chart - Top 5 Violations */}
              <div
                style={{
                  background: "var(--color-white, #fff)",
                  borderRadius: "0.875rem",
                  padding: "1.5rem",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
                className="col-span-12 lg:col-span-6 dark:bg-gray-800 dark:border-white/10"
              >
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Top 5 Jenis Pelanggaran
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Kategori pelanggaran yang paling sering dilakukan.
                  </p>
                </div>

                {loading ? (
                  <p className="text-center dark:text-gray-400 py-8">
                    Memuat data analitik...
                  </p>
                ) : violationsData.length === 0 ? (
                  <p className="text-center dark:text-gray-400 py-8">
                    Tidak ada data pelanggaran yang tercatat.
                  </p>
                ) : (
                  <div className="flex items-center justify-center h-[400px]">
                    <Chart
                      options={pieChartOptions}
                      series={pieChartSeries}
                      type="pie"
                      width="100%"
                      height={360}
                    />
                  </div>
                )}
              </div>

              {/* Line Chart - Violations Trend by Date */}
              <div
                style={{
                  background: "var(--color-white, #fff)",
                  borderRadius: "0.875rem",
                  padding: "1.5rem",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
                className="col-span-12 lg:col-span-6 dark:bg-gray-800 dark:border-white/10"
              >
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Tren Pelanggaran Siswa
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Perkembangan frekuensi pelanggaran siswa berdasarkan
                    tanggal.
                  </p>
                </div>

                {loading ? (
                  <p className="text-center dark:text-gray-400 py-8">
                    Memuat data analitik...
                  </p>
                ) : trendsData.length === 0 ? (
                  <p className="text-center dark:text-gray-400 py-8">
                    Tidak ada data tren pelanggaran siswa.
                  </p>
                ) : (
                  <div className="max-w-full overflow-x-auto custom-scrollbar">
                    <div className="min-w-[400px] h-[400px]">
                      <Chart
                        options={lineChartOptions}
                        series={lineChartSeries}
                        type="line"
                        height={360}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {user?.role === "Siswa" && (
          <div className="col-span-12 mt-2">
            <SiswaRiwayatPelanggaran isDashboard />
          </div>
        )}
      </div>
    </>
  );
}
