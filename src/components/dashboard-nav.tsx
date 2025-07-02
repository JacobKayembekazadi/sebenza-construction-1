"use client";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Users,
  FileText,
  DollarSign,
  Receipt,
  Truck,
  FileBox,
  Bot,
  GanttChartSquare,
  LayoutDashboard,
  Settings,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Projects", icon: GanttChartSquare },
  { href: "/dashboard/tasks", label: "Tasks", icon: Briefcase },
  { href: "/dashboard/ai-report", label: "AI Progress Report", icon: Bot },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/estimates", label: "Estimates", icon: FileText },
  { href: "/dashboard/invoices", label: "Invoices", icon: Receipt },
  { href: "/dashboard/expenses", label: "Expenses", icon: DollarSign },
  { href: "/dashboard/documents", label: "Documents", icon: FileBox },
  { href: "/dashboard/employees", label: "Employees", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === link.href}
            tooltip={link.label}
          >
            <Link href={link.href}>
              <link.icon />
              <span>{link.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
