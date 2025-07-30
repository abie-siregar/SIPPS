import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
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

import DataPoinPelanggarn from "./pages/ManajemenData/PoinPelanggaran/DataPoinPelanggaran";
import DataRombel from "./pages/ManajemenData/Rombel/DataRombel";
import EditDataRombel from "./pages/ManajemenData/Rombel/EditDataRombel";
import TambahPelanggaran from "./pages/ManajemenData/PoinPelanggaran/TambahDataPoinPelanggaran";
import EditDataPoinPelanggaran from "./pages/ManajemenData/PoinPelanggaran/EditPoinPoinPelanggaran";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Auth routes (tanpa layout) */}
        <Route path="/login" element={<Login />} />
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

          {/* Data Poin Pelanggaran */}
          <Route
            path="/data-poin-pelanggaran"
            element={<DataPoinPelanggarn />}
          />
          <Route
            path="/data-poin-pelanggaran/tambah"
            element={<TambahPelanggaran />}
          />
          <Route
            path="/data-poin-pelanggaran/edit/:id"
            element={<EditDataPoinPelanggaran />}
          />

          <Route path="/data-rombel" element={<DataRombel />} />
          <Route path="/data-rombel/edit/:id" element={<EditDataRombel />} />
          <Route path="/data-user" element={<DataRombel />} />

          {/* Others */}
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<Blank />} />

          {/* Tables */}
          <Route path="/basic-tables" element={<BasicTables />} />

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
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
