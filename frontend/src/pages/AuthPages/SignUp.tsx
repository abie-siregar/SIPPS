import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="SIPPS SignUp Dashboard - SMKN 1 Batam"
        description="Sistem Informasi Poin Pelanggaran Siswa - SMKN 1 Batam"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
