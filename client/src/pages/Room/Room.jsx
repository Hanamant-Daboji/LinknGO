import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { socket } from "../../socket";
import "./Room.css";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue in Leaflet + Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Room() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const userNameFromState = location.state?.userName;
  const [userName] = useState(userNameFromState || "Unknown");
  const [users, setUsers] = useState({}); // { socketId: { userName, lat, lng } }
  const [mySocketId, setMySocketId] = useState(null);
  const [center, setCenter] = useState([12.9716, 77.5946]); // default: Bangalore

  // Join room & set up listeners
  useEffect(() => {
    if (!userNameFromState) {
      // If user refreshed and lost state, send back home
      navigate("/");
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      setMySocketId(socket.id);
      socket.emit("join-room", { roomId, userName });
    };

    const handleRoomUsers = (roomUsers) => {
      setUsers(roomUsers);
    };

    const handleUserJoined = ({ socketId, userName }) => {
      setUsers((prev) => ({
        ...prev,
        [socketId]: { userName, lat: null, lng: null },
      }));
    };

    const handleLocationUpdate = ({ socketId, userName, lat, lng }) => {
      setUsers((prev) => ({
        ...prev,
        [socketId]: { userName, lat, lng },
      }));

      // For first position, center map to current user
      if (socketId === socket.id && lat && lng) {
        setCenter([lat, lng]);
      }
    };

    const handleUserLeft = ({ socketId }) => {
      setUsers((prev) => {
        const copy = { ...prev };
        delete copy[socketId];
        return copy;
      });
    };

    socket.on("connect", handleConnect);
    socket.on("room-users", handleRoomUsers);
    socket.on("user-joined", handleUserJoined);
    socket.on("location-update", handleLocationUpdate);
    socket.on("user-left", handleUserLeft);

    return () => {
      socket.emit("leave-room", { roomId });
      socket.off("connect", handleConnect);
      socket.off("room-users", handleRoomUsers);
      socket.off("user-joined", handleUserJoined);
      socket.off("location-update", handleLocationUpdate);
      socket.off("user-left", handleUserLeft);
      socket.disconnect();
    };
  }, [roomId, userName, userNameFromState, navigate]);

  // Geolocation: watchPosition
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not available in this browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        socket.emit("location-update", {
          roomId,
          lat: latitude,
          lng: longitude,
        });
      },
      (err) => {
        console.error("Error getting position:", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [roomId]);

  const handleLeave = () => {
    navigate("/");
  };

  const userList = Object.entries(users); // [ [socketId, data], ... ]

  return (
    <div className="room-page">
      <header className="room-header">
        <div className="room-header-left">
          <h2>Room: {roomId}</h2>
          <p className="room-subtext">
            You are logged in as <span>{userName}</span>
          </p>
        </div>
        <div className="room-header-right">
          <div className="room-pill">
            <span className="dot" />
            {userList.length} online
          </div>
          <button className="btn leave" onClick={handleLeave}>
            Leave Journey
          </button>
        </div>
      </header>

      <main className="room-main">
        <section className="room-map-section">
          <MapContainer
            center={center}
            zoom={14}
            scrollWheelZoom={true}
            className="room-map"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {userList.map(([id, data]) => {
              if (data.lat == null || data.lng == null) return null;
              const isMe = id === mySocketId;
              return (
                <Marker key={id} position={[data.lat, data.lng]}>
                  <Popup>
                    {data.userName} {isMe ? "(You)" : ""}
                    <br />
                    Lat: {data.lat.toFixed(4)}, Lng: {data.lng.toFixed(4)}
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </section>

        <aside className="room-sidebar">
          <h3>Riders in this journey</h3>
          <ul>
            {userList.map(([id, data]) => {
              const isMe = id === mySocketId;
              const hasLocation = data.lat != null && data.lng != null;
              return (
                <li key={id}>
                  <span className="rider-name">
                    {data.userName} {isMe && <span className="you-pill">you</span>}
                  </span>
                  <span className={`status-dot ${hasLocation ? "online" : "idle"}`} />
                </li>
              );
            })}
          </ul>
          <p className="small-note">
            This is MVP: only live location + shared map is implemented.
            <br />
            Later you can add: route, ETA, SOS, AI suggestions, trip summary, etc.
          </p>
        </aside>
      </main>
    </div>
  );
}
