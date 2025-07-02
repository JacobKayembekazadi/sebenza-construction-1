import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Bot, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { projects } from "@/lib/data";

export default function DashboardPage() {
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);

  const statusVariant = (status: string) => {
    switch (status) {
      case "On Track":
        return "default";
      case "At Risk":
        return "secondary";
      case "Off Track":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Active Projects</CardTitle>
          <CardDescription>Total number of ongoing projects.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{projects.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tasks In Progress</CardTitle>
          <CardDescription>
            Tasks currently being worked on across all projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            {projects.flatMap((p) => p.tasks).filter((t) => t.status === "In Progress").length}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Budget Status</CardTitle>
          <CardDescription>
            Total budget vs. amount spent so far.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            ${(totalSpent / 1000000).toFixed(1)}M / ${(totalBudget / 1000000).toFixed(1)}M
          </div>
          <Progress value={(totalSpent / totalBudget) * 100} className="mt-2" />
        </CardContent>
      </Card>
      <Card className="col-span-1 md:col-span-2 lg:col-span-1 bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot /> AI Progress Report
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Generate project summaries with AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/ai-report">
            <Button variant="secondary" className="w-full">
              Generate Report <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>
            An overview of the most recently updated projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead className="text-right">Budget Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.slice(0, 4).map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="font-medium hover:underline"
                    >
                      {project.name}
                    </Link>
                    <div className="text-sm text-muted-foreground">
                      {project.manager}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(project.status)}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-right">{project.completion}%</span>
                      <Progress value={project.completion} className="flex-1" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    ${project.spent.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
