import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import PageMeta from "../components/common/PageMeta";
import { useEffect, useState } from "react";
import axios from "../api/axios.ts";

export default function UserProfiles() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/profile");
        setUser(res.data.user);
      } catch (err) {
        console.error("Gagal ambil data profile:", err);
      }
    };

    fetchProfile();
  }, []);
  return (
    <>
      <PageMeta title="SIPPS" description="Sistem Poin Pelanggaran Siswa" />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          {user && <UserMetaCard user={user} />}
          <UserInfoCard />
          <UserAddressCard />
        </div>
      </div>
    </>
  );
}
