import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import LoginForm from "../../components/auth/LoginForm";

export default function Login() {
  return (
    <>
      <PageMeta
       title="SIPPS LogIn Dashboard - SMKN 1 Batam"
        description="Sistem Informasi Poin Pelanggaran Siswa - SMKN 1 Batam"
      />
      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    </>
  );
}
