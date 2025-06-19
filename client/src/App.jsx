import { Routes, Route } from "react-router-dom";
import Map from './components/Map'
import Home from './components/Home'
import SiteNavbar from "./components/SiteNavbar";
import AreaPage from "./components/AreaPage";
import Signup from "./components/Signup";
import ArtistPage from "./components/ArtistPage";
import ProfilePage from "./components/ProfilePage";
import { AuthProvider } from "./context/authContext";
import Contact from "./components/Contact";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <SiteNavbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/area/:areaName" element={<AreaPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/artist/:artistId" element={<ArtistPage />} />
          <Route path="/user/:userId" element={<ProfilePage />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App

// TODO: delete comments and logs, go through api requests to find redundencies
