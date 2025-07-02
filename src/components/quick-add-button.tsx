"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Plus, ListChecks, DollarSign, BookText } from "lucide-react"

export function QuickAddButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" className="rounded-full h-14 w-14 shadow-lg">
            <Plus className="h-6 w-6" />
            <span className="sr-only">Quick Add</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-56">
          <DropdownMenuLabel>Quick Add</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <ListChecks className="mr-2 h-4 w-4" />
            <span>New Task</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <DollarSign className="mr-2 h-4 w-4" />
            <span>New Expense</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BookText className="mr-2 h-4 w-4" />
            <span>New Log</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
