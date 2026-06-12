import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";

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
  "Orangtua/wali": {
    label: "Orangtua/wali",
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

  const roleConfig = (user?.role ? ROLE_CONFIG[user.role] : null) ?? FALLBACK_ROLE;

  const displayName = user?.nama || user?.username || "Pengguna";

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
      </div>
    </>
  );
}
