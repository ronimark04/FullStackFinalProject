import { Routes, Route } from "react-router-dom";
import Map from './components/Map'

function App() {

  return (
    <>

      <Routes>
        <Route path="/" element={<Map />} />
      </Routes>

    </>
  )
}

export default App
