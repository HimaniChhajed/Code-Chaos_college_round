'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [devEmail, setDevEmail] = useState('owner@nexus.demo');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleDevLogin(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/dev/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: devEmail }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Dev login failed');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Network error');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center mb-8">
          <div className="inline-block bg-primary border-[3px] border-border rounded-[4px] px-6 py-2 shadow-[4px_4px_0_0_#0A0A0A] mb-4">
            <h1 className="text-5xl font-black">NEXUS</h1>
          </div>
        </div>

        {/* Main Sign In */}
        <Card>
          <div className="mb-6">
            <div className="inline-block bg-border text-surface text-[11px] font-bold tracking-[0.12em] uppercase px-[14px] py-[5px] rounded-[2px] mb-4">
              WELCOME BACK
            </div>
            <h2 className="text-[28px] leading-none">Sign In</h2>
          </div>
          <form className="space-y-6">
            <div>
              <label className="block font-heading text-[12px] font-bold tracking-[0.1em] uppercase text-muted mb-2">Email</label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="button" className="w-full">Send Magic Link</Button>
          </form>
        </Card>

        {/* Dev Login (only shown in dev) */}
        <Card className="bg-pastel-yellow">
          <div className="mb-4">
            <div className="inline-block bg-error text-surface text-[11px] font-bold tracking-[0.12em] uppercase px-[14px] py-[5px] rounded-[2px] mb-3">
              DEV ONLY
            </div>
            <h3 className="text-xl">Quick Login</h3>
          </div>
          <form onSubmit={handleDevLogin} className="space-y-4">
            <div>
              <label className="block font-heading text-[12px] font-bold tracking-[0.1em] uppercase text-muted mb-2">Seeded User</label>
              <select
                className="w-full bg-surface border-[3px] border-border rounded-[4px] px-4 py-3 font-body text-text"
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
              >
                <option value="owner@nexus.demo">Owner (Alex)</option>
                <option value="admin@nexus.demo">Admin (Beth)</option>
                <option value="marketer@nexus.demo">Marketer (Chris)</option>
                <option value="sales@nexus.demo">Sales (Dana)</option>
                <option value="viewer@nexus.demo">Viewer (Eve)</option>
              </select>
            </div>
            {error && (
              <div className="border-[3px] border-error bg-surface p-3">
                <p className="text-error font-heading text-sm uppercase font-bold">{error}</p>
              </div>
            )}
            {message && (
              <div className="border-[3px] border-success bg-surface p-3">
                <p className="text-success font-heading text-sm uppercase font-bold">{message}</p>
              </div>
            )}
            <Button type="submit" variant="dark" className="w-full">Dev Sign In →</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
