import { Card } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="inline-block bg-border text-surface text-[11px] font-bold tracking-[0.12em] uppercase px-[14px] py-[5px] rounded-[2px] mb-4">
          OVERVIEW
        </div>
        <h1 className="text-5xl md:text-[72px] leading-none">Dashboard</h1>
      </div>
      
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card headerColor="var(--color-primary)" className="bg-pastel-yellow md:col-span-2">
          <h3 className="text-[28px] mb-2 uppercase">Total Leads</h3>
          <p className="font-heading text-[72px] font-black leading-none">142</p>
        </Card>
        
        <Card headerColor="var(--color-success)" className="bg-border text-surface">
          <h3 className="text-[28px] mb-2 uppercase">MRR</h3>
          <p className="font-heading text-[72px] text-primary font-black leading-none">$2.4k</p>
        </Card>
        
        <Card headerColor="var(--color-secondary)" className="bg-pastel-cyan">
          <h3 className="text-[28px] mb-2 uppercase">Agent Runs</h3>
          <p className="font-heading text-[72px] font-black leading-none">12</p>
        </Card>
      </div>
    </div>
  );
}
