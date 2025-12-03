import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function generateRoomId() {
  // Simple random room id
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [roomIdInput, setRoomIdInput] = useState("");

  const handleCreateJourney = () => {
    if (!userName.trim()) {
      alert("Please enter your name");
      return;
    }
    const roomId = generateRoomId();
    navigate(`/room/${roomId}`, {
      state: { userName, isCreator: true },
    });
  };

  const handleJoinJourney = () => {
    if (!userName.trim()) {
      alert("Please enter your name");
      return;
    }
    if (!roomIdInput.trim()) {
      alert("Enter a room ID to join");
      return;
    }
    navigate(`/room/${roomIdInput.trim().toUpperCase()}`, {
      state: { userName, isCreator: false },
    });
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="home-title">LinknGo 🚗</h1>
        <p className="home-subtitle">
          Create a journey, share a code, and see your friends move on the same map in real-time.
        </p>

        <div className="home-field">
          <label>Your name</label>
          <input
            type="text"
            placeholder="Hanamant"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>

        <div className="home-buttons">
          <button onClick={handleCreateJourney} className="btn primary">
            Create Journey
          </button>
        </div>

        <div className="home-divider">
          <span>or join existing</span>
        </div>

        <div className="home-field">
          <label>Room ID</label>
          <input
            type="text"
            placeholder="ABC123"
            value={roomIdInput}
            onChange={(e) => setRoomIdInput(e.target.value)}
          />
        </div>

        <button onClick={handleJoinJourney} className="btn secondary">
          Join Journey
        </button>
      </div>
    </div>
  );
}
