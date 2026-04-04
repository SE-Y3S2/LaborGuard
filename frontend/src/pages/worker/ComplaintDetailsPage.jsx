import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complaintApi } from "@/api/complaintApi";
import { 
  FileText, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  ChevronLeft,
  Paperclip,
  User as UserIcon,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const ComplaintDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: complaint, isLoading, error } = useQuery({
        queryKey: ['complaint', id],
        queryFn: async () => {
            const res = await complaintApi.getComplaintById(id);
            return res.data.data;
        },
        enabled: !!id
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="mt-4 font-bold text-lg text-muted-foreground">Retrieving Case File...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <AlertCircle className="w-16 h-16 text-destructive mb-4" />
                <h2 className="text-2xl font-bold">Failed to load complaint</h2>
                <p className="text-muted-foreground mt-2">The case ID may be invalid or you don't have permission to view it.</p>
                <Button onClick={() => navigate(-1)} className="mt-6">Go Back</Button>
            </div>
        );
    }

    const getStatusVariant = (status) => {
        switch (status) {
            case 'pending': return 'outline';
            case 'under_review': return 'secondary';
            case 'resolved': return 'default';
            case 'rejected': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
            <Button variant="ghost" onClick={() => navigate(-1)} className="group mb-4">
                <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </Button>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Badge variant={getStatusVariant(complaint.status)} className="uppercase font-bold px-3">
                            {complaint.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground font-mono">ID: {complaint._id.substring(18)}</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">{complaint.title}</h1>
                    <div className="flex flex-wrap gap-4 text-muted-foreground text-sm font-medium">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            Filed: {new Date(complaint.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            {complaint.location.city}, {complaint.location.district}
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full">
                            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                            {complaint.category.replace('_', ' ')}
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <Button variant="outline" className="h-11">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat with Officer
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="shadow-lg border-2">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="text-xl">Description of Dispute</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 prose prose-slate max-w-none">
                            <p className="text-lg leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
                        </CardContent>
                    </Card>

                    {/* Attachments */}
                    {complaint.attachments && complaint.attachments.length > 0 && (
                        <Card className="shadow-md border-2">
                            <CardHeader className="bg-slate-50 border-b">
                                <CardTitle className="text-lg">Evidence & Attachments</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {complaint.attachments.map((file, i) => (
                                        <a 
                                            key={i} 
                                            href={file.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-4 bg-white border rounded-2xl hover:border-primary/50 transition-all hover:shadow-md group"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                <Paperclip className="w-5 h-5" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-bold text-sm truncate">{file.originalName}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase">{file.fileType}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar Logic: Timeline & Officers */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="shadow-lg border-2 overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="text-lg">Status History</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="p-6 space-y-10 relative">
                                {/* Vertical timeline line */}
                                <div className="absolute left-[39px] top-10 bottom-10 w-[2px] bg-slate-200" />
                                
                                {complaint.statusHistory && complaint.statusHistory.length > 0 ? (
                                    complaint.statusHistory.map((history, i) => (
                                        <div key={i} className="flex gap-6 relative z-10">
                                            <div className="w-8 h-8 rounded-full bg-white border-2 border-primary flex items-center justify-center shrink-0">
                                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm capitalize">{history.status.replace('_', ' ')}</span>
                                                    <span className="text-[10px] text-muted-foreground">• {new Date(history.changedAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground italic">Reason: {history.reason || "No detail provided"}</p>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-primary/70">
                                                    <UserIcon className="w-3 h-3" />
                                                    {history.changedByRole.toUpperCase()}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex gap-6 relative z-10">
                                        <div className="w-8 h-8 rounded-full bg-white border-2 border-primary flex items-center justify-center shrink-0">
                                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-bold text-sm">Complaint Filed</p>
                                            <p className="text-[10px] text-muted-foreground">{new Date(complaint.createdAt).toLocaleTimeString()} • {new Date(complaint.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border-2">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="text-lg">Assigned Support</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {complaint.assignedTo ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                        LO
                                    </div>
                                    <div>
                                        <p className="font-bold">Legal Officer Assigned</p>
                                        <p className="text-xs text-muted-foreground">ID: {complaint.assignedTo.substring(18)}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-sm">Awaiting Assignment</p>
                                        <p className="text-[10px] text-muted-foreground px-4">An officer will be assigned shortly based on priority.</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ComplaintDetailsPage;
