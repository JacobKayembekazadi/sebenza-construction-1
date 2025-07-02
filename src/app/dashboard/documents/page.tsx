
"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusCircle,
  Search,
  FileBox,
  MoreHorizontal,
  FileText,
  ImageIcon,
  FileSpreadsheet,
  FileDigit,
  Download,
} from "lucide-react";
import { documents as initialDocuments, projects, type Document } from "@/lib/data";
import { AddEditDocumentDialog, type DocumentFormValues } from "@/components/add-edit-document-dialog";
import { DeleteDocumentDialog } from "@/components/delete-document-dialog";
import Link from "next/link";

const typeIcons = {
    PDF: <FileText className="h-5 w-5 text-destructive" />,
    Image: <ImageIcon className="h-5 w-5 text-blue-500" />,
    Word: <FileDigit className="h-5 w-5 text-blue-700" />,
    Excel: <FileSpreadsheet className="h-5 w-5 text-green-700" />,
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const types = ["All", ...Array.from(new Set(initialDocuments.map(d => d.type)))];

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const matchesSearch =
        document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        document.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        typeFilter === "All" || document.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [documents, searchTerm, typeFilter]);
  
  const handleOpenAddDialog = () => {
    setSelectedDocument(null);
    setIsAddEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (document: Document) => {
    setSelectedDocument(document);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveDocument = (data: DocumentFormValues, documentId?: string) => {
    const project = projects.find(p => p.id === data.projectId);
    if (!project) return;
    
    // In a real app, this would involve a file upload and returning the URL.
    // For now, we just simulate it.
    if (documentId) {
      setDocuments(documents.map(d => d.id === documentId ? { ...d, ...data, projectName: project.name } : d));
    } else {
      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        projectName: project.name,
        url: "#", // Dummy URL
        ...data,
      };
      setDocuments([newDocument, ...documents]);
    }
  };

  const handleDeleteDocument = () => {
    if (selectedDocument) {
      setDocuments(documents.filter(d => d.id !== selectedDocument.id));
      setIsDeleteDialogOpen(false);
      setSelectedDocument(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          Central repository for all project-related files.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Document Library</CardTitle>
            <CardDescription>
              Manage all your project documents and files.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or project..."
                className="pl-8 w-full sm:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="w-full sm:w-auto" onClick={handleOpenAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead className="w-[50px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                     <TableCell>
                        <Link href={`/dashboard/projects/${doc.projectId}`} className="hover:underline">
                            {doc.projectName}
                        </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {typeIcons[doc.type]}
                        <span>{doc.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{format(doc.uploadDate, "PPP")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => window.open(doc.url, '_blank')}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDeleteDialog(doc)} className="text-destructive focus:bg-destructive/20">
                            Delete Document
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No documents found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AddEditDocumentDialog
        open={isAddEditDialogOpen}
        onOpenChange={setIsAddEditDialogOpen}
        onSave={handleSaveDocument}
        document={selectedDocument}
        projects={projects}
      />
      
      <DeleteDocumentDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteDocument}
        document={selectedDocument}
      />
    </div>
  );
}
