import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from "react-router-dom";
import Layout from "../components/layout/Layout";
import HomePage from "../pages/HomePage";
import TestsPage from "../pages/TestsPage";
import EquipmentPage from "../pages/EquipmentPage";
import ReportsPage from "../pages/ReportsPage";
import ManualsPage from "../pages/ManualsPage";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Navigate to="/home" replace />} />
      <Route path="home" element={<HomePage />} />
      <Route path="tests" element={<TestsPage />} />
      <Route path="equipment" element={<EquipmentPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="manuals" element={<ManualsPage />} />
    </Route>,
  ),
);
