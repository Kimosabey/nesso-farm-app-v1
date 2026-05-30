'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents } from 'react-leaflet';
import { Icon, type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Avoid bundling the default Leaflet icon URLs that 404 in our app dir
const MARKER_ICON = new Icon({
  iconUrl:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
        <path d="M14 0C6.27 0 0 6.27 0 14c0 10 14 26 14 26s14-16 14-26C28 6.27 21.73 0 14 0z" fill="#0D783C"/>
        <circle cx="14" cy="14" r="6" fill="#fff"/>
      </svg>`,
    ),
  iconSize: [28, 40],
  iconAnchor: [14, 40],
});

interface Point {
  lat: number;
  lng: number;
}

interface PolygonMapProps {
  initialCenter?: Point;
  onCenterChange: (pt: Point) => void;
  onPolygonChange: (poly: Point[]) => void;
  onAreaChange: (acres: number) => void;
}

const DEFAULT_CENTER: Point = { lat: 12.2958, lng: 76.6394 }; // Mysuru

export default function PolygonMap({
  initialCenter,
  onCenterChange,
  onPolygonChange,
  onAreaChange,
}: PolygonMapProps) {
  const [center, setCenter] = useState<Point>(initialCenter ?? DEFAULT_CENTER);
  const [polygon, setPolygon] = useState<Point[]>([]);
  const polyRef = useRef<Point[]>([]);

  // Compute area (acres) from polygon points using the shoelace + Haversine
  const acres = useMemo(() => polygonAreaAcres(polygon), [polygon]);

  useEffect(() => {
    polyRef.current = polygon;
    onPolygonChange(polygon);
    onAreaChange(acres);
  }, [polygon, acres, onPolygonChange, onAreaChange]);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-border">
        <MapContainer
          center={[center.lat, center.lng] as LatLngExpression}
          zoom={15}
          style={{ height: 360, width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[center.lat, center.lng] as LatLngExpression} icon={MARKER_ICON} />
          {polygon.length >= 2 ? (
            <Polygon
              positions={polygon.map((p) => [p.lat, p.lng] as LatLngExpression)}
              pathOptions={{
                color: '#0D783C',
                weight: 2,
                fillColor: '#0D783C',
                fillOpacity: 0.18,
              }}
            />
          ) : null}
          <MapClickHandler
            onClick={(pt) => {
              setCenter(pt);
              onCenterChange(pt);
            }}
            onShiftClick={(pt) => setPolygon((cur) => [...cur, pt])}
          />
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-bg-muted/40 px-3 py-2 text-sm">
        <span className="text-fg-muted">
          Center:{' '}
          <code className="font-mono text-xs text-fg">
            {center.lat.toFixed(5)}, {center.lng.toFixed(5)}
          </code>
        </span>
        <span className="text-fg-muted">·</span>
        <span className="text-fg-muted">
          Polygon: <strong className="text-fg">{polygon.length}</strong> vertices
        </span>
        <span className="text-fg-muted">·</span>
        <span className="text-fg-muted">
          Area: <strong className="font-mono tabular-nums text-fg">{acres.toFixed(2)} ac</strong>
        </span>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => setPolygon((cur) => cur.slice(0, -1))}
            disabled={polygon.length === 0}
            className="h-8 rounded-md border border-border-strong px-3 text-xs text-fg transition hover:bg-bg disabled:opacity-50"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={() => setPolygon([])}
            disabled={polygon.length === 0}
            className="h-8 rounded-md border border-border-strong px-3 text-xs text-fg transition hover:bg-bg disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      <p className="text-xs text-fg-subtle">
        <strong>Click</strong> to move the center pin (GPS coordinates). <strong>Shift+click</strong> to
        add a polygon vertex. Use Undo / Clear above. Calculated area auto-fills the form when you save.
      </p>
    </div>
  );
}

function MapClickHandler({
  onClick,
  onShiftClick,
}: {
  onClick: (pt: Point) => void;
  onShiftClick: (pt: Point) => void;
}) {
  useMapEvents({
    click(e) {
      const pt = { lat: e.latlng.lat, lng: e.latlng.lng };
      // Shift held = add polygon vertex
      const evt = e.originalEvent;
      if (evt && (evt.shiftKey || (evt as MouseEvent).shiftKey)) {
        onShiftClick(pt);
      } else {
        onClick(pt);
      }
    },
  });
  return null;
}

/**
 * Polygon area in acres via spherical excess (good enough for ≤ tens-of-acres
 * fields at sub-meter precision; not for continent-scale shapes).
 */
function polygonAreaAcres(points: Point[]): number {
  if (points.length < 3) return 0;
  const R = 6378137; // Earth radius in m
  const rad = (deg: number) => (deg * Math.PI) / 180;
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += (rad(b.lng) - rad(a.lng)) * (2 + Math.sin(rad(a.lat)) + Math.sin(rad(b.lat)));
  }
  const sqm = Math.abs((sum * R * R) / 2);
  return sqm / 4046.8564224; // sqm -> acres
}
