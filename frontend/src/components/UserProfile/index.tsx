import UserInfoCard from "./UserInfoCard";
import UserMetaCard from "./UserMetaCard";
import { useAuth } from "../../context/AuthContext";

export default function UserProfile() {
  const { user, loading } = useAuth();


  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User tidak ditemukan</p>;

  return (
    <div className="space-y-6 p-6 ">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        User Profile
      </h2>
      <UserMetaCard />
      <UserInfoCard />
    </div>
  );
}
