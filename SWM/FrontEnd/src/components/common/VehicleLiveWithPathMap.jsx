import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { mapFeatureNameApi, swmConsumerLocationListApi, swmWastCollationApi, vehicleMovementLogApi } from "../../api/endpoints";
import { getToken } from "../../utils/auth";
import CctvMonitor from "./CctvMonitor";

window.Pusher = Pusher;
const mapTileUrl = import.meta.env.VITE_MAP_TILE_URL || "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const mapAttribution = import.meta.env.VITE_MAP_ATTRIBUTION || 'Sources: Esri, Maxar, Earthstar Geographics, and the GIS User Community · &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>';
const streetLabelsUrl = import.meta.env.VITE_MAP_STREET_LABELS_URL || "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}";
const placeLabelsUrl = import.meta.env.VITE_MAP_PLACE_LABELS_URL || "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

const coordinates = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
    ? [lat, lng]
    : null;
};

const consumerBuildingName = (consumer) => {
  const holding = consumer?.holdingNo ?? consumer?.holding_no;
  const house = consumer?.houseNo ?? consumer?.house_no;
  const street = consumer?.streetName ?? consumer?.street_name;
  const locality = consumer?.locality;
  const address = consumer?.address;
  const identity = [holding && `Holding ${holding}`, house && `House ${house}`].filter(Boolean).join(" · ");
  const area = [street, locality, address].filter(Boolean).join(", ");
  return [identity || (consumer?.consumerNo ?? consumer?.consumer_no ?? `Consumer ${consumer?.id}`), area].filter(Boolean).join(" — ");
};

