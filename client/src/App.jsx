import { Routes, Route } from "react-router-dom";
import Map from './components/Map'
import Home from './components/Home'
import SiteNavbar from "./components/SiteNavbar";

function App() {

  return (
    <>
      <SiteNavbar>
      </SiteNavbar>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>

    </>
  )
}

export default App
