"use client"

import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"

// In a real application, this would come from an authentication context/provider.
const userRole = 'admin'; // 'admin', 'owner', or 'member'

export function DashboardHeader() {
  const router = useRouter()

  return (
    <header className="flex items-center justify-between p-4 bg-background border-b">
      <SidebarTrigger className="md:hidden" />
      <div className="hidden md:flex items-center gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 w-48 lg:w-64"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage
                  src="https://placehold.co/40x40.png"
                  alt="User"
                  data-ai-hint="user avatar"
                />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {['admin', 'owner'].includes(userRole) && (
              <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="cursor-pointer">
                Settings
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => window.location.href = 'mailto:support@sebenza.com'} className="cursor-pointer">
              Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/auth/login')} className="cursor-pointer">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
