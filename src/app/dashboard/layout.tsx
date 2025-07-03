
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { DashboardNav } from "@/components/dashboard-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home } from "lucide-react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { QuickAddButton } from "@/components/quick-add-button";
import { LiveChatWidget } from "@/components/live-chat-widget";
import { WhatsAppWidget } from "@/components/whatsapp-widget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-primary-foreground"
          >
            <Home className="w-8 h-8 text-accent" />
            <h1 className="text-2xl font-semibold">SEBENZA</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <DashboardNav />
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2 p-4">
            <Avatar>
              <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold">Jane Doe</span>
              <span className="text-xs text-sidebar-foreground/70">
                Project Manager
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <DashboardHeader />
        <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
          <WhatsAppWidget />
          <LiveChatWidget />
          <QuickAddButton />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
