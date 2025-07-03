
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { employees } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export default function SettingsPage() {
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Profile state
  const [name, setName] = useState("Jane Doe");
  const [email, setEmail] = useState("jane.doe@example.com");

  // Notifications state
  const [taskUpdates, setTaskUpdates] = useState(true);
  const [clientMessages, setClientMessages] = useState(true);
  const [projectMilestones, setProjectMilestones] = useState(false);

  // Subscription state
  const [userLimit, setUserLimit] = useState(10);
  const [pendingUserLimit, setPendingUserLimit] = useState(userLimit);
  const currentUserCount = employees.length;

  const handlePlanUpdate = () => {
    setUserLimit(pendingUserLimit);
    toast({
      title: "Plan Updated",
      description: `Your user limit is now ${pendingUserLimit}.`,
    });
  };
  
  if (!isClient) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Skeleton className="h-10 w-96" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-28" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings, subscription, and notification preferences.
        </p>
      </div>
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Make changes to your public information here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Loading..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                   placeholder="Loading..."
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                Manage your billing and subscription plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>Pro Plan</CardTitle>
                            <CardDescription>
                                Your plan renews on July 31, 2024.
                            </CardDescription>
                        </div>
                        <div className="text-3xl font-bold">${userLimit * 10}<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Users</span>
                                <span>{currentUserCount} / {userLimit}</span>
                            </div>
                            <Progress value={(currentUserCount / userLimit) * 100} />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Manage Plan</CardTitle>
                        <CardDescription>
                            Adjust the number of users for your team. You will be billed for the updated amount on your next cycle.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between gap-4">
                            <Slider
                                value={[pendingUserLimit]}
                                min={currentUserCount > 1 ? currentUserCount : 1}
                                max={100}
                                step={1}
                                onValueChange={(value) => setPendingUserLimit(value[0])}
                            />
                            <div className="text-xl font-bold w-24 text-center p-2 rounded-md bg-muted">
                                {pendingUserLimit}
                            </div>
                        </div>
                    </CardContent>
                     <CardFooter className="justify-end">
                        <Button onClick={handlePlanUpdate} disabled={pendingUserLimit === userLimit}>Update Plan</Button>
                    </CardFooter>
                </Card>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Choose what you want to be notified about.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="task-updates" 
                  checked={taskUpdates} 
                  onCheckedChange={(checked) => setTaskUpdates(Boolean(checked))}
                />
                <Label htmlFor="task-updates">Task Updates</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="client-messages"
                  checked={clientMessages}
                  onCheckedChange={(checked) => setClientMessages(Boolean(checked))}
                />
                <Label htmlFor="client-messages">New Client Messages</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="project-milestones"
                  checked={projectMilestones}
                  onCheckedChange={(checked) => setProjectMilestones(Boolean(checked))}
                />
                <Label htmlFor="project-milestones">Project Milestones</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
