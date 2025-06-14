import { Routes, Route } from "react-router-dom";
import Map from './components/Map'
import Home from './components/Home'
import SiteNavbar from "./components/SiteNavbar";
import AreaPage from "./components/AreaPage";

function App() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fbc37e' }}>
      <SiteNavbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/area/:areaName" element={<AreaPage />} />
      </Routes>
    </div>
  )
}

export default App

// TODO: delete comments and logs, go through api requests to find redundencies
