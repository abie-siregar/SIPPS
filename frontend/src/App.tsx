import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import NotFound from "./pages/OtherPage/NotFound";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Login from "./pages/AuthPages/Login";
import AdminLogin from "./pages/AuthPages/AdminLogin";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DataPoinPelanggaran from "./pages/ManajemenData/PoinPelanggaran/DataPoinPelanggaran";
import DataRombel from "./pages/ManajemenData/Rombel/DataRombel";
import EditDataRombel from "./pages/ManajemenData/Rombel/EditDataRombel";
import TambahPelanggaran from "./pages/ManajemenData/PoinPelanggaran/TambahDataPoinPelanggaran";
import DataPelanggaranSiswa from "./pages/ManajemenData/PelanggaranSiswa/DataPelanggaranSiswa";
import PTK from "./pages/ManajemenData/PTK/DataPTK";
import Siswa from "./pages/ManajemenData/Siswa/DataSiswa";
import UserProfile from "./components/UserProfile";
import DataUsers from "./pages/ManajemenData/Users/DataUsers";
import DataSanksi from "./pages/ManajemenData/Sanksi/DataSanksi";
import SignUp from "./pages/AuthPages/SignUp";
import { AuthProvider } from "./context/AuthContext";
import DataPlottingBK from "./pages/ManajemenData/PlottingBK/DataPlottingBK";
import ManajemenPoinSanksi from "./pages/TestLayout/ManajemenPoinSanksi/ManajemenPoinSanksi";
import ManajemenDataUsers from "./pages/TestLayout/ManajemenUser/ManajemenDataUsers";
import ManajemenRombelPlotting from "./pages/TestLayout/ManajemenRombelPlotting";
import ManajemenDataSiswa from "./pages/TestLayout/ManajemenDataSiswa/ManajemenDataSiswa";
import ManajemenPembinaanPelanggaran from "./pages/TestLayout/ManajemenPelanggaranPembinaan/ManajemenPelanggaranPembinaan";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Default route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Auth routes (tanpa layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Routes yang memakai AppLayout */}
          <Route element={<AppLayout />}>
            {/* Dashboard (dengan proteksi login) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            {/* Manajemen Data */}
            /* Data Poin Pelanggaran */
            <Route
              path="/data-poin-pelanggaran"
              element={
                <ProtectedRoute
                  roles={[
                    "Admin",
                    "BK",
                    "Guru",
                    "Wali Kelas",
                    "Tenaga Kependidikan",
                    "Siswa",
                  ]}
                >
                  <DataPoinPelanggaran />
                </ProtectedRoute>
              }
            />
            <Route
              path="/data-poin-pelanggaran/tambah"
              element={
                <ProtectedRoute roles={["Admin"]}>
                  <TambahPelanggaran />
                </ProtectedRoute>
              }
            />
            /* Pelanggaran-siswa */
            <Route
              path="/data-pelanggaran-siswa"
              element={
                <ProtectedRoute roles={["Admin", "BK", "Wali Kelas", "Siswa"]}>
                  <DataPelanggaranSiswa />
                </ProtectedRoute>
              }
            />
            /* Data Rombongan Belajar */
            <Route
              path="/data-rombel"
              element={
                <ProtectedRoute roles={["Admin", "Wali Kelas", "BK"]}>
                  <DataRombel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/data-rombel/edit/:id"
              element={
                <ProtectedRoute roles={["Admin"]}>
                  <EditDataRombel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/data-user"
              element={
                <ProtectedRoute roles={["Admin"]}>
                  <DataUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/data-sanksi"
              element={
                <ProtectedRoute
                  roles={[
                    "Admin",
                    "BK",
                    "Guru",
                    "Wali Kelas",
                    "Tenaga Kependidikan",
                    "Siswa",
                  ]}
                >
                  <DataSanksi />
                </ProtectedRoute>
              }
            />
            <Route
              path="/plotting-bk"
              element={
                <ProtectedRoute roles={["Admin"]}>
                  <DataPlottingBK />
                </ProtectedRoute>
              }
            />
            /* Data PTK & PD */
            <Route
              path="/ptk"
              element={
                <ProtectedRoute roles={["Admin", "Tenaga Kependidikan"]}>
                  <PTK />
                </ProtectedRoute>
              }
            />
            <Route
              path="/siswa"
              element={
                <ProtectedRoute roles={["Admin", "BK", "Guru", "Wali Kelas"]}>
                  <Siswa />
                </ProtectedRoute>
              }
            />
            /* Others */
            {/* TestLayout */}
            <Route
              path="/PoinSanksi"
              element={
                <ProtectedRoute>
                  <ManajemenPoinSanksi />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ManajemenDataUser"
              element={
                <ProtectedRoute>
                  <ManajemenDataUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ManajemenRombelPlotting"
              element={
                <ProtectedRoute>
                  <ManajemenRombelPlotting />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ManajemenDataSiswa"
              element={
                <ProtectedRoute>
                  <ManajemenDataSiswa />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ManajemenPelanggaranPembinaan"
              element={
                <ProtectedRoute>
                  <ManajemenPembinaanPelanggaran />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute
                  roles={[
                    "Admin",
                    "BK",
                    "Guru",
                    "Wali Kelas",
                    "Siswa",
                    "Tenaga Kependidikan",
                  ]}
                >
                  <Calendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blank"
              element={
                <ProtectedRoute roles={["Admin"]}>
                  <Blank />
                </ProtectedRoute>
              }
            />
            /* Tables */
            <Route
              path="/basic-tables"
              element={
                <ProtectedRoute roles={["Admin"]}>
                  <BasicTables />
                </ProtectedRoute>
              }
            />
            {/* UI Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />
            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
            <Route path="/user-profile" element={<UserProfile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
