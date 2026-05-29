'use client';

import { useState, useTransition } from 'react';
import { approveFarmerAction, rejectFarmerAction } from './actions';

export function ApprovalActions({ farmerId }: { farmerId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');

  function approve() {
    setError(null);
    startTransition(async () => {
      const r = await approveFarmerAction(farmerId);
      if (!r.ok) setError(r.error ?? 'Failed');
    });
  }

  function reject() {
    setError(null);
    startTransition(async () => {
      const r = await rejectFarmerAction(farmerId, reason);
      if (!r.ok) setError(r.error ?? 'Failed');
      else {
        setReason('');
        setShowReject(false);
      }
    });
  }

  return (
    <div>
      {!showReject ? (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={approve}
            disabled={pending}
            className="h-9 rounded-md bg-success px-4 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          >
            {pending ? 'Approving…' : 'Approve'}
          </button>
          <button
            onClick={() => setShowReject(true)}
            disabled={pending}
            className="h-9 rounded-md border border-danger px-4 text-sm font-medium text-danger transition hover:bg-danger/10 disabled:opacity-60"
          >
            Reject…
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-start gap-2">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection"
            disabled={pending}
            className="h-9 flex-1 min-w-[200px] rounded-md border border-danger/40 bg-bg-elevated px-3 text-sm text-fg outline-none focus:border-danger focus:ring-2 focus:ring-danger/30"
          />
          <button
            onClick={reject}
            disabled={pending || reason.trim().length < 3}
            className="h-9 rounded-md bg-danger px-4 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          >
            {pending ? 'Rejecting…' : 'Confirm reject'}
          </button>
          <button
            onClick={() => {
              setShowReject(false);
              setReason('');
              setError(null);
            }}
            disabled={pending}
            className="h-9 rounded-md border border-border-strong px-3 text-sm text-fg hover:bg-bg-muted"
          >
            Cancel
          </button>
        </div>
      )}

      {error ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
