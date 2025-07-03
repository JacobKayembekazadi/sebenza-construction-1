
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Employee } from "@/lib/data";
import { Label } from "./ui/label";

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (employeeId: string) => void;
  allEmployees: Employee[];
  currentTeam: Employee[];
}

export function AddTeamMemberDialog({
  open,
  onOpenChange,
  onAdd,
  allEmployees,
  currentTeam,
}: AddTeamMemberDialogProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  const availableEmployees = useMemo(() => {
    const currentTeamIds = new Set(currentTeam.map(m => m.id));
    return allEmployees.filter(e => !currentTeamIds.has(e.id));
  }, [allEmployees, currentTeam]);

  const handleAdd = () => {
    if (selectedEmployeeId) {
      onAdd(selectedEmployeeId);
      onOpenChange(false);
      setSelectedEmployeeId("");
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
      if(!isOpen) {
          setSelectedEmployeeId("");
      }
      onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Select an employee to add to this project team.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
            <Label htmlFor="employee-select">Employee</Label>
             <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger id="employee-select">
                    <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                    {availableEmployees.length > 0 ? (
                        availableEmployees.map(e => (
                            <SelectItem key={e.id} value={e.id}>{e.name} ({e.role})</SelectItem>
                        ))
                    ) : (
                        <SelectItem value="none" disabled>No available employees</SelectItem>
                    )}
                </SelectContent>
            </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={handleAdd} disabled={!selectedEmployeeId || selectedEmployeeId === 'none'}>Add Member</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
