import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r p-4 flex flex-col justify-between">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">CreatorPulse</h2>
          <nav className="space-y-2">
            <a href="/dashboard" className="block p-2 hover:bg-muted rounded">Dashboard</a>
            <a href="/dashboard/research" className="block p-2 hover:bg-muted rounded">Research</a>
            <a href="/dashboard/ai-coach" className="block p-2 hover:bg-muted rounded">AI Coach</a>
            <a href="/dashboard/settings" className="block p-2 hover:bg-muted rounded">Settings</a>
          </nav>
        </div>
        <div className="space-y-4 border-t pt-4">
          <OrganizationSwitcher afterCreateOrganizationUrl="/dashboard" />
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
