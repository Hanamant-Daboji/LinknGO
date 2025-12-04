import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "./CreateJourney.css";

// 🔑 Mapbox token from .env
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function CreateJourney() {
  const navigate = useNavigate();

  // 🧠 Selected points
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);

  // 📍 DOM refs for map + geocoder containers
  const mapRef = useRef(null);
  const sourceSearchRef = useRef(null);
  const destinationSearchRef = useRef(null);

  useEffect(() => {
    // 1️⃣ Create Map instance
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [77.5946, 12.9716], // Bengaluru default
      zoom: 10,
    });

    // 2️⃣ Create Source geocoder (search box)
    const geocoder1 = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      marker: false,
      placeholder: "Search Source Location",
      mapboxgl,
    });

    // Clear any old content (important in React StrictMode)
    if (sourceSearchRef.current) {
      sourceSearchRef.current.innerHTML = "";
      sourceSearchRef.current.appendChild(geocoder1.onAdd(map));
    }

    geocoder1.on("result", (e) => {
      setSource({
        name: e.result.place_name,
        lat: e.result.center[1],
        lng: e.result.center[0],
      });
    });

    // 3️⃣ Create Destination geocoder
    const geocoder2 = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      marker: false,
      placeholder: "Search Destination Location",
      mapboxgl,
    });

    if (destinationSearchRef.current) {
      destinationSearchRef.current.innerHTML = "";
      destinationSearchRef.current.appendChild(geocoder2.onAdd(map));
    }

    geocoder2.on("result", (e) => {
      setDestination({
        name: e.result.place_name,
        lat: e.result.center[1],
        lng: e.result.center[0],
      });
    });

    // 4️⃣ Allow manual selection by clicking map
    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;

      if (!source) {
        setSource({ name: "Custom Source", lat, lng });
        alert("Source selected → Now select Destination");
      } else if (!destination) {
        setDestination({ name: "Custom Destination", lat, lng });
        alert("Destination selected → Click Continue");
      }
    });

    // 5️⃣ Cleanup (VERY IMPORTANT)
    return () => {
      map.remove();
      // remove geocoder DOM so they don't duplicate on remount
      if (sourceSearchRef.current) sourceSearchRef.current.innerHTML = "";
      if (destinationSearchRef.current) destinationSearchRef.current.innerHTML = "";
    };
  }, []); // 🔁 run only once on mount

  // 👉 When user clicks "Continue"
  const handleSubmit = () => {
    if (!source || !destination) {
      alert("Please select both Source & Destination");
      return;
    }

    // Pass both points to next screen
    navigate("/create-room", { state: { source, destination, userName: location.state?.userName } });

  };

  return (
    <div className="create-journey-page">
      <h2>Create New Journey 🚗</h2>
      <p>Select & confirm your starting point and destination</p>

      {/* 🔎 Search for source & destination */}
      <div ref={sourceSearchRef} className="search-box" />
      <div ref={destinationSearchRef} className="search-box" />

      {/* 🗺 Map for manual selection */}
      <div ref={mapRef} className="select-map" />

      <button className="btn create" onClick={handleSubmit}>
        Continue → Create Journey
      </button>
    </div>
  );
}
