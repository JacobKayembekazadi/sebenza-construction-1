"use client"

import { type Activity } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FileCheck2, CreditCard, ListChecks, AlertTriangle, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface RecentActivityFeedProps {
  activities: Activity[]
}

const activityConfig = {
  TASK_ADDED: { icon: <ListChecks className="h-4 w-4" />, color: "bg-primary" },
  INVOICE_PAID: { icon: <CreditCard className="h-4 w-4" />, color: "bg-chart-3" },
  FILE_UPLOADED: { icon: <FileCheck2 className="h-4 w-4" />, color: "bg-secondary" },
  PROJECT_STATUS: { icon: <AlertTriangle className="h-4 w-4" />, color: "bg-accent" },
  CLIENT_COMMENT: { icon: <MessageSquare className="h-4 w-4" />, color: "bg-chart-5" },
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className={cn("text-primary-foreground", activityConfig[activity.type]?.color)}>
                  {activityConfig[activity.type]?.icon}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {activity.user} &middot; {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
