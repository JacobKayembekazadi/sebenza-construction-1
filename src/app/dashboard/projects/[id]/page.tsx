
'use client';

import { useState, useMemo } from "react";
import { projects as initialProjects, employees as allEmployees, invoices as allInvoices, expenses as allExpenses, type Task, type Project, type Employee, type Document } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { GanttChart } from "@/components/gantt-chart";
import { TaskList } from "@/components/task-list";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users2, PiggyBank, FolderArchive, DollarSign, Receipt, MoreHorizontal, Download, Trash2, UserPlus, FileUp } from "lucide-react";
import { AddEditTaskDialog, type TaskFormValues } from "@/components/add-edit-task-dialog";
import { DeleteTaskDialog } from "@/components/delete-task-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { AddTeamMemberDialog } from "@/components/add-team-member-dialog";
import { DeleteTeamMemberDialog } from "@/components/delete-team-member-dialog";
import { AddProjectDocumentDialog, type DocumentFormValues } from "@/components/add-project-document-dialog";
import { DeleteProjectDocumentDialog } from "@/components/delete-project-document-dialog";

// A helper function to find project, could be in a lib file
const findProject = (id: string): Project | undefined => {
    // In a real app, this would be an API call.
    // For now, we find it in the mock data.
    return initialProjects.find((p) => p.id === id);
}