function VehicleTracker() {
  const token = getToken();
  const mapElement = useRef(null);
  const map = useRef(null);
  const vehicleMarkers = useRef({});
  const vehiclePaths = useRef({});
  const tcMarkers = useRef({});
  const tcPaths = useRef({});
  const consumerMarkers = useRef({});
  const locationPin = useRef(null);
  const destinationRoute = useRef(null);
  const mapNameLookups = useRef({});
  const echo = useRef(null);
  const vehicles = useRef([]);
  const visits = useRef([]);
  const consumers = useRef([]);
  const [tcList, setTcList] = useState([]);
  const [consumerList, setConsumerList] = useState([]);
  const [selectedTc, setSelectedTc] = useState("");
  const [consumerSelectionMode, setConsumerSelectionMode] = useState("single");
  const [selectedConsumerIds, setSelectedConsumerIds] = useState([]);
  const [consumerQuery, setConsumerQuery] = useState("");
  const [areaQuery, setAreaQuery] = useState("");
  const [areaMessage, setAreaMessage] = useState("");
  const routingUrl = import.meta.env.VITE_ROUTING_URL || "https://router.project-osrm.org/route/v1/driving";


  const lookupMapFeatureName = useCallback((point) => {
    const key = point.map((value) => value.toFixed(5)).join(",");
    const showOnCurrentPin = (message) => {
      const pinPoint = locationPin.current?.getLatLng();
      const pinKey = pinPoint ? [pinPoint.lat, pinPoint.lng].map((value) => value.toFixed(5)).join(",") : "";
      if (pinKey === key) locationPin.current.setPopupContent(message).openPopup();
    };
    const cached = mapNameLookups.current[key];
    if (cached) {
      if (cached !== "pending") {
        showOnCurrentPin(cached);
      } else {
        showOnCurrentPin("Map name lookup in progress…");
      }
      return;
    }
    mapNameLookups.current[key] = "pending";
    axios.post(mapFeatureNameApi, { latitude: point[0], longitude: point[1] }, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      const name = response?.data?.data?.name;
      const label = response?.data?.data?.label;
      if (response?.data?.status) {
        const displayName = name || (label ? `No building name mapped · ${label}` : "No building name mapped here");
        mapNameLookups.current[key] = displayName;
        showOnCurrentPin(displayName);
      } else {
        delete mapNameLookups.current[key];
        showOnCurrentPin("No map name found here");
      }
    }).catch((error) => {
      delete mapNameLookups.current[key];
      const message = error.response?.status === 429 ? "Map lookup busy; double-click again shortly" : "Map name lookup unavailable";
      showOnCurrentPin(message);
    });
  }, [token]);

  const drawVehicles = useCallback((items) => {
    if (!map.current || !Array.isArray(items)) return;
    items.forEach((vehicle) => {
      const point = coordinates(vehicle.latitude, vehicle.longitude);
      if (!point) return;
      const id = vehicle.id;
      if (!vehicleMarkers.current[id]) {
        vehicleMarkers.current[id] = L.marker(point).addTo(map.current)
          .bindTooltip(vehicle.vehicleNo || `Vehicle ${id}`, { direction: "top" });
      } else {
        vehicleMarkers.current[id].setLatLng(point);
      }
      const points = (vehicle.path || []).map((entry) => coordinates(entry.latitude, entry.longitude)).filter(Boolean);
      if (points.length) {
        if (!vehiclePaths.current[id]) vehiclePaths.current[id] = L.polyline(points, { color: "#0891b2", weight: 4 }).addTo(map.current);
        else vehiclePaths.current[id].setLatLngs(points);
      }
    });
  }, []);

  const drawVisits = useCallback((rows) => {
    if (!map.current || !Array.isArray(rows)) return;
    const grouped = new Map();
    rows.forEach((row) => {
      const point = coordinates(row.latitude, row.longitude) || coordinates(row.consumerLatitude ?? row.consumer_latitude, row.consumerLongitude ?? row.consumer_longitude);
      if (!point) return;
      const userId = row.userId ?? row.user_id;
      const id = String(userId ?? "unknown");
      const userName = row.userName ?? row.user_name;
      if (!grouped.has(id)) grouped.set(id, { id, name: userName || `TC ${id}`, points: [], latest: null });
      const tc = grouped.get(id);
      tc.points.push(point);
      tc.latest = { point, consumerNo: row.consumerNo ?? row.consumer_no, consumerId: row.consumerId ?? row.consumer_id, time: row.visitingTime ?? row.visiting_time };

      const consumerId = String(row.consumerId ?? row.consumer_id);
      const buildingName = consumerBuildingName(row);
      if (!consumerMarkers.current[consumerId]) {
        consumerMarkers.current[consumerId] = L.circleMarker(point, {
          radius: 7, fillColor: "#ef4444", color: "#fff", weight: 2, fillOpacity: 0.9,
        }).addTo(map.current).bindPopup(buildingName);
      }
    });

    const list = [...grouped.values()];
    setTcList(list);
    list.forEach((tc) => {
      if (selectedTc && String(selectedTc) !== tc.id) return;
      if (!tc.latest) return;
      const label = `${tc.name}${tc.latest.time ? ` · ${tc.latest.time}` : ""}`;
      if (!tcMarkers.current[tc.id]) tcMarkers.current[tc.id] = L.marker(tc.latest.point).addTo(map.current).bindTooltip(label);
      else tcMarkers.current[tc.id].setLatLng(tc.latest.point).setTooltipContent(label);
      if (tcPaths.current[tc.id]) map.current.removeLayer(tcPaths.current[tc.id]);
      tcPaths.current[tc.id] = L.polyline(tc.points, { color: "#7c3aed", weight: 4, dashArray: "7 6" }).addTo(map.current);
    });
    return list;
  }, [selectedTc, lookupMapFeatureName]);

  useEffect(() => {
    if (!mapElement.current || map.current || !window.L) return undefined;
    map.current = L.map(mapElement.current, { maxZoom: 18 }).setView([20.5937, 78.9629], 5);
    map.current.createPane("labelPane");
    map.current.getPane("labelPane").style.zIndex = 350;
    L.tileLayer(mapTileUrl, {
      attribution: mapAttribution,
      maxZoom: 18,
    }).addTo(map.current);
    L.tileLayer(streetLabelsUrl, {
      attribution: "Street labels &copy; Esri",
      maxZoom: 18,
      zIndex: 500,
      pane: "labelPane",
    }).addTo(map.current);
    L.tileLayer(placeLabelsUrl, {
      attribution: "Place labels &copy; Esri",
      maxZoom: 18,
      zIndex: 501,
      pane: "labelPane",
    }).addTo(map.current);

    const handleMapDoubleClick = (event) => {
      const point = [event.latlng.lat, event.latlng.lng];
      if (locationPin.current) map.current.removeLayer(locationPin.current);
      locationPin.current = L.marker(point).addTo(map.current);
      locationPin.current.bindPopup("Looking up map name…").openPopup();
      lookupMapFeatureName(point);
    };
    map.current.doubleClickZoom.disable();
    map.current.on("dblclick", handleMapDoubleClick);

    let mapResizeObserver;
    try {
      if (window.ResizeObserver) {
        mapResizeObserver = new ResizeObserver(() => map.current?.invalidateSize({ pan: false }));
        mapResizeObserver.observe(mapElement.current);
      }
    } catch (error) {
      console.error("Could not observe the responsive map size", error);
    }

    return () => {
      mapResizeObserver?.disconnect();
      map.current?.off("dblclick", handleMapDoubleClick);
      if (echo.current) echo.current.disconnect();
      echo.current = null;
      map.current?.remove();
      map.current = null;
    };
  }, [lookupMapFeatureName]);

  useEffect(() => {
    if (!map.current || !token) return undefined;
    let active = true;
    const headers = { Authorization: `Bearer ${token}` };
    const loadVehicles = async () => {
      const response = await axios.post(vehicleMovementLogApi, {}, { headers });
      if (active && response?.data?.status) {
        vehicles.current = response.data.data || [];
        drawVehicles(vehicles.current);
      }
    };
    const loadMapData = async () => {
      try {
        const [visitResponse, consumerResponse] = await Promise.all([
          axios.post(swmWastCollationApi, {}, { headers }),
          axios.post(swmConsumerLocationListApi, {}, { headers }),
        ]);
        if (!active) return;
        visits.current = visitResponse?.data?.data || [];
        consumers.current = consumerResponse?.data?.data || [];
        setConsumerList(consumers.current);
        drawVisits(visits.current);
        consumers.current.forEach((consumer) => {
          const point = coordinates(consumer.latitude, consumer.longitude);
          if (!point || consumerMarkers.current[String(consumer.id)]) return;
          consumerMarkers.current[String(consumer.id)] = L.circleMarker(point, {
            radius: 6, fillColor: "#f97316", color: "#fff", weight: 2, fillOpacity: 0.75,
          }).addTo(map.current).bindPopup(consumerBuildingName(consumer));
        });
        const points = consumers.current.map((consumer) => coordinates(consumer.latitude, consumer.longitude)).filter(Boolean);

        if (points.length > 0) {
          const bounds = L.latLngBounds(points);
          map.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      } catch (error) {
        console.error("Could not load TC and consumer locations", error);
      }
    };

    Promise.all([loadVehicles().catch((error) => console.error("Could not load vehicles", error)), loadMapData()]);
    if (!echo.current) {
      echo.current = new Echo({
        broadcaster: "reverb",
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: import.meta.env.VITE_REVERB_PORT,
        wssPort: import.meta.env.VITE_REVERB_PORT,
        forceTLS: import.meta.env.VITE_REVERB_SCHEME === "https",
        enabledTransports: ["ws", "wss"],
        disableStats: true,
      });
      echo.current.channel("fleet-monitoring").listen(".location.updated", (event) => {
        const incoming = event?.data ?? event;
        const current = vehicles.current.filter((item) => String(item.id) !== String(incoming?.id));
        vehicles.current = [...current, incoming];
        drawVehicles([incoming]);
      });
    }
    const refreshVisits = window.setInterval(loadMapData, 60000);
    return () => {
      active = false;
      window.clearInterval(refreshVisits);
    };
  }, [token, drawVehicles, drawVisits, lookupMapFeatureName]);

  useEffect(() => {
    if (!map.current) return;
    Object.values(tcPaths.current).forEach((path) => map.current.removeLayer(path));
    Object.values(tcMarkers.current).forEach((marker) => map.current.removeLayer(marker));
    tcPaths.current = {};
    tcMarkers.current = {};
    drawVisits(visits.current);
  }, [selectedTc, drawVisits]);

  const selectedTcData = useMemo(() => tcList.find((tc) => tc.id === String(selectedTc)), [tcList, selectedTc]);
  const selectedConsumer = selectedConsumerIds[0] || "";
  const selectedConsumerData = useMemo(() => consumerList.find((consumer) => String(consumer.id) === String(selectedConsumer)), [consumerList, selectedConsumer]);
  const filteredConsumerList = useMemo(() => {
    const query = consumerQuery.trim().toLowerCase();
    if (!query) return consumerList;
    return consumerList.filter((consumer) => [
      consumer.consumerNo, consumer.consumer_no, consumer.holdingNo, consumer.holding_no,
      consumer.houseNo, consumer.house_no, consumer.streetName, consumer.street_name,
      consumer.locality, consumer.address,
    ].some((value) => String(value || "").toLowerCase().includes(query)));
  }, [consumerList, consumerQuery]);
  const destination = useMemo(() => coordinates(selectedConsumerData?.latitude, selectedConsumerData?.longitude), [selectedConsumerData]);
  const origin = useMemo(() => selectedTcData?.latest?.point, [selectedTcData]);
  const directionsUrl = destination && origin
    ? `https://www.google.com/maps/dir/?api=1&origin=${origin[0]},${origin[1]}&destination=${destination[0]},${destination[1]}&travelmode=driving`
    : null;

  useEffect(() => {
    if (destinationRoute.current && map.current) {
      map.current.removeLayer(destinationRoute.current);
      destinationRoute.current = null;
    }
    if (!origin || !destination || !map.current) return undefined;
    let active = true;
    const routeRequest = `${routingUrl}/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`;
    fetch(routeRequest)
      .then((response) => {
        if (!response.ok) throw new Error(`Routing service returned ${response.status}`);
        return response.json();
      })
      .then((result) => {
        const coordinatesList = result.routes?.[0]?.geometry?.coordinates;
        if (!active || !coordinatesList?.length) return;
        const points = coordinatesList.map(([longitude, latitude]) => [latitude, longitude]);
        destinationRoute.current = L.polyline(points, { color: "#f59e0b", weight: 5 }).addTo(map.current);
        map.current.fitBounds(destinationRoute.current.getBounds(), { padding: [40, 40] });
      })
      .catch((error) => console.warn("Road route could not be loaded", error));
    return () => { active = false; };
  }, [origin, destination, routingUrl]);

  useEffect(() => {
    if (!map.current || !selectedConsumer) return;
    const consumer = consumerList.find((item) => String(item.id) === String(selectedConsumer));
    const point = coordinates(consumer?.latitude, consumer?.longitude);
    if (point) consumerMarkers.current[String(selectedConsumer)]?.openPopup();
  }, [selectedConsumer, consumerList]);

  useEffect(() => {
    const selected = new Set(selectedConsumerIds.map(String));
    Object.entries(consumerMarkers.current).forEach(([id, marker]) => {
      marker.setStyle({
        fillColor: selected.has(id) ? "#facc15" : "#f97316",
        color: selected.has(id) ? "#854d0e" : "#fff",
        weight: selected.has(id) ? 3 : 2,
      });
    });
  }, [selectedConsumerIds, consumerList]);

  const searchArea = () => {
    const query = areaQuery.trim().toLowerCase();
    if (!query) {
      setAreaMessage("Enter an area, street, or locality name.");
      return;
    }
    const matches = consumerList.filter((consumer) => [consumer.locality, consumer.streetName, consumer.street_name, consumer.address]
      .some((value) => String(value || "").toLowerCase().includes(query)));
    const points = matches.map((consumer) => coordinates(consumer.latitude, consumer.longitude)).filter(Boolean);
    if (!points.length) {
      setAreaMessage("No mapped consumers found for that area name.");
      return;
    }
    setAreaMessage(`${points.length} mapped consumer${points.length === 1 ? "" : "s"} found.`);
    map.current?.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 18 });
  };

  const toggleConsumer = (consumerId) => {
    const id = String(consumerId);
    setSelectedConsumerIds((current) => {
      if (consumerSelectionMode === "single") return [id];
      if (current.includes(id)) return current.filter((item) => item !== id);
      return [...current, id];
    });
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4 xl:grid-cols-[minmax(220px,0.8fr)_minmax(300px,1.35fr)_minmax(230px,0.85fr)]">
        <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          TC route
          <select className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-800 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" value={selectedTc} onChange={(event) => setSelectedTc(event.target.value)}>
            <option value="">All TCs</option>
            {tcList.map((tc) => <option key={tc.id} value={tc.id}>{tc.name}</option>)}
          </select>
        </label>
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Consumer destination <span className="normal-case tracking-normal text-slate-400">({selectedConsumerIds.length} selected)</span></span>
            <div className="flex rounded-lg bg-slate-200/70 p-0.5">
              <button type="button" className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${consumerSelectionMode === "single" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`} onClick={() => { setConsumerSelectionMode("single"); setSelectedConsumerIds((current) => current.slice(0, 1)); }}>Single</button>
              <button type="button" className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${consumerSelectionMode === "multiple" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`} onClick={() => setConsumerSelectionMode("multiple")}>Multiple</button>
              {selectedConsumerIds.length > 0 && <button type="button" className="px-2 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-700" onClick={() => setSelectedConsumerIds([])}>Clear</button>}
            </div>
          </div>
          <input className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" value={consumerQuery} onChange={(event) => setConsumerQuery(event.target.value)} placeholder="Search name, holding, street or locality" />
          <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            {filteredConsumerList.slice(0, 100).map((consumer) => {
              const id = String(consumer.id);
              return <label key={id} className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-emerald-50">
                <input className="mt-0.5 accent-emerald-600" type={consumerSelectionMode === "single" ? "radio" : "checkbox"} name="consumer-destination" checked={selectedConsumerIds.includes(id)} onChange={() => toggleConsumer(id)} />
                <span className="min-w-0"><span className="block font-medium text-slate-800">{consumer.consumerNo || consumer.consumer_no || `Consumer ${id}`}</span><span className="block truncate text-xs text-slate-500">{consumerBuildingName(consumer)}</span></span>
              </label>;
            })}
            {filteredConsumerList.length === 0 && <p className="py-2 text-gray-500">No matching consumers.</p>}
            {filteredConsumerList.length > 100 && <p className="py-2 text-xs text-gray-500">Showing first 100 matches. Refine your search.</p>}
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <label htmlFor="area-search" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Search area</label>
          <div className="flex gap-2">
            <input id="area-search" className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" value={areaQuery} onChange={(event) => setAreaQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") searchArea(); }} placeholder="Street or locality" />
            <button type="button" className="rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700" onClick={searchArea}>Find</button>
          </div>
          {areaMessage && <span className="text-xs text-gray-500">{areaMessage}</span>}
        </div>
        {directionsUrl && <a className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 sm:col-span-2 xl:col-span-3" href={directionsUrl} target="_blank" rel="noreferrer">Open route from latest TC visit{selectedConsumerIds.length > 1 ? " to first selected consumer" : ""}</a>}
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
        <div ref={mapElement} className="h-[360px] w-full rounded-xl sm:h-[440px] xl:h-[520px]" />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-[11px] font-medium text-slate-500 sm:text-xs">
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Vehicle</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-violet-500" /> TC visit route</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Selected consumer</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Visited</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-orange-400" /> Other consumer</span>
        <span className="ml-auto text-slate-400">Double-click map to pin a place</span>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CctvMonitor />
      </div>
    </section>
  );
}

export default VehicleTracker;
