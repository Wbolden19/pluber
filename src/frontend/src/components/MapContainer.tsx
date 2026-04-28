import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import { useEffect, useRef } from "react";

interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
  type?: "job" | "worker" | "home";
}

interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
  height?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletMap = any;

export function MapContainer({
  center = [40.7128, -74.006],
  zoom = 12,
  markers = [],
  className,
  height = "400px",
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap>(null);
  const centerRef = useRef(center);
  const zoomRef = useRef(zoom);
  const markersRef = useRef(markers);

  centerRef.current = center;
  zoomRef.current = zoom;
  markersRef.current = markers;

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;

    let destroyed = false;

    async function initMap() {
      if (!el || destroyed) return;

      let L: LeafletMap;
      try {
        // @ts-expect-error leaflet may not be installed yet
        const leaflet = await import("leaflet");
        L = leaflet.default ?? leaflet;
      } catch {
        // leaflet not available
        return;
      }

      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (destroyed) return;
      const map = L.map(el).setView(centerRef.current, zoomRef.current);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      for (const marker of markersRef.current) {
        L.marker([marker.lat, marker.lng])
          .addTo(map)
          .bindPopup(marker.label ?? "");
      }
    }

    initMap();

    return () => {
      destroyed = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden border border-border",
        className,
      )}
      style={{ height }}
    >
      <div ref={mapRef} className="absolute inset-0" />
      {markers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <MapPin className="w-8 h-8 opacity-30" />
            <span className="text-sm opacity-50">No jobs in area</span>
          </div>
        </div>
      )}
    </div>
  );
}
