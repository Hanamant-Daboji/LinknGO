import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./CreateRoom.css";

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function CreateRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const { source, destination, userName } = location.state || {};

  const [roomId] = useState(generateRoomId());
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  // ❗ If user comes here directly without selecting points → redirect
  useEffect(() => {
    if (!source || !destination) navigate("/");
  }, []);

  // 📌 Call Mapbox Directions API to calculate distance + ETA
  useEffect(() => {
    if (!source || !destination) return;

    const fetchRoute = async () => {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${source.lng},${source.lat};${destination.lng},${destination.lat}?geometries=geojson&overview=full&access_token=${token}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setDistance((route.distance / 1000).toFixed(2)); // km
        setDuration(Math.ceil(route.duration / 60)); // minutes
      }
    };

    fetchRoute();
  }, [source, destination]);

  const handleStart = () => {
    navigate(`/room/${roomId}`, {
      state: { userName, isCreator: true, source, destination },
    });
  };

  return (
    <div className="create-room-page">
      <h2>Journey Summary 🚗</h2>

      <p><strong>From:</strong> {source?.name}</p>
      <p><strong>To:</strong> {destination?.name}</p>

      {distance && duration && (
        <>
          <p><strong>Distance:</strong> {distance} km</p>
          <p><strong>Estimated time:</strong> {duration} mins</p>
        </>
      )}

      <div className="room-id-box">
        <p>Share this journey code with friends</p>
        <h1>{roomId}</h1>
      </div>

      <button className="btn start" onClick={handleStart}>
        Start Journey
      </button>
    </div>
  );
}
