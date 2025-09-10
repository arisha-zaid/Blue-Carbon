import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getProjects } from "../store/projects";
import { useEffect, useState } from "react";
import L from "leaflet";

// Fix default marker icons for Vite/ESM (avoid require in browser)
const iconRetinaUrl = new URL(
  "leaflet/dist/images/marker-icon-2x.png",
  import.meta.url
).toString();
const iconUrl = new URL(
  "leaflet/dist/images/marker-icon.png",
  import.meta.url
).toString();
const shadowUrl = new URL(
  "leaflet/dist/images/marker-shadow.png",
  import.meta.url
).toString();
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

export default function ProjectMap() {
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    setProjects(getProjects());
  }, []);

  return (
    <MapContainer
      center={[20, 77]}
      zoom={5}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {projects.map((p) => {
        // Handle different coordinate formats
        const getPosition = () => {
          // New format from AddProject.jsx
          if (
            p.coordinates &&
            p.coordinates.latitude &&
            p.coordinates.longitude
          ) {
            return [p.coordinates.latitude, p.coordinates.longitude];
          }
          // Legacy format (if any old data exists)
          if (p.lat && p.lng) {
            return [p.lat, p.lng];
          }
          // Default fallback to India center
          return [20, 77];
        };

        return (
          <Marker key={p.id} position={getPosition()}>
            <Popup>
              <div>
                <strong>{p.name}</strong>
                <br />
                Location: {p.location}
                <br />
                CO₂ Credits: {p.predictedCO2} t/yr
                <br />
                Status: {p.status}
                {p.coordinates && (
                  <>
                    <br />
                    Coordinates: {p.coordinates.latitude?.toFixed(4)},{" "}
                    {p.coordinates.longitude?.toFixed(4)}
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
