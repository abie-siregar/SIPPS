import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import LoginForm from "../../components/auth/LoginForm";

export default function AdminLogin() {
  return (
    <>
      <PageMeta
        title="Admin Login"
        description="Admin access to dashboard"
      />
      <AuthLayout reverse>
        <LoginForm />
      </AuthLayout>
    </>
  );
}
