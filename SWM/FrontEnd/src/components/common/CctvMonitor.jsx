import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiVideo } from "react-icons/fi";
import CameraTile from "./CameraTile";
import { swmCctvCameraAddApi, swmCctvCameraDeleteApi, swmCctvCameraEditApi, swmCctvCameraListApi } from "../../api/endpoints";
import { getToken } from "../../utils/auth";

const inferType = (camera) => {
  const url = String(camera.streamUrl || "").toLowerCase();
  if (camera.type && !["ip", "rtsp", "ffmpeg"].includes(camera.type)) return camera.type;
  if (/^wss?:\/\//.test(url)) return "webrtc";
  if (url.includes(".m3u8")) return "hls";
  if (/\.(mp4|webm|ogg)(\?|$)/.test(url)) return "video";
  if (/\.(mjpeg|mjpg)(\?|$)/.test(url)) return "mjpeg";
  if (camera.type === "rtsp") return url ? "viewer" : "rtsp";
  if (camera.type === "ffmpeg") return url ? "viewer" : "ffmpeg";
  if (camera.type === "ip") return url ? "viewer" : "ip";
  return "viewer";
};

function CameraFeed({ camera }) {
  const [status, setStatus] = useState("Connecting…");
  const streamUrl = camera.streamUrl;
  const type = inferType(camera);

  useEffect(() => setStatus("Connecting…"), [camera.id, streamUrl]);

  if (["ip", "rtsp", "ffmpeg"].includes(type) && !streamUrl) {
    return <div className="flex h-[300px] items-center justify-center bg-slate-950 p-6 text-center text-sm text-white">
      Add a browser playback URL from your camera, NVR, or go2rtc gateway to view this IP camera. Use its HLS, WebRTC viewer, or MJPEG URL. The RTSP source and credentials stay encrypted on the server.
    </div>;
  }

  if (!streamUrl) {
    return <div className="flex h-[300px] items-center justify-center bg-slate-950 p-6 text-center text-sm text-white">No stream URL is configured for this camera.</div>;
  }

  if (type === "webrtc") {
    return <CameraTile camera={camera} />;
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
  const [canManage, setCanManage] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const emptyForm = { id: "", name: "", type: "viewer", streamUrl: "", sourceUrl: "" };
  const [form, setForm] = useState(emptyForm);

  const loadCameras = useCallback(async () => {
    if (!token) return;
    setLoadError(false);
    try {
      const response = await axios.post(swmCctvCameraListApi, {}, {
      headers: { Authorization: `Bearer ${token}` },
      });
      const payload = response?.data?.status ? response.data.data || {} : {};
      const rows = payload.cameras || [];
      setCameras(rows);
      setCanManage(Boolean(payload.canManage));
      setSelectedCameraId((current) => rows.some((camera) => String(camera.id) === String(current)) ? current : rows[0]?.id || "");
    } catch (error) {
      console.error("Could not load CCTV cameras", error);
      setLoadError(true);
    }
  }, [token]);

  useEffect(() => { loadCameras(); }, [loadCameras]);

  const visibleCameras = useMemo(() => layout === "grid"
    ? cameras.slice(0, 4)
    : cameras.filter((camera) => String(camera.id) === String(selectedCameraId)), [cameras, layout, selectedCameraId]);

  const refreshFeeds = () => setRefreshKey((key) => key + 1);
  const openFullscreen = () => wallRef.current?.requestFullscreen?.();

  const editCamera = (camera) => {
    setForm({ id: camera.id, name: camera.name, type: camera.type, streamUrl: camera.streamUrl || "", sourceUrl: "" });
    setFormError("");
    setShowForm(true);
  };

  const saveCamera = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const submitForm = { ...form };
      if (/^ffmpeg:/i.test(String(submitForm.streamUrl || "").trim())) {
        submitForm.type = "ffmpeg";
        submitForm.sourceUrl = submitForm.streamUrl.trim();
        submitForm.streamUrl = "";
      }
      const saveUrl = submitForm.id ? swmCctvCameraEditApi : swmCctvCameraAddApi;
      const response = await axios.post(saveUrl, submitForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response?.data?.status) throw new Error(response?.data?.message || "Could not save camera");
      setShowForm(false);
      setForm(emptyForm);
      await loadCameras();
    } catch (error) {
      const errors = error.response?.data?.errors;
      setFormError(Object.values(errors || {}).flat().join(" ") || error.response?.data?.message || error.message || "Could not save camera");
    } finally {
      setSaving(false);
    }
  };

  const removeCamera = async (camera) => {
    if (!window.confirm(`Remove ${camera.name} from CCTV monitoring?`)) return;
    try {
      const response = await axios.post(swmCctvCameraDeleteApi, { id: camera.id }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response?.data?.status) throw new Error(response?.data?.message || "Could not remove camera");
      await loadCameras();
    } catch (error) {
      setFormError(error.response?.data?.message || "Could not remove camera");
    }
  };

  return (
    <section ref={wallRef} className="space-y-4 rounded-2xl bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><FiVideo size={18} /></span>
            <div>
              <h3 className="font-semibold text-slate-900">Camera monitoring</h3>
              <p className="mt-0.5 text-xs text-slate-500">{cameras.length} configured camera{cameras.length === 1 ? "" : "s"}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {cameras.length > 0 && <>
          {layout === "single" && <select aria-label="Select CCTV camera" className="min-h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:min-w-48 sm:flex-none" value={selectedCameraId} onChange={(event) => setSelectedCameraId(event.target.value)}>
            {cameras.map((camera) => <option key={camera.id} value={camera.id}>{camera.name}</option>)}
          </select>}
          <button type="button" className={`min-h-10 rounded-xl border px-3 text-xs font-semibold transition ${layout === "single" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`} onClick={() => setLayout("single")}>Single</button>
          <button type="button" className={`min-h-10 rounded-xl border px-3 text-xs font-semibold transition ${layout === "grid" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`} onClick={() => setLayout("grid")}>2×2 grid</button>
          <button type="button" className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50" onClick={refreshFeeds}>Refresh</button>
          <button type="button" className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50" onClick={openFullscreen}>Fullscreen</button>
          </>}
          {canManage && <button type="button" className="min-h-10 rounded-xl bg-emerald-700 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-800" onClick={() => { setForm(emptyForm); setFormError(""); setShowForm(true); }}>Add camera</button>}
        </div>
      </div>
      {showForm && <form onSubmit={saveCamera} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
        <label className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold text-slate-600">Camera name
          <input required maxLength={150} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold text-slate-600">Camera type
          <select className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
            <option value="viewer">NVR / WebRTC viewer</option>
            <option value="hls">HLS</option>
            <option value="video">MP4 / WebM</option>
            <option value="mjpeg">MJPEG</option>
            <option value="webrtc">go2rtc WebRTC</option>
            <option value="ip">IP camera (RTSP)</option>
            <option value="rtsp">RTSP source</option>
            <option value="ffmpeg">FFmpeg source (go2rtc)</option>
          </select>
        </label>
        {!['ip', 'rtsp', 'ffmpeg'].includes(form.type) ? <label className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold text-slate-600 sm:col-span-2">{form.type === "webrtc" ? "go2rtc WebSocket URL" : "Browser stream or viewer URL"}
          <input required type="url" className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" value={form.streamUrl} onChange={(event) => setForm((current) => ({ ...current, streamUrl: event.target.value }))} placeholder={form.type === "webrtc" ? "ws://192.168.1.10:1984/api/ws?src=frontdoor" : "https://nvr.example/camera/1"} />
        </label> : <>
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold text-slate-600">Private camera source (encrypted at rest)
            <input type="password" autoComplete="new-password" className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" value={form.sourceUrl} onChange={(event) => setForm((current) => ({ ...current, sourceUrl: event.target.value }))} placeholder={form.id ? "Leave blank to keep current source" : form.type === "ffmpeg" ? "ffmpeg:http://camera-address/video#video=h264" : "rtsp://user:password@192.168.1.20:554/Streaming/Channels/101"} />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold text-slate-600">Optional browser playback or WebRTC URL
            <input type="url" className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" value={form.streamUrl} onChange={(event) => setForm((current) => ({ ...current, streamUrl: event.target.value }))} placeholder="ws://gateway:1984/api/ws?src=frontdoor" />
          </label>
        </>}
        <p className="text-xs leading-5 text-slate-500 sm:col-span-2">For go2rtc WebRTC, use a WebSocket endpoint such as ws://gateway:1984/api/ws?src=camera-name. RTSP credentials stay encrypted. The browser must reach the gateway; HTTPS deployments need wss://.</p>
        {formError && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 sm:col-span-2">{formError}</p>}
        <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
          <button type="button" className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50" onClick={() => setShowForm(false)}>Cancel</button>
          <button disabled={saving} type="submit" className="min-h-11 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-50">{saving ? "Saving…" : form.id ? "Save changes" : "Add camera"}</button>
        </div>
      </form>}
      {loadError ? <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">Unable to load configured cameras. Check access and backend CCTV settings.</p> : cameras.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm"><FiVideo size={20} /></span>
          <p className="mt-3 text-sm font-semibold text-slate-800">No cameras configured</p>
          <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">Add an IP camera, NVR viewer or go2rtc stream to start monitoring live feeds.</p>
          {canManage && <button type="button" className="mt-4 min-h-10 rounded-xl bg-emerald-700 px-4 text-xs font-semibold text-white hover:bg-emerald-800" onClick={() => { setForm(emptyForm); setFormError(""); setShowForm(true); }}>Configure a camera</button>}
        </div>
      ) : (
        <div className={`grid gap-4 ${layout === "grid" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
          {visibleCameras.map((camera) => (
            <article key={`${camera.id}-${refreshKey}`} className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm">
              <div className="flex min-h-12 items-center justify-between gap-3 bg-slate-900 px-3 py-2.5 text-sm text-white sm:px-4">
                <span className="min-w-0 truncate font-semibold">{camera.name} <span className="ml-1 rounded-md bg-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-300">{camera.type}</span></span>
                {canManage && <div className="flex shrink-0 gap-3 text-xs font-medium text-slate-300"><button type="button" className="transition hover:text-white" onClick={() => editCamera(camera)}>Edit</button><button type="button" className="transition hover:text-rose-300" onClick={() => removeCamera(camera)}>Remove</button></div>}
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
