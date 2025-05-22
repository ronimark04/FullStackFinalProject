import './index.css';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Map from './components/Map'
import { Card, Button } from '@heroui/react';

function App() {

  return (
    <>
      <Card>
        <h2 className="text-xl font-bold">Welcome</h2>
        <p>This is a HeroUI Card component.</p>
        <Button>Click me</Button>
      </Card>
      <Router>
        <Routes>
          <Route path="/" element={<Map />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
