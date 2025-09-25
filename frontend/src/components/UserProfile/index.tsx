import UserInfoCard from "./UserInfoCard";
import UserAddressCard from "./UserAddressCard";
import UserMetaCard from "./UserMetaCard";

export default function UserProfile() {
  const user = {
    username: "John Doe",
    email: "johndoe@example.com",
    role: "Admin",
  };

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
