import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CloudRain, MapPin, Wind, Droplets, Thermometer } from 'lucide-react';
import { api, ApiError, readAccessToken, type WeatherSnapshot } from '@/lib/api';
import { StatusBadge } from '@/components/dashboard/Badges';

export default async function FarmDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = (await readAccessToken())!;

  let farm;
  try {
    farm = await api.getFarm(token, id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const [farmer, weather] = await Promise.all([
    api.getFarmer(token, farm.farmerId).catch(() => null),
    api.weatherForFarm(token, id).catch((): WeatherSnapshot | null => null),
  ]);

  const lat = farm.location?.coordinates[1];
  const lng = farm.location?.coordinates[0];

  return (
    <section className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-2 text-sm text-fg-muted">
        <Link href="/farms" className="hover:text-primary">
          ← Farms
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-fg">{farm.farmName}</h1>
          <p className="mt-1 font-mono text-sm text-fg-subtle">{farm.farmId}</p>
        </div>
        <StatusBadge
          label={farm.approvalStatus}
          tone={
            farm.approvalStatus === 'approved'
              ? 'success'
              : farm.approvalStatus === 'rejected'
                ? 'danger'
                : 'pending'
          }
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {/* Farm details */}
        <Card title="Farm">
          <Row label="Owner" value={farm.farmName} />
          <Row label="Area" value={`${farm.farmArea.toFixed(2)} acres`} />
          <Row label="Growing area" value={`${farm.growingArea.toFixed(2)} acres`} />
          <Row label="Organic stage" value={farm.organicStage} />
          {farmer ? (
            <Row
              label="Farmer"
              value={
                <Link
                  href={`/farmers/${farmer._id}`}
                  className="text-primary hover:underline"
                >
                  {farmer.firstName} {farmer.lastName ?? ''}
                </Link>
              }
            />
          ) : null}
        </Card>

        {/* Location */}
        <Card title="Location">
          <Row label="Village" value={farm.address?.village ?? '—'} />
          <Row label="District" value={farm.address?.district ?? '—'} />
          <Row label="State" value={farm.address?.state ?? '—'} />
          {Number.isFinite(lat) && Number.isFinite(lng) ? (
            <Row
              label="Coordinates"
              value={
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3 text-fg-subtle" aria-hidden />
                  <code className="font-mono text-xs">
                    {lat!.toFixed(5)}, {lng!.toFixed(5)}
                  </code>
                </span>
              }
            />
          ) : null}
        </Card>

        {/* Weather */}
        <div className="md:col-span-2">
          {weather ? <WeatherCard w={weather} /> : <WeatherUnavailable />}
        </div>

        {/* Timestamps */}
        <Card title="Registered">
          <Row label="Created" value={new Date(farm.createdAt).toLocaleString()} />
        </Card>
      </div>
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm">
      <h2 className="text-xs uppercase tracking-wider text-fg-subtle">{title}</h2>
      <dl className="mt-3 space-y-2">{children}</dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs text-fg-subtle">{label}</dt>
      <dd className="truncate text-sm text-fg">{value}</dd>
    </div>
  );
}

function WeatherUnavailable() {
  return (
    <div className="rounded-2xl border border-border bg-bg-muted/40 p-5">
      <h2 className="text-xs uppercase tracking-wider text-fg-subtle">Weather</h2>
      <p className="mt-2 text-sm text-fg-muted">
        Couldn't fetch weather. The farm may not have GPS set, or Open-Meteo timed out.
      </p>
    </div>
  );
}

function WeatherCard({ w }: { w: WeatherSnapshot }) {
  const today = w.daily[0];
  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xs uppercase tracking-wider text-fg-subtle">Weather (Open-Meteo)</h2>
        <span className="text-[10px] text-fg-subtle">
          {new Date(w.fetchedAt).toLocaleTimeString()}
        </span>
      </div>

      {/* Current */}
      <div className="mt-4 flex flex-wrap items-baseline gap-4">
        <div>
          <p className="font-display text-5xl tabular-nums text-fg">
            {Math.round(w.current.tempC)}°
            <span className="ml-1 text-base text-fg-muted">C</span>
          </p>
          {w.current.description ? (
            <p className="mt-1 text-sm text-fg-muted">{w.current.description}</p>
          ) : null}
        </div>
        <ul className="flex flex-wrap gap-4 text-sm text-fg-muted">
          {w.current.feelsLikeC !== undefined ? (
            <li className="inline-flex items-center gap-1.5">
              <Thermometer className="size-3.5" />
              Feels {Math.round(w.current.feelsLikeC)}°
            </li>
          ) : null}
          {w.current.humidity !== undefined ? (
            <li className="inline-flex items-center gap-1.5">
              <Droplets className="size-3.5" />
              {w.current.humidity}% humidity
            </li>
          ) : null}
          {w.current.windKmh !== undefined ? (
            <li className="inline-flex items-center gap-1.5">
              <Wind className="size-3.5" />
              {Math.round(w.current.windKmh)} km/h
            </li>
          ) : null}
          {today?.precipMm !== undefined ? (
            <li className="inline-flex items-center gap-1.5">
              <CloudRain className="size-3.5" />
              {today.precipMm.toFixed(1)} mm today
            </li>
          ) : null}
        </ul>
      </div>

      {/* Advisories */}
      {w.advisories.length > 0 ? (
        <ul className="mt-4 space-y-1.5">
          {w.advisories.map((a, i) => (
            <li
              key={i}
              className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-fg"
            >
              {a}
            </li>
          ))}
        </ul>
      ) : null}

      {/* 7-day */}
      <ol className="mt-5 grid grid-cols-7 gap-2 text-center">
        {w.daily.map((d, i) => (
          <li key={d.date} className="rounded-lg border border-border bg-bg-muted/30 px-2 py-3">
            <p className="text-[10px] uppercase tracking-wider text-fg-subtle">
              {i === 0 ? 'Today' : new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}
            </p>
            <p className="mt-1 font-mono text-sm tabular-nums text-fg">
              {Math.round(d.maxC)}°
            </p>
            <p className="font-mono text-xs text-fg-subtle tabular-nums">{Math.round(d.minC)}°</p>
            {d.precipProbability && d.precipProbability >= 30 ? (
              <p className="mt-1 text-[10px] text-info">{d.precipProbability}%</p>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
