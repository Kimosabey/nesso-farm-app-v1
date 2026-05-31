import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { fetchTrace } from '@/lib/trace';
import { PortalHeader, PortalFooter } from '@/components/PortalChrome';

export const revalidate = 300; // 5 min ISR

interface RawPageProps {
  params: Promise<{ locale: string; code: string }>;
}

export async function generateMetadata({ params }: RawPageProps): Promise<Metadata> {
  const { code } = await params;
  return { title: `Raw trace · ${code}` };
}

const KEY = '#5DB683';
const STR = '#F8E353';
const NUM = '#67E8F9';

type Token = { text: string; color?: string };

/** Tokenize formatted JSON into colored spans (keys / strings / numbers / literals). */
function highlight(json: string): Token[] {
  const tokens: Token[] = [];
  // Match strings (with optional trailing colon → key), numbers, and literals.
  const re = /("(?:\\.|[^"\\])*")(\s*:)?|(\b-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(\btrue\b|\bfalse\b|\bnull\b)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(json)) !== null) {
    if (m.index > last) tokens.push({ text: json.slice(last, m.index) });
    if (m[1] !== undefined) {
      // String — a key if followed by a colon.
      tokens.push({ text: m[1], color: m[2] !== undefined ? KEY : STR });
      if (m[2] !== undefined) tokens.push({ text: m[2] });
    } else if (m[3] !== undefined) {
      tokens.push({ text: m[3], color: NUM });
    } else if (m[4] !== undefined) {
      tokens.push({ text: m[4], color: NUM });
    }
    last = re.lastIndex;
  }
  if (last < json.length) tokens.push({ text: json.slice(last) });
  return tokens;
}

export default async function RawTracePage({ params }: RawPageProps) {
  const { locale, code } = await params;
  const trace = await fetchTrace(code);
  if (!trace) notFound();

  const json = JSON.stringify(trace, null, 2);
  const tokens = highlight(json);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <PortalHeader locale={locale} />

      <main className="mx-auto max-w-[880px] px-4 pb-20 pt-8 sm:px-6">
        <Link
          href={`/${locale}/t/${code}`}
          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-fg-muted transition hover:text-fg"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to trace
        </Link>

        <h1 className="mt-4 font-display text-2xl font-bold tracking-[-0.02em]">
          Raw trace · <span className="font-mono text-xl">{code}</span>
        </h1>
        <p className="mt-2 text-sm text-fg-muted">
          Machine-readable record for{' '}
          <span className="font-mono">GET /api/v1/public/trace/{code}</span> · for buyers &amp;
          integrators.
        </p>

        <div
          className="mt-5 max-h-[70vh] overflow-auto rounded-[14px] border p-5"
          style={{ background: '#0c1610', borderColor: '#1e2c24' }}
        >
          <pre className="font-mono text-[12.5px] leading-[1.7]" style={{ color: '#a8b7ae' }}>
            {tokens.map((t, i) =>
              t.color ? (
                <span key={i} style={{ color: t.color }}>
                  {t.text}
                </span>
              ) : (
                <span key={i}>{t.text}</span>
              ),
            )}
          </pre>
        </div>
      </main>

      <PortalFooter locale={locale} />
    </div>
  );
}
