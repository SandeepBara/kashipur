import { useEffect, useRef, useState } from "react";

const playerPromises = new Map();

function getGatewayAssetUrl(wsUrl) {
  const url = new URL(wsUrl);
  url.protocol = url.protocol === "wss:" ? "https:" : "http:";
  url.pathname = "/video-stream.js";
  url.search = "";
  url.hash = "";
  return url.toString();
}

function loadGo2rtcPlayer(wsUrl) {
  try {
    if (customElements.get("video-stream")) return Promise.resolve();

    const scriptUrl = getGatewayAssetUrl(wsUrl);
    if (playerPromises.has(scriptUrl)) return playerPromises.get(scriptUrl);

    const playerPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[data-go2rtc-player="${scriptUrl}"]`);
      if (existingScript) {
        customElements.whenDefined("video-stream").then(resolve).catch(reject);
        return;
      }

      const script = document.createElement("script");
      script.type = "module";
      script.src = scriptUrl;
      script.dataset.go2rtcPlayer = scriptUrl;
      script.onload = () => customElements.whenDefined("video-stream").then(resolve).catch(reject);
      script.onerror = () => {
        script.remove();
        reject(new Error("Could not load the go2rtc WebRTC player module"));
      };
      document.head.appendChild(script);
    }).catch((error) => {
      playerPromises.delete(scriptUrl);
      throw error;
    });

    playerPromises.set(scriptUrl, playerPromise);
    return playerPromise;
  } catch (error) {
    return Promise.reject(error);
  }
}

function getSnapshotUrl(wsUrl) {
  try {
    const url = new URL(wsUrl);
    url.protocol = url.protocol === "wss:" ? "https:" : "http:";
    url.pathname = "/api/frame.jpeg";
    return url.toString();
  } catch (error) {
    console.error("Could not build go2rtc snapshot URL", error);
    return "";
  }
}

export default function CameraTile({ camera }) {
  const playerRef = useRef(null);
  const [time, setTime] = useState(() => new Date());
  const [running, setRunning] = useState(true);
  const [error, setError] = useState("");
  const wsUrl = camera.streamUrl;

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!running || !wsUrl) return undefined;

    let cancelled = false;
    const connect = async () => {
      try {
        setError("");
        await loadGo2rtcPlayer(wsUrl);
        if (cancelled || !playerRef.current) return;
        playerRef.current.mode = "webrtc,mse";
        playerRef.current.src = new URL(wsUrl);
      } catch (loadError) {
        console.error("Could not connect to the go2rtc player", loadError);
        if (!cancelled) setError("Could not load the go2rtc player. Check the gateway URL and access settings.");
      }
    };

    connect();
    return () => {
      cancelled = true;
    };
  }, [wsUrl, running]);

  const takeSnapshot = () => {
    try {
      const snapshotUrl = getSnapshotUrl(wsUrl);
      if (snapshotUrl) window.open(snapshotUrl, "_blank", "noopener,noreferrer");
    } catch (snapshotError) {
      console.error("Could not open camera snapshot", snapshotError);
      setError("Could not open the camera snapshot.");
    }
  };

  return (
    <div className="overflow-hidden bg-slate-950 text-white">
      <div className="relative min-h-[240px] bg-black sm:min-h-[300px]">
        {running ? (
          <video-stream ref={playerRef} style={{ display: "block", width: "100%", minHeight: "240px", aspectRatio: "16 / 9" }} />
        ) : (
          <div className="flex min-h-[240px] items-center justify-center text-sm text-slate-400 sm:min-h-[300px]">Camera stopped</div>
        )}
        <span className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold tracking-wide shadow ${running ? "bg-rose-600/95 text-white" : "bg-slate-800/95 text-slate-200"}`}><span className={running ? "h-1.5 w-1.5 animate-pulse rounded-full bg-white" : "h-1.5 w-1.5 rounded-full bg-slate-400"} />{running ? "LIVE" : "STOPPED"}</span>
        <span className="absolute right-3 top-3 rounded-lg bg-black/60 px-2.5 py-1.5 text-[10px] font-medium tabular-nums text-slate-100 backdrop-blur">{time.toLocaleString()}</span>
        {error && <span className="absolute bottom-3 left-3 right-3 rounded-xl bg-rose-900/90 px-3 py-2 text-xs text-white shadow">{error}</span>}
      </div>
      <div className="flex flex-col gap-3 bg-slate-900 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="min-w-0"><strong className="block truncate text-sm">{camera.name}</strong><span className="text-[11px] text-slate-400">go2rtc WebRTC stream</span></div>
        <div className="flex gap-2">
          <button type="button" className="min-h-9 flex-1 rounded-lg border border-slate-600 px-3 text-xs font-semibold transition hover:border-slate-400 hover:bg-white/5 sm:flex-none" onClick={() => setRunning((current) => !current)}>{running ? "Stop feed" : "Start feed"}</button>
          <button type="button" className="min-h-9 flex-1 rounded-lg bg-white px-3 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 disabled:opacity-50 sm:flex-none" onClick={takeSnapshot} disabled={!running}>Snapshot</button>
        </div>
      </div>
    </div>
  );
}
