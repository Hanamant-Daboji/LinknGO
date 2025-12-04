import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [roomIdInput, setRoomIdInput] = useState("");

  const handleStartJourney = () => {
    if (!userName.trim()) return alert("Enter your name first");
    navigate("/create", { state: { userName } });
  };

  const handleJoin = () => {
    if (!userName.trim()) return alert("Enter your name first");
    if (!roomIdInput.trim()) return alert("Enter Room ID");
    navigate(`/room/${roomIdInput.trim().toUpperCase()}`, {
      state: { userName, isCreator: false },
    });
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="home-title">LinknGo 🚗</h1>
        <p className="home-subtitle">
          Live journey sharing with real-time location on the same map.
        </p>

        {/* User name */}
        <div className="home-field">
          <label>Your name</label>
          <input
            type="text"
            placeholder="Hanamant"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <button onClick={handleStartJourney} className="btn primary">
          Start New Journey
        </button>

        <div className="home-divider">
          <span>or join existing</span>
        </div>

        {/* Join section */}
        <div className="home-field">
          <label>Room ID</label>
          <input
            type="text"
            placeholder="ABC123"
            value={roomIdInput}
            onChange={(e) => setRoomIdInput(e.target.value)}
          />
        </div>

        <button onClick={handleJoin} className="btn secondary">
          Join Journey
        </button>
      </div>
    </div>
  );
}
