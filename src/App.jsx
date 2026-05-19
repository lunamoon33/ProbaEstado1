import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar.jsx";
import { MapaPage } from "./pages/MapaPage.jsx";
import { ReportePage } from "./pages/ReportePage.jsx";
import { VerificarPage } from "./pages/VerificarPage.jsx";
import { MunicipioPage } from "./pages/MunicipioPage.jsx";
import { MonitoreoPage } from "./pages/MonitoreoPage.jsx";
import { CiudadanoPage } from "./pages/CiudadanoPage.jsx";
import { InstitucionalPage } from "./pages/InstitucionalPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/verificar/:id" element={<VerificarPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<MapaPage />} />
                <Route path="/reporte/:id" element={<ReportePage />} />
                <Route path="/municipio" element={<MunicipioPage />} />
                <Route path="/monitoreo" element={<MonitoreoPage />} />
                <Route path="/ciudadano" element={<CiudadanoPage />} />
                <Route path="/institucional" element={<InstitucionalPage />} />
              </Routes>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
