
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
  ShoppingCart,
  Landmark,
  GanttChartSquare,
  LayoutDashboard,
  Settings,
  ListChecks,
  CalendarDays,
  Boxes,
  ConciergeBell,
  LifeBuoy,
} from "lucide-react";

// In a real application, this would come from an authentication context/provider.
// You can change this to 'member' to test the role-based visibility.
const userRole = 'admin'; // 'admin', 'owner', 'member'

const allLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Jobs", icon: GanttChartSquare },
  { href: "/dashboard/tasks", label: "Tasks", icon: ListChecks },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/employees", label: "Employees", icon: Briefcase, roles: ['admin', 'owner'] },
  { href: "/dashboard/estimates", label: "Quotes", icon: FileText },
  { href: "/dashboard/invoices", label: "Invoices", icon: Receipt },
  { href: "/dashboard/expenses", label: "Expenses", icon: DollarSign },
  { href: "/dashboard/documents", label: "Purchase Orders", icon: ShoppingCart },
  { href: "/dashboard/inventory", label: "Inventory", icon: Boxes },
  { href: "/dashboard/services", label: "Services", icon: ConciergeBell },
  { href: "/dashboard/ai-report", label: "Accounting", icon: Landmark },
  { href: "/dashboard/support", label: "Support", icon: LifeBuoy, roles: ['admin', 'owner'] },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ['admin', 'owner'] },
];

export function DashboardNav() {
  const pathname = usePathname();

  const links = allLinks.filter(link => {
    // If a link has no roles defined, it's visible to everyone.
    if (!link.roles) {
      return true;
    }
    // Otherwise, check if the user's role is included in the link's roles array.
    return link.roles.includes(userRole);
  });

  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(link.href) && (link.href !== '/dashboard' || pathname === '/dashboard')}
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
