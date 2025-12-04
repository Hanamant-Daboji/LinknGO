import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home/Home.jsx";
import Room from "./pages/Room/Room.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import CreateJourney from "./pages/CreateJourney/CreateJourney";
import CreateRoom from "./pages/CreateRoom/CreateRoom";
import "./App.css";

function App() {
  return (
    <div className="app-root">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateJourney />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
