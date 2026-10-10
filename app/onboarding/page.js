'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug: slug.toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Failed to create workspace');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Network error');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-primary border-[3px] border-border rounded-[4px] px-6 py-2 shadow-[4px_4px_0_0_#0A0A0A] mb-4">
            <h1 className="text-5xl font-black">NEXUS</h1>
          </div>
        </div>
        <Card>
          <div className="mb-6">
            <div className="inline-block bg-border text-surface text-[11px] font-bold tracking-[0.12em] uppercase px-[14px] py-[5px] rounded-[2px] mb-4">
              GET STARTED
            </div>
            <h2 className="text-[28px] leading-tight">Create Your Workspace</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-heading text-[12px] font-bold tracking-[0.1em] uppercase text-muted mb-2">Workspace Name</label>
              <Input
                type="text"
                placeholder="My Business"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-heading text-[12px] font-bold tracking-[0.1em] uppercase text-muted mb-2">Slug</label>
              <Input
                type="text"
                placeholder="my-business"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                required
              />
              <p className="text-muted text-sm mt-1 font-mono">3-40 chars, lowercase, hyphens OK</p>
            </div>
            {error && (
              <div className="border-[3px] border-error bg-surface p-3">
                <p className="text-error font-heading text-sm uppercase font-bold">{error}</p>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '...' : 'Create Workspace'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
