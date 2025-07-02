"use client";

import { useFormState, useFormStatus } from "react-dom";
import { getAiReport } from "./actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Bot, Loader2, Sparkles } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" /> Generate Report
        </>
      )}
    </Button>
  );
}

export default function AiReportPage() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(getAiReport, initialState);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>AI Progress Report Generator</CardTitle>
          <CardDescription>
            Enter the latest project updates below. Our AI will generate a
            concise progress summary and a one-sentence status update.
          </CardDescription>
        </CardHeader>
        <form action={dispatch}>
          <CardContent>
            <div className="grid w-full gap-2">
              <Label htmlFor="projectUpdates">Project Updates</Label>
              <Textarea
                id="projectUpdates"
                name="projectUpdates"
                placeholder="e.g., 'Foundation work completed. Started on exterior cladding, but we are facing a 3-day delay due to weather...'"
                rows={10}
                required
              />
              {state.errors?.projectUpdates && (
                <p className="text-sm text-destructive mt-1">
                  {state.errors.projectUpdates[0]}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot />
              Generated Summary
            </CardTitle>
            <CardDescription>
              A detailed summary based on your input.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state.summary ? (
              <p className="whitespace-pre-wrap">{state.summary}</p>
            ) : (
              <p className="text-muted-foreground">
                Your report summary will appear here.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Progress at a Glance</CardTitle>
            <CardDescription>A one-sentence status.</CardDescription>
          </CardHeader>
          <CardContent>
            {state.progress ? (
              <p className="font-semibold">{state.progress}</p>
            ) : (
              <p className="text-muted-foreground">
                Your short progress update will appear here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
