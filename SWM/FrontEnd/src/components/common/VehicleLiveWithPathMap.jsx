import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { swmConsumerLocationListApi, swmWastCollationApi, vehicleMovementLogApi } from "../../api/endpoints";
import { getToken } from "../../utils/auth";

window.Pusher = Pusher;

function VehicleTracker() {
  const token = getToken();

  const mapRef = useRef(null);
  const markers = useRef({});
  const paths = useRef({});
  const iconCache = useRef({});
  const householdMarkers = useRef({});
  const echoRef = useRef(null); // Ref to store Echo instance

  const [consumerList, setConsumerList] = useState([]);
  const [visitedConsumerList, setVisitedConsumerList] = useState([]);

  useEffect(() => {
    const setupTracker = async () => {
      try {
        // 1. Initialize Leaflet Map
        if (!mapRef.current) {
          console.log("📍 Initializing Map...");
          mapRef.current = L.map("vehicle-map", {
            center: [20.5937, 78.9629],
            zoom: 15,
          });

          L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
            attribution: "© Esri",
            maxZoom: 20
          }).addTo(mapRef.current);
        }

        // 2. Initialize Laravel Echo (Reverb)
        if (!echoRef.current) {
          console.log("📡 Connecting to Reverb...");
          
          echoRef.current = new Echo({
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY,
            wsHost: import.meta.env.VITE_REVERB_HOST,
            wsPort: import.meta.env.VITE_REVERB_PORT,
            wssPort: import.meta.env.VITE_REVERB_PORT,
            forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
            enabledTransports: ['ws',"wss"],
            disableStats: true,
            heartbeatInterval: 30000,
          });

          // Connection Event Bindings
          const connection = echoRef.current.connector.pusher.connection;

          connection.bind('connected', () => console.log('✅ WebSocket Connected!'));
          connection.bind('error', (err) => console.error('❌ WebSocket Error:', err));
          connection.bind('disconnected', () => console.warn('⚠️ WebSocket Disconnected'));

          // Listen for Real-time Updates
          echoRef.current.channel("fleet-monitoring")
            .listen(".location.updated", (e) => {
              let data = e?.data??e;
              console.log("🛰️ Data Received:", data);
              if (e) {
                // Note: Pass e directly if your event sends the formatted object
                updateVehicles([data], "websocket"); 
              }
            });
        }

        // 3. Perform Initial Data Load
        await loadVehicles();

      } catch (err) {
        console.error("🚨 Initialization Failed:", err.message);
      }
    };

    const loadVehicles = async () => {
      try {
        const response = await axios.post(vehicleMovementLogApi, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response?.data?.status) {
          updateVehicles(response.data.data, "api");
        }
      } catch (error) {
        console.error("❌ Failed to load initial vehicle data:", error);
      }
    };

    // Run the setup
    if (token) {
      setupTracker();
    }

    // Cleanup on Unmount
    return () => {
      if (echoRef.current) {
        console.log("🔌 Disconnecting Echo...");
        echoRef.current.disconnect();
        echoRef.current = null; // Reset the ref
      }
    };
  }, [token]);

  // 2️⃣ Fetch All Consumer Locations (Red Markers)
  useEffect(() => {
    const fetchConsumers = async () => {
      try {
        const response = await axios.post(swmConsumerLocationListApi, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response?.data?.status) {
          setConsumerList(response.data.data);
          sparedConsumer(response.data.data);
        }
      } catch (error) { console.error(error); }
    };
    if (token) fetchConsumers();
  }, [token]);

  // 3️⃣ Fetch Visited Consumers (Keep polling for these if not yet web-socketed)
  useEffect(() => {
    const fetchVisited = async () => {
      try {
        const response = await axios.post(swmWastCollationApi, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response?.data?.status) setVisitedConsumerList(response.data.data);
      } catch (error) { console.error(error); }
    };
    if (token) {
      fetchVisited();
      const interval = setInterval(fetchVisited, 60000); // Increased interval to save battery
      return () => clearInterval(interval);
    }
  }, [token]);

  // 4️⃣ Sync Colors when Visited Data arrives
  useEffect(() => {
    if (visitedConsumerList.length > 0 && Object.keys(householdMarkers.current).length > 0) {
      updateVisitingColor(visitedConsumerList);
    }
  }, [visitedConsumerList]);

  // --- Logic: Update Moving Vehicles ---
  const updateVehicles = (list,from=null) => {
    console.log("list",list);
    list.forEach((v) => {
      const id = v?.id; // Support both API and WebSocket keys
      if (!v.latitude || !v.longitude) return;

      const type = v.type || "default"; // Fallback icon
      if (!iconCache.current[type]) {
        iconCache.current[type] = new L.Icon({
          iconUrl: `/icons/${type}.png`,
          iconSize: [30, 30],
          iconAnchor: [21, 21],
        });
      }

      const icon = iconCache.current[type];
      const newLatLng = [parseFloat(v.latitude), parseFloat(v.longitude)];

      if (!markers.current[id]) {
        markers.current[id] = L.marker(newLatLng, { icon })
          .addTo(mapRef.current)
          .bindTooltip(v.vehicleNo || `Vehicle ${id}`, { direction: "top", offset: [0, -10] });
      } else {
        markers.current[id].setLatLng(newLatLng);
      }

      // Update Path if available
      if (v.path?.length > 0) {
        const latlngs = v.path.map((p) => [p.latitude, p.longitude]);
        if (!paths.current[id]) {
          paths.current[id] = L.polyline(latlngs, { color: "cyan", weight: 4 }).addTo(mapRef.current);
        } else {
          paths.current[id].setLatLngs(latlngs);
        }
      }
    });
  };

  // --- Logic: Households ---
  const sparedConsumer = (list) => {
    if (!list || list.length === 0) return;
    const validPoints = [];
    list.forEach((v) => {
      if (!v.latitude || !v.longitude) return;
      const lat = parseFloat(v.latitude);
      const lng = parseFloat(v.longitude);
      const houseKey = `${v.id}`;

      if (!householdMarkers.current[houseKey]) {
        const hMarker = L.circleMarker([lat, lng], {
          radius: 7,
          fillColor: "#e74c3c",
          color: "#fff",
          weight: 2,
          fillOpacity: 0.9,
        }).addTo(mapRef.current);

        hMarker.bindPopup(`<b>Consumer:</b> ${v.consumer_no}<br>ID: ${v.id}`);
        householdMarkers.current[houseKey] = hMarker;
      }
      validPoints.push([lat, lng]);
    });

    if (validPoints.length > 0 && mapRef.current) {
      mapRef.current.fitBounds(L.latLngBounds(validPoints), { padding: [50, 50] });
    }
  };

  const updateVisitingColor = (visitedList) => {
    visitedList.forEach((visited) => {
      const houseKey = `${visited.consumer_id}`;
      const targetMarker = householdMarkers.current[houseKey];
      if (targetMarker) {
        targetMarker.setStyle({ fillColor: "#2ecc71" });
      }
    });
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Live Real-Time Tracker</h2>
      <div id="vehicle-map" style={{ height: "450px", width: "100%", borderRadius: "8px" }}></div>
    </div>
  );
}

export default VehicleTracker;