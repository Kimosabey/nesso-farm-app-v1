/**
 * SyncManager — drains the SQLite outbox when the network is up.
 *
 * Triggers:
 *   - NetInfo: any transition to connected
 *   - AppState: foreground
 *   - 60-second tick when foregrounded
 *   - Explicit `kick()` calls (e.g. after enqueue)
 */
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { outbox, type OutboxRow } from '@/db/outbox';
import { api, setOnline } from '@/api/client';

type Listener = (event: SyncEvent) => void;

export interface SyncStatus {
  online: boolean;
  draining: boolean;
  pending: number;
  failed: number;
  lastSyncAt: number | null;
  lastError: string | null;
}

export type SyncEvent =
  | { type: 'status'; status: SyncStatus }
  | { type: 'drained'; ok: number; failed: number }
  | { type: 'error'; message: string };

let online = false;
let draining = false;
let lastSyncAt: number | null = null;
let lastError: string | null = null;
let interval: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<Listener>();

async function snapshotStatus(): Promise<SyncStatus> {
  const counts = await outbox.counts().catch(() => ({ pending: 0, failed: 0, done: 0 }));
  return {
    online,
    draining,
    pending: counts.pending,
    failed: counts.failed,
    lastSyncAt,
    lastError,
  };
}

async function emitStatus(): Promise<void> {
  const status = await snapshotStatus();
  for (const l of listeners) l({ type: 'status', status });
}

function emit(event: SyncEvent): void {
  for (const l of listeners) l(event);
}

export const sync = {
  start(): () => void {
    const unsubNet = NetInfo.addEventListener((state) => {
      const wasOnline = online;
      online = !!state.isConnected && state.isInternetReachable !== false;
      setOnline(online);
      void emitStatus();
      if (!wasOnline && online) void sync.kick();
    });

    const appStateSub = AppState.addEventListener('change', (next) => {
      if (next === 'active') void sync.kick();
    });

    interval = setInterval(() => {
      if (online) void sync.kick();
    }, 60_000);

    // Initial probe
    NetInfo.fetch().then((state) => {
      online = !!state.isConnected && state.isInternetReachable !== false;
      setOnline(online);
      void emitStatus();
      if (online) void sync.kick();
    });

    return () => {
      unsubNet();
      appStateSub.remove();
      if (interval) clearInterval(interval);
      interval = null;
    };
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    void emitStatus();
    return () => {
      listeners.delete(listener);
    };
  },

  async kick(): Promise<void> {
    if (draining || !online) return;
    draining = true;
    void emitStatus();
    let ok = 0;
    let failed = 0;
    try {
      const rows = await outbox.pending(25);
      for (const row of rows) {
        try {
          await outbox.markUploading(row.id);
          await api._replay(row.endpoint, row.method, row.payload);
          await outbox.markDone(row.id);
          ok++;
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Unknown';
          await outbox.markFailed(row.id, message, row.retries);
          failed++;
        }
      }
      lastSyncAt = Date.now();
      if (ok > 0 || failed > 0) emit({ type: 'drained', ok, failed });
    } catch (e) {
      lastError = e instanceof Error ? e.message : 'Sync failed';
      emit({ type: 'error', message: lastError });
    } finally {
      draining = false;
      void emitStatus();
    }
  },

  async snapshot(): Promise<SyncStatus> {
    return snapshotStatus();
  },

  isOnline(): boolean {
    return online;
  },
};

// Helper: peek pending rows for the Sync Health screen
export async function peekOutbox(): Promise<OutboxRow[]> {
  return outbox.pending(50);
}