function MiniTable({ icon, title, items, columns, renderRow }: { icon: React.ReactNode, title: string, items: any[], columns: string[], renderRow: (item: any) => React.ReactNode}) {
    if (items.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
                {React.cloneElement(icon as React.ReactElement, { className: "w-12 h-12 text-muted-foreground" })}
                <p className="mt-4 text-muted-foreground">No {title.toLowerCase()} found for this project.</p>
            </div>
        )
    }
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {columns.map(col => <TableHead key={col}>{col}</TableHead>)}
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map(item => (
                    <TableRow key={item.id}>
                        {renderRow(item)}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  // We use state for the project to make it reactive to changes
  const [project] = useState(() => findProject(params.id));
  const [tasks, setTasks] = useState<Task[]>(project?.tasks || []);
  const [team, setTeam] = useState<Employee[]>(project?.team || []);
  const [documents, setDocuments] = useState<Document[]>(project?.documents || []);

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [isAddTeamMemberDialogOpen, setIsAddTeamMemberDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Employee | null>(null);

  const [isAddDocumentDialogOpen, setIsAddDocumentDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  const { toast } = useToast();

  const projectInvoices = useMemo(() => allInvoices.filter(i => i.projectId === project?.id), [project?.id]);
  const projectExpenses = useMemo(() => allExpenses.filter(e => e.projectId === project?.id), [project?.id]);
  
  if (!project) {
    notFound();
  }

  // Task Handlers
  const handleOpenAddDialog = () => {
    setSelectedTask(null);
    setIsAddEditDialogOpen(true);
  };
  const handleOpenEditDialog = (task: Task) => {
    setSelectedTask(task);
    setIsAddEditDialogOpen(true);
  };
  const handleOpenDeleteDialog = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };
  const handleSaveTask = (data: TaskFormValues, taskId?: string) => {
    const assignee = allEmployees.find(e => e.name === data.assigneeName);
    if (!assignee) return;

    if (taskId) {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, ...data, assignee } : t));
      toast({ title: "Task Updated" });
    } else {
      const newTask: Task = { id: `task-${Date.now()}`, dependencies: [], ...data, assignee };
      setTasks([newTask, ...tasks]);
      toast({ title: "Task Created" });
    }
  };
  const handleDeleteTask = () => {
    if (selectedTask) {
      setTasks(tasks.filter(t => t.id !== selectedTask.id));
      setIsDeleteDialogOpen(false);
      setSelectedTask(null);
      toast({ title: "Task Deleted", variant: "destructive" });
    }
  };

  // Team Handlers
  const handleAddTeamMember = (employeeId: string) => {
    const employeeToAdd = allEmployees.find(e => e.id === employeeId);
    if (employeeToAdd && !team.some(member => member.id === employeeId)) {
        setTeam([...team, employeeToAdd]);
        toast({ title: "Team Member Added", description: `${employeeToAdd.name} has been added to the project.` });
    }
  };
  const handleRemoveTeamMember = () => {
    if (memberToRemove) {
      setTeam(team.filter(member => member.id !== memberToRemove.id));
      setMemberToRemove(null);
      toast({ title: "Team Member Removed", variant: "destructive", description: `${memberToRemove.name} has been removed from the project.` });
    }
  };

  // Document Handlers
  const handleSaveDocument = (data: DocumentFormValues) => {
      const newDocument: Document = {
          id: `doc-${Date.now()}`,
          name: data.name,
          type: data.type,
          uploadDate: new Date(),
          projectId: project.id,
          projectName: project.name,
          url: '#'
      };
      setDocuments([newDocument, ...documents]);
      toast({ title: "Document Uploaded", description: `"${data.name}" has been added.`});
  };
  const handleDeleteDocument = () => {
      if(documentToDelete) {
          setDocuments(documents.filter(doc => doc.id !== documentToDelete.id));
          toast({ title: "Document Deleted", variant: "destructive" });
          setDocumentToDelete(null);
      }
  };
  
  const statusVariant = (status: string): 'green' | 'yellow' | 'destructive' | 'outline' => {
    switch (status) {
      case "On Track": return "green";
      case "At Risk": return "yellow";
      case "Off Track": return "destructive";
      default: return "outline";
    }
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-muted-foreground">Managed by {project.manager}</p>
              <Badge variant={statusVariant(project.status)} className="text-sm">{project.status}</Badge>
            </div>
            <p className="mt-4 text-muted-foreground max-w-3xl">{project.description}</p>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Completion</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{project.completion}%</div>
              <Progress value={project.completion} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Budget</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">${project.spent.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mb-2">of ${project.budget.toLocaleString()}</p>
              <Progress value={(project.spent / project.budget) * 100} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p><strong>Start:</strong> {format(project.startDate, "PPP")}</p>
                <p><strong>End:</strong> {format(project.endDate, "PPP")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
              <Card>
                  <CardHeader><CardTitle>Project Timeline</CardTitle><CardDescription>A visual timeline of all project tasks.</CardDescription></CardHeader>
                  <CardContent><GanttChart tasks={tasks} /></CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                      <div><CardTitle>Tasks</CardTitle><CardDescription>All tasks associated with this project.</CardDescription></div>
                      <Button onClick={handleOpenAddDialog}><PlusCircle className="mr-2 h-4 w-4" />New Task</Button>
                  </CardHeader>
                  <CardContent><TaskList tasks={tasks} onEdit={handleOpenEditDialog} onDelete={handleOpenDeleteDialog} /></CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="budget" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Receipt /> Invoices</CardTitle><CardDescription>Invoices generated for this project.</CardDescription></CardHeader>
                <CardContent>
                   <MiniTable title="Invoices" icon={<Receipt/>} items={projectInvoices} columns={['ID', 'Status', 'Total', 'Due Date']} renderRow={(item) => (
                      <>
                          <TableCell className="font-medium">{item.id.toUpperCase()}</TableCell>
                          <TableCell><Badge>{item.status}</Badge></TableCell>
                          <TableCell>${item.total.toLocaleString()}</TableCell>
                          <TableCell>{format(item.dueDate, "PPP")}</TableCell>
                      </>
                  )} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign/> Expenses</CardTitle><CardDescription>Expenses logged against this project.</CardDescription></CardHeader>
                <CardContent>
                  <MiniTable title="Expenses" icon={<DollarSign/>} items={projectExpenses} columns={['Date', 'Description', 'Category', 'Amount']} renderRow={(item) => (
                      <>
                          <TableCell>{format(item.date, "PPP")}</TableCell>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                          <TableCell>${item.amount.toLocaleString()}</TableCell>
                      </>
                  )} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="team" className="mt-6">
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div><CardTitle>Project Team</CardTitle><CardDescription>Manage team members assigned to this project.</CardDescription></div>
                    <Button onClick={() => setIsAddTeamMemberDialogOpen(true)}><UserPlus className="mr-2 h-4 w-4" /> Add Member</Button>
                  </CardHeader>
                  <CardContent>
                      {team.length > 0 ? (
                        <Table>
                            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead className="w-[50px] text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {team.map(member => (
                                    <TableRow key={member.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                          <Avatar className="h-8 w-8"><AvatarImage src={member.avatar} alt={member.name} data-ai-hint="employee avatar" /><AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback></Avatar>
                                          {member.name}
                                        </TableCell>
                                        <TableCell><Badge variant="secondary">{member.role}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => setMemberToRemove(member)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
                            <Users2 className="w-16 h-16 text-muted-foreground" />
                            <p className="mt-4 text-muted-foreground">No team members assigned yet.</p>
                        </div>
                      )}
                  </CardContent>
              </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="mt-6">
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div><CardTitle>Documents</CardTitle><CardDescription>All documents and files for this project.</CardDescription></div>
                    <Button onClick={() => setIsAddDocumentDialogOpen(true)}><FileUp className="mr-2 h-4 w-4" /> Upload Document</Button>
                  </CardHeader>
                  <CardContent>
                      {documents.length > 0 ? (
                        <Table>
                            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Upload Date</TableHead><TableHead className="w-[100px] text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {documents.map(doc => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium">{doc.name}</TableCell>
                                        <TableCell><Badge variant="outline">{doc.type}</Badge></TableCell>
                                        <TableCell>{format(doc.uploadDate, "PPP")}</TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button variant="ghost" size="icon" onClick={() => toast({ title: "Downloading...", description: doc.name })}><Download className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => setDocumentToDelete(doc)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
                            <FolderArchive className="w-16 h-16 text-muted-foreground" />
                            <p className="mt-4 text-muted-foreground">No documents uploaded for this project yet.</p>
                        </div>
                      )}
                  </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AddEditTaskDialog
        open={isAddEditDialogOpen}
        onOpenChange={setIsAddEditDialogOpen}
        onSave={handleSaveTask}
        task={selectedTask}
        projects={initialProjects}
        employees={allEmployees}
        defaultProjectId={project.id}
      />
      
      <DeleteTaskDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteTask}
        task={selectedTask}
      />

      <AddTeamMemberDialog
        open={isAddTeamMemberDialogOpen}
        onOpenChange={setIsAddTeamMemberDialogOpen}
        onAdd={handleAddTeamMember}
        allEmployees={allEmployees}
        currentTeam={team}
      />

      <DeleteTeamMemberDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        onConfirm={handleRemoveTeamMember}
        employee={memberToRemove}
      />

      <AddProjectDocumentDialog
        open={isAddDocumentDialogOpen}
        onOpenChange={setIsAddDocumentDialogOpen}
        onSave={handleSaveDocument}
      />

      <DeleteProjectDocumentDialog
        open={!!documentToDelete}
        onOpenChange={(open) => !open && setDocumentToDelete(null)}
        onConfirm={handleDeleteDocument}
        document={documentToDelete}
      />
    </>
  );
}
