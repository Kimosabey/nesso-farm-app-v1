type Tone = 'pending' | 'success' | 'danger' | 'info' | 'muted' | 'accent';

const TONES: Record<Tone, string> = {
  pending: 'bg-warning/10 text-warning border-warning/30',
  success: 'bg-success/10 text-success border-success/30',
  danger: 'bg-danger/10 text-danger border-danger/30',
  info: 'bg-info/10 text-info border-info/30',
  muted: 'bg-fg-muted/10 text-fg-muted border-border-strong',
  accent: 'bg-accent/15 text-fg border-accent/40',
};

export function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: Tone;
}) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}
    >
      {label}
    </span>
  );
}

export function toneForSampleStatus(s: string): Tone {
  switch (s) {
    case 'Queue':
      return 'muted';
    case 'Sent':
    case 'Received':
    case 'Tested':
      return 'info';
    case 'Approved':
      return 'success';
    case 'Rejected':
      return 'danger';
    default:
      return 'muted';
  }
}

export function toneForAuditStatus(s: string): Tone {
  switch (s) {
    case 'Pending':
      return 'pending';
    case 'Approved':
      return 'success';
    case 'Rejected':
      return 'danger';
    default:
      return 'muted';
  }
}

export function toneForProcStatus(s: string): Tone {
  switch (s) {
    case 'Pending':
      return 'pending';
    case 'Completed':
      return 'success';
    case 'Cancelled':
      return 'muted';
    default:
      return 'muted';
  }
}

export function toneForPayStatus(s: string): Tone {
  switch (s) {
    case 'Paid':
      return 'success';
    case 'Partial':
      return 'pending';
    case 'Unpaid':
      return 'danger';
    default:
      return 'muted';
  }
}

export function toneForInventoryStatus(s: string): Tone {
  switch (s) {
    case 'AVAILABLE':
      return 'success';
    case 'PROCESSING':
      return 'info';
    case 'SOLD':
      return 'accent';
    case 'TRANSFERRED':
      return 'muted';
    default:
      return 'muted';
  }
}
