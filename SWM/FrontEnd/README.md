# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Field monitoring dashboard

The SWM dashboard now shows today's vehicle GPS tracks, TC consumer-visit tracks, and consumer locations. Consumer search covers consumer number, holding/house number, street, locality, and address; selection can be single or multiple. Area search zooms to mapped consumers whose saved street, locality, or address matches. Selecting a TC and a consumer enables a road route and Google Maps directions from that TC's latest recorded visit. In multiple mode the first selected consumer is the route destination.

Double-clicking the map drops a pin and requests the OpenStreetMap reverse-geocoder once for that point; there are no geocoding requests on pointer movement or consumer-marker hover. Named buildings can appear even when their names are absent from the consumer database. OSM may have no building name or may return a nearby road/place; coverage depends on community mapping. Consumer markers show saved holding/house and address details in their click popup. Coordinates from deliberate double-clicks are sent to OSM through Laravel and cached for 30 days. The backend limits public geocoder calls; configure `NOMINATIM_USER_AGENT` with an identifiable app name and contact for deployment. Use a shared Laravel cache such as Redis when running multiple backend instances. Public Nominatim usage policy: one request per second maximum, so use a self-hosted or managed geocoder if usage grows.

TC tracks are based on recorded consumer visits. Continuous live TC movement requires a staff phone or GPS tracker to submit periodic location updates; the current web dashboard does not create those location samples on its own.

### CCTV

The CCTV UI lives in `src/components/common/CctvMonitor.jsx`, separate from the tracking map. It supports selecting a camera, single view, up to four feeds in a 2×2 grid, refreshing feeds, and fullscreen. Configure each camera's stream type in the Laravel backend environment so URLs are not compiled into the public frontend bundle. Supported types are `viewer` (NVR/WebRTC viewer page), `hls` (`.m3u8`), `video` (MP4/WebM), `mjpeg` (multipart JPEG), and `rtsp` (server-only; must be converted through a gateway). Example:

```dotenv
CCTV_CAMERAS='[{"id":"gate","name":"Main Gate","type":"viewer","view_url":"https://nvr.example.local/view/camera-1"},{"id":"yard","name":"Yard","type":"hls","stream_url":"https://media.example.local/yard/index.m3u8"},{"id":"office","name":"Office","type":"rtsp"}]'
```

The authenticated camera-list API exposes only configured IDs, names, types, and browser stream URLs. RTSP addresses remain server-side; convert those feeds through an NVR or RTSP-to-HLS/WebRTC gateway. HLS plays natively only in browsers that support it; use an embeddable NVR player or an HLS.js-enabled gateway for other browsers. Do not put camera passwords in a browser URL. NVR pages must allow iframe embedding. “Viewer page loaded” confirms the page loaded, not that video is healthy. Clear cached Laravel config after changing environment values.

### Map tiles

The dashboard defaults to Esri World Imagery satellite tiles with transparent street and place label layers over the imagery. Maximum map zoom is 18. This adds road and place names where the provider has them; individual building names and address coverage vary by area. Configure `VITE_MAP_TILE_URL`, `VITE_MAP_ATTRIBUTION`, `VITE_MAP_STREET_LABELS_URL`, and `VITE_MAP_PLACE_LABELS_URL` to use other map services. Review the providers' current service terms and usage limits before production deployment. [Esri attribution guidance](https://support.esri.com/en-us/knowledge-base/what-is-the-correct-way-to-cite-an-arcgis-online-basema-000012040)

Consumer routing uses the OSRM-compatible endpoint in `VITE_ROUTING_URL` (defaults to the public OSRM demo endpoint). Set this to a managed or self-hosted routing service for production; the public demo endpoint is best-effort and not intended as a production SLA. The Google Maps directions link remains available as a navigation fallback.
