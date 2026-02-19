import { AppSidebar, MobileBottomNav } from "@/components/AppSidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
