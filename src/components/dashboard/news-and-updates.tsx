
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type NewsUpdate } from "@/lib/data";
import { format } from "date-fns";
import { Megaphone, ArrowRight } from "lucide-react";

interface NewsAndUpdatesProps {
  updates: NewsUpdate[];
}

const categoryVariant = (category: NewsUpdate['category']) => {
    switch (category) {
        case 'New Feature': return 'default';
        case 'Announcement': return 'destructive';
        case 'Tip': return 'secondary';
        default: return 'outline';
    }
}

export function NewsAndUpdates({ updates }: NewsAndUpdatesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            News & Updates
        </CardTitle>
        <CardDescription>Latest news and product announcements from the Sebenza team.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {updates.map(update => (
            <div key={update.id} className="p-3 border-l-4 rounded-r-lg bg-muted/50 border-primary">
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant={categoryVariant(update.category)}>{update.category}</Badge>
                        <p className="font-semibold mt-1">{update.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{format(update.date, "MMM d")}</p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{update.content}</p>
                {update.link && update.linkText && (
                    <Button variant="link" asChild className="p-0 h-auto mt-2 text-primary">
                        <Link href={update.link}>
                            {update.linkText} <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                )}
            </div>
        ))}
      </CardContent>
    </Card>
  )
}
