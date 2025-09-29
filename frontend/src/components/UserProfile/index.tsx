import { useEffect, useState } from "react";
import axios from "../../api/axios";
import UserInfoCard from "./UserInfoCard";
import UserMetaCard from "./UserMetaCard";

export default function UserProfile() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/auth/profile");
        setUser(res.data.user);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        User Profile
      </h2>

      <UserMetaCard user={user} />

      {/* Personal Information */}
      <UserInfoCard />

      {/* Address Information */}
      {/* <UserAddressCard /> */}
    </div>
  );
}
