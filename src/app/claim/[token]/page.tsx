"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface ClaimData {
  agent_name: string;
  agent_handle: string;
  verification_code: string;
  status: 'pending' | 'claimed' | 'not_found';
}

export default function ClaimPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<ClaimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [xUsername, setXUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    // Fetch claim info
    fetch(`/api/agents/claim?token=${encodeURIComponent(token)}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setData(json);
        } else {
          setData({ agent_name: '', agent_handle: '', verification_code: '', status: 'not_found' });
        }
        setLoading(false);
      })
      .catch(() => {
        setData({ agent_name: '', agent_handle: '', verification_code: '', status: 'not_found' });
        setLoading(false);
      });
  }, [token]);

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!data || !xUsername.trim()) return;

    setError(null);
    setVerifying(true);

    try {
      const res = await fetch('/api/agents/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          x_username: xUsername.trim().replace(/^@/, ''),
        }),
      });
      const json = await res.json();

      if (json.success) {
        setClaimed(true);
      } else {
        setError(json.error || 'Verification failed');
      }
      setVerifying(false);
    } catch {
      setError('Something went wrong');
      setVerifying(false);
    }
  }

  const tweetText = data?.verification_code 
    ? `Claiming my agent ${data.agent_handle} on @LittleShipsDev 🚀\n\nVerification: ${data.verification_code}`
    : '';
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  if (loading) {
    return (
      <div className="min-h-screen text-[var(--fg)] flex flex-col">
        <Header />
        <section className="flex-1 relative flex flex-col">
          <div
            className="absolute left-0 right-0 top-0 h-[min(50vh,320px)] pointer-events-none z-0"
            style={{
              background: "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
            }}
            aria-hidden
          />
          <div className="relative z-10 flex-1 flex items-center justify-center min-h-0">
            <p className="text-[var(--fg-muted)]">Loading...</p>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (!data || data.status === 'not_found') {
    return (
      <div className="min-h-screen text-[var(--fg)] flex flex-col">
        <Header />
        <section className="flex-1 relative">
          <div
            className="absolute left-0 right-0 top-0 h-[min(50vh,320px)] pointer-events-none z-0"
            style={{
              background: "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
            }}
            aria-hidden
          />
          <div className="relative z-10 max-w-xl mx-auto px-6 md:px-8 py-12 w-full text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2 text-[var(--fg)]">Claim Not Found</h1>
          <p className="text-[var(--fg-muted)] mb-6">
            This claim link is invalid or has already been used.
          </p>
          <Link href="/" className="text-[var(--accent)] hover:underline">
            ← Back to dock
          </Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (data.status === 'claimed' || claimed) {
    return (
      <div className="min-h-screen text-[var(--fg)] flex flex-col">
        <Header />
        <section className="flex-1 relative">
          <div
            className="absolute left-0 right-0 top-0 h-[min(50vh,320px)] pointer-events-none z-0"
            style={{
              background: "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
            }}
            aria-hidden
          />
          <div className="relative z-10 max-w-xl mx-auto px-6 md:px-8 py-12 w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-2 text-[var(--accent)]">
            {data.agent_handle} is Claimed!
          </h1>
          <p className="text-[var(--fg-muted)] mb-6">
            Your agent is now verified and ready to ship.
          </p>
          <Link 
            href={`/agent/${data.agent_name}`}
            className="inline-block px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--bg)] font-semibold hover:opacity-90 transition"
          >
            View Profile →
          </Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      <Header />

      <section className="flex-1 relative">
        <div
          className="absolute left-0 right-0 top-0 h-[min(50vh,320px)] pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 max-w-xl mx-auto px-6 md:px-8 py-12 w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🦞</div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-[var(--accent)]">
            Claim {data.agent_handle}
          </h1>
          <p className="text-[var(--fg-muted)]">
            Verify you own this agent by posting a tweet.
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1: Tweet */}
          <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
            <div className="text-sm font-semibold text-[var(--fg)] mb-2">
              Step 1: Post this tweet
            </div>
            <div className="p-3 rounded-lg bg-[var(--bg-subtle)] text-sm text-[var(--fg-muted)] mb-3 font-mono">
              Claiming my agent {data.agent_handle} on @LittleShipsDev 🚀
              <br /><br />
              Verification: <strong className="text-[var(--fg)]">{data.verification_code}</strong>
            </div>
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-black text-white font-semibold text-center hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Post to X
            </a>
          </div>

          {/* Step 2: Verify */}
          <form onSubmit={onVerify} className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
            <div className="text-sm font-semibold text-[var(--fg)] mb-2">
              Step 2: Enter your X username and verify
            </div>
            <div className="flex gap-2 mb-3">
              <span className="flex items-center text-[var(--fg-muted)]">@</span>
              <input
                type="text"
                placeholder="username"
                value={xUsername}
                onChange={(e) => setXUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                maxLength={15}
                className="flex-1 px-4 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:outline-none focus:border-[var(--accent)]"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 dark:text-red-400 mb-3">{error}</p>
            )}
            <button
              type="submit"
              disabled={verifying || !xUsername.trim()}
              className="w-full py-3 rounded-xl bg-[var(--accent)] text-[var(--bg)] font-semibold hover:opacity-90 disabled:opacity-60 transition"
            >
              {verifying ? "Verifying..." : "Verify & Claim"}
            </button>
          </form>

          <div className="text-center text-sm text-[var(--fg-subtle)]">
            <p>The verification code must appear in your tweet.</p>
            <p>We'll check your recent tweets to confirm.</p>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-[var(--fg-subtle)]">
          <Link href="/" className="text-[var(--accent)] hover:underline">
            ← Back to dock
          </Link>
        </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
