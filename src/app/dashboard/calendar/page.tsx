
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  PlusCircle,
  Briefcase,
  ListChecks,
  Receipt,
  Users,
  Edit,
  Trash2,
  Calendar as CalendarIcon
} from "lucide-react";
import { allEvents as initialEvents, type UnifiedEvent, type CustomEvent, employees } from "@/lib/data";
import { AddEditEventDialog, type EventFormValues } from "@/components/add-edit-event-dialog";
import { DeleteEventDialog } from "@/components/delete-event-dialog";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const eventTypeConfig = {
  project: { icon: Briefcase, color: "border-chart-3", label: "Job Deadline" },
  task: { icon: ListChecks, color: "border-chart-1", label: "Task Due" },
  invoice: { icon: Receipt, color: "border-chart-2", label: "Invoice Due" },
  custom: { icon: Users, color: "border-chart-4", label: "Meeting" },
};

export default function CalendarPage() {
  const [events, setEvents] = useState<UnifiedEvent[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [eventToEdit, setEventToEdit] = useState<CustomEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<CustomEvent | null>(null);
  
  const { toast } = useToast();

  const modifiers = useMemo(() => {
    return {
      project: events.filter(e => e.type === 'project').map(e => e.date),
      task: events.filter(e => e.type === 'task').map(e => e.date),
      invoice: events.filter(e => e.type === 'invoice').map(e => e.date),
      custom: events.filter(e => e.type === 'custom').map(e => e.date),
    };
  }, [events]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events
      .filter(event => isSameDay(event.date, selectedDate))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [selectedDate, events]);
  
  const handleOpenAddDialog = () => {
    setEventToEdit(null);
    setIsAddEditDialogOpen(true);
  };
  
  const handleOpenEditDialog = (event: UnifiedEvent) => {
    if (event.type === 'custom' && event.raw) {
      setEventToEdit(event.raw as CustomEvent);
      setIsAddEditDialogOpen(true);
    }
  };

  const handleOpenDeleteDialog = (event: UnifiedEvent) => {
    if (event.type === 'custom' && event.raw) {
      setEventToDelete(event.raw as CustomEvent);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleSaveEvent = (data: EventFormValues, eventId?: string) => {
    if (eventId) {
      // Logic to update an event
      const updatedEvents = events.map(e => {
        if (e.id === eventId && e.type === 'custom') {
          return {
            ...e,
            title: data.title,
            date: data.startDate, // Assuming events are single-day for now
            raw: { ...e.raw, ...data, startDate: data.startDate, endDate: data.endDate }
          };
        }
        return e;
      });
      setEvents(updatedEvents);
      toast({ title: "Event Updated", description: "Your event has been successfully updated." });
    } else {
      // Logic to add a new event
      const newEvent: CustomEvent = {
        id: `custom-${Date.now()}`,
        type: 'custom',
        ...data
      };
      const newUnifiedEvent: UnifiedEvent = {
        id: newEvent.id,
        title: newEvent.title,
        date: newEvent.startDate,
        type: 'custom',
        isCustom: true,
        raw: newEvent
      }
      setEvents([...events, newUnifiedEvent]);
      toast({ title: "Event Created", description: "Your new event has been added to the calendar." });
    }
  };

  const handleDeleteEvent = () => {
    if (eventToDelete) {
      setEvents(events.filter(e => e.id !== eventToDelete.id));
      toast({ title: "Event Deleted", variant: "destructive", description: "Your event has been deleted." });
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };


  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">
              A unified view of all deadlines and events.
            </p>
          </div>
          <Button onClick={handleOpenAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <Card className="lg:col-span-2">
                 <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="p-0"
                    modifiers={modifiers}
                    modifiersClassNames={{
                        project: "border-chart-3 border-2 rounded-full",
                        task: "border-chart-1 border-2 rounded-full",
                        invoice: "border-chart-2 border-2 rounded-full",
                        custom: "border-chart-4 border-2 rounded-full",
                    }}
                />
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>
                        Schedule for {selectedDate ? format(selectedDate, "PPP") : '...'}
                    </CardTitle>
                    <CardDescription>
                        {selectedDayEvents.length} event(s) for this day.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
                    {selectedDayEvents.length > 0 ? (
                        selectedDayEvents.map(event => {
                            const config = eventTypeConfig[event.type];
                            const Icon = config.icon;
                            return (
                                <div key={event.id} className={cn("p-3 rounded-lg border-l-4 flex items-start justify-between gap-2", config.color)}>
                                    <div className="flex items-start gap-3">
                                        <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                        <div>
                                            <p className="font-semibold">{event.title}</p>
                                            <p className="text-sm text-muted-foreground">{config.label}</p>
                                            {event.link && (
                                                <Link href={event.link} className="text-xs text-primary hover:underline">
                                                    View Details &rarr;
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    {event.isCustom && (
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEditDialog(event)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleOpenDeleteDialog(event)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center h-48 border-2 border-dashed rounded-lg">
                            <CalendarIcon className="w-12 h-12 text-muted-foreground" />
                            <p className="mt-4 text-muted-foreground">No events scheduled for this day.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

      </div>
      
      <AddEditEventDialog
        open={isAddEditDialogOpen}
        onOpenChange={setIsAddEditDialogOpen}
        onSave={handleSaveEvent}
        event={eventToEdit}
      />
      
      <DeleteEventDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteEvent}
        event={eventToDelete}
      />
    </>
  );
}
