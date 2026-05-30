import { getDb } from './db';

export interface OutboxRow {
  id: string;
  clientRequestId: string;
  endpoint: string;
  method: string;
  payload: string; // JSON
  status: 'pending' | 'uploading' | 'done' | 'failed';
  retries: number;
  lastError: string | null;
  createdAt: number;
  nextAttemptAt: number;
}

export interface EnqueueInput {
  endpoint: string;
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  payload: unknown;
}

function uuid(): string {
  // RFC4122 v4 — good enough for clientRequestId
  // Using crypto.getRandomValues if available (React Native polyfills it via react-native-get-random-values; for now Math.random fallback is fine)
  const r = () => Math.floor(Math.random() * 0x100000000).toString(16).padStart(8, '0');
  return `${r()}-${r().slice(0, 4)}-4${r().slice(0, 3)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${r().slice(0, 3)}-${r()}${r().slice(0, 4)}`;
}

export const outbox = {
  async enqueue(input: EnqueueInput): Promise<string> {
    const db = await getDb();
    const id = uuid();
    const clientRequestId = uuid();
    const now = Date.now();
    await db.runAsync(
      `INSERT INTO mutation_outbox
       (id, clientRequestId, endpoint, method, payload, status, retries, createdAt, nextAttemptAt)
       VALUES (?, ?, ?, ?, ?, 'pending', 0, ?, ?)`,
      id,
      clientRequestId,
      input.endpoint,
      input.method,
      JSON.stringify({ ...(input.payload as Record<string, unknown>), clientRequestId }),
      now,
      now,
    );
    return id;
  },

  async pending(limit = 25): Promise<OutboxRow[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<OutboxRow>(
      `SELECT * FROM mutation_outbox
        WHERE status IN ('pending','failed')
          AND nextAttemptAt <= ?
        ORDER BY createdAt ASC
        LIMIT ?`,
      Date.now(),
      limit,
    );
    return rows;
  },

  async counts(): Promise<{ pending: number; failed: number; done: number }> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ status: string; n: number }>(
      `SELECT status, COUNT(*) as n FROM mutation_outbox GROUP BY status`,
    );
    const out = { pending: 0, failed: 0, done: 0 };
    for (const r of rows) {
      if (r.status === 'pending') out.pending = r.n;
      else if (r.status === 'failed') out.failed = r.n;
      else if (r.status === 'done') out.done = r.n;
    }
    return out;
  },

  async markUploading(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync(`UPDATE mutation_outbox SET status = 'uploading' WHERE id = ?`, id);
  },

  async markDone(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync(`UPDATE mutation_outbox SET status = 'done', lastError = NULL WHERE id = ?`, id);
    // Garbage-collect older rows so the table doesn't grow unbounded
    await db.runAsync(
      `DELETE FROM mutation_outbox WHERE status = 'done' AND createdAt < ?`,
      Date.now() - 24 * 60 * 60 * 1000,
    );
  },

  async markFailed(id: string, error: string, retries: number): Promise<void> {
    const db = await getDb();
    // Exponential backoff: 5s, 15s, 1m, 5m, 30m, 4h cap
    const delays = [5000, 15_000, 60_000, 5 * 60_000, 30 * 60_000, 4 * 60 * 60_000];
    const next = Date.now() + delays[Math.min(retries, delays.length - 1)];
    await db.runAsync(
      `UPDATE mutation_outbox
         SET status = 'failed', retries = retries + 1, lastError = ?, nextAttemptAt = ?
       WHERE id = ?`,
      error,
      next,
      id,
    );
  },

  async clearAll(): Promise<void> {
    const db = await getDb();
    await db.runAsync(`DELETE FROM mutation_outbox`);
  },
};
