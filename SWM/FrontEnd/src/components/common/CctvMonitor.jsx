import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { swmCctvCameraListApi } from "../../api/endpoints";
import { getToken } from "../../utils/auth";

const inferType = (camera) => {
  if (camera.type) return camera.type;
  const url = String(camera.streamUrl || "").toLowerCase();
  if (url.includes(".m3u8")) return "hls";
  if (/\.(mp4|webm|ogg)(\?|$)/.test(url)) return "video";
  if (/\.(mjpeg|mjpg)(\?|$)/.test(url)) return "mjpeg";
  return "viewer";
};

function CameraFeed({ camera }) {
  const [status, setStatus] = useState("Connecting…");
  const streamUrl = camera.streamUrl;
  const type = inferType(camera);

  useEffect(() => setStatus("Connecting…"), [camera.id, streamUrl]);

  if (type === "rtsp") {
    return <div className="flex h-[300px] items-center justify-center bg-slate-950 p-6 text-center text-sm text-white">
      This camera uses RTSP. Connect it through an NVR or RTSP-to-HLS/WebRTC gateway, then configure the browser stream URL. The RTSP address stays on the server.
    </div>;
  }

  if (!streamUrl) {
    return <div className="flex h-[300px] items-center justify-center bg-slate-950 p-6 text-center text-sm text-white">No stream URL is configured for this camera.</div>;
  }

  if (type === "viewer") {
    return <div className="relative">
      <iframe
        title={`CCTV ${camera.name}`}
        src={streamUrl}
        className="h-[300px] w-full border-0 bg-black"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        onLoad={() => setStatus("Viewer page loaded")}
        onError={() => setStatus("Viewer unavailable")}
      />
      <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">{status}</span>
    </div>;
  }

  if (type === "mjpeg") {
    return <div className="relative h-[300px] bg-black">
      <img src={streamUrl} alt={`Live camera ${camera.name}`} className="h-full w-full object-contain" onLoad={() => setStatus("Image stream loaded")} onError={() => setStatus("Stream unavailable")} />
      <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">{status}</span>
    </div>;
  }

  if (type === "hls" || type === "video") {
    return <div className="relative flex h-[300px] items-center justify-center bg-black">
      <video
        src={streamUrl}
        className="h-full w-full object-contain"
        controls
        autoPlay
        muted
        playsInline
        onLoadedData={() => setStatus("Video playing")}
        onError={() => setStatus(type === "hls" ? "HLS unsupported or stream unavailable" : "Video unavailable")}
      />
      {type === "hls" && <span className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white">HLS works natively in Safari; use an NVR viewer or HLS.js gateway for browsers without native HLS.</span>}
      <span className="absolute right-2 top-2 rounded bg-black/70 px-2 py-1 text-xs text-white">{status}</span>
    </div>;
  }

  return <div className="flex h-[300px] items-center justify-center bg-slate-950 p-6 text-center text-sm text-white">Unsupported stream type: {type}</div>;
}

export default function CctvMonitor() {
  const token = getToken();
  const wallRef = useRef(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [layout, setLayout] = useState("single");
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!token) return;
    axios.post(swmCctvCameraListApi, {}, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      const rows = response?.data?.status ? response.data.data || [] : [];
      setCameras(rows);
      setSelectedCameraId((current) => current || rows[0]?.id || "");
    }).catch((error) => {
      console.error("Could not load CCTV cameras", error);
      setLoadError(true);
    });
  }, [token]);

  const visibleCameras = useMemo(() => layout === "grid"
    ? cameras.slice(0, 4)
    : cameras.filter((camera) => String(camera.id) === String(selectedCameraId)), [cameras, layout, selectedCameraId]);

  const refreshFeeds = () => setRefreshKey((key) => key + 1);
  const openFullscreen = () => wallRef.current?.requestFullscreen?.();

  return (
    <section ref={wallRef} className="space-y-3 rounded-lg border bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">CCTV monitoring</h3>
          <p className="text-xs text-gray-500">{cameras.length} configured camera{cameras.length === 1 ? "" : "s"}</p>
        </div>
        {cameras.length > 0 && <div className="flex flex-wrap items-center gap-2">
          {layout === "single" && <select aria-label="Select CCTV camera" className="rounded border px-3 py-2 text-sm" value={selectedCameraId} onChange={(event) => setSelectedCameraId(event.target.value)}>
            {cameras.map((camera) => <option key={camera.id} value={camera.id}>{camera.name}</option>)}
          </select>}
          <button type="button" className={`rounded border px-3 py-2 text-sm ${layout === "single" ? "bg-slate-800 text-white" : ""}`} onClick={() => setLayout("single")}>Single view</button>
          <button type="button" className={`rounded border px-3 py-2 text-sm ${layout === "grid" ? "bg-slate-800 text-white" : ""}`} onClick={() => setLayout("grid")}>2×2 grid</button>
          <button type="button" className="rounded border px-3 py-2 text-sm" onClick={refreshFeeds}>Refresh feeds</button>
          <button type="button" className="rounded border px-3 py-2 text-sm" onClick={openFullscreen}>Fullscreen</button>
        </div>}
      </div>
      {loadError ? <p className="rounded bg-red-50 p-3 text-sm text-red-700">Unable to load configured cameras. Check access and backend CCTV settings.</p> : cameras.length === 0 ? (
        <p className="rounded bg-slate-50 p-4 text-sm text-gray-600">No cameras configured. Add camera types and stream URLs to the backend <code>CCTV_CAMERAS</code> setting.</p>
      ) : (
        <div className={`grid gap-3 ${layout === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
          {visibleCameras.map((camera) => (
            <article key={`${camera.id}-${refreshKey}`} className="overflow-hidden rounded border bg-black">
              <div className="flex items-center justify-between bg-slate-900 px-3 py-2 text-sm text-white">
                <span>{camera.name}</span>
                <span className="text-xs text-slate-300">{inferType(camera).toUpperCase()}</span>
              </div>
              <CameraFeed key={`${camera.id}-${refreshKey}`} camera={camera} />
            </article>
          ))}
        </div>
      )}
      {layout === "grid" && cameras.length > 4 && <p className="text-xs text-gray-500">Showing the first four cameras. Use Single view to choose another camera.</p>}
    </section>
  );
}
