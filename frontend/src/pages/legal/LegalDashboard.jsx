import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complaintApi } from "@/api/complaintApi";
import { 
  Gavel, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter,
  Eye,
  MessageSquare,
  FileBarChart,
  User as UserIcon,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const LegalDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch assigned complaints
    const { data: complaints, isLoading } = useQuery({
        queryKey: ['legal-cases', user.id, statusFilter],
        queryFn: async () => {
            const params = { assignedTo: user.id };
            if (statusFilter !== "all") params.status = statusFilter;
            const res = await complaintApi.getAllComplaints(params);
            return res.data.data || [];
        }
    });

    // Fetch stats for the legal officer
    const { data: stats } = useQuery({
        queryKey: ['legal-stats'],
        queryFn: async () => {
            const res = await complaintApi.getStats();
            return res.data.data;
        }
    });

    const getStatusVariant = (status) => {
        switch (status) {
            case 'pending': return 'outline';
            case 'under_review': return 'secondary';
            case 'resolved': return 'default';
            case 'rejected': return 'destructive';
            default: return 'outline';
        }
    };

    const filteredComplaints = complaints?.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.organizationName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="mt-4 font-bold text-lg text-muted-foreground">Opening Case Docket...</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8">
                <div className="space-y-1">
                    <Badge variant="outline" className="text-primary font-bold uppercase tracking-wider bg-primary/5">
                        Legal Officer Portal
                    </Badge>
                    <h1 className="text-4xl font-extrabold tracking-tight">Case Management</h1>
                    <p className="text-muted-foreground text-lg">
                        Welcome, Counselor <span className="font-bold text-slate-800">{user?.firstName}</span>. You have {complaints?.length || 0} active cases assigned.
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-full">
                        <FileBarChart className="w-4 h-4 mr-2" />
                        Generate Reports
                    </Button>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-md transition-shadow border-2">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-muted-foreground uppercase">Assigned</p>
                            <Gavel className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="text-3xl font-black mt-2">{complaints?.length || 0}</h3>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-2">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-muted-foreground uppercase">Reviewing</p>
                            <Clock className="w-4 h-4 text-blue-500" />
                        </div>
                        <h3 className="text-3xl font-black mt-2 text-blue-500">
                            {complaints?.filter(c => c.status === 'under_review').length || 0}
                        </h3>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-2">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-muted-foreground uppercase">Resolved</p>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                        <h3 className="text-3xl font-black mt-2 text-green-500">
                            {complaints?.filter(c => c.status === 'resolved').length || 0}
                        </h3>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-2">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-muted-foreground uppercase">Critical</p>
                            <ShieldAlert className="w-4 h-4 text-destructive" />
                        </div>
                        <h3 className="text-3xl font-black mt-2 text-destructive">
                            {complaints?.filter(c => c.priority === 'critical').length || 0}
                        </h3>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and List */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50 p-6 rounded-2xl border-2 border-slate-100">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by title or employer..." 
                            className="pl-10 rounded-xl bg-white border-none shadow-sm h-12"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-48 rounded-xl border-none shadow-sm h-12 bg-white">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Cases</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="under_review">Under Review</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Card className="shadow-2xl border-none overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-900 border-none">
                            <TableRow className="hover:bg-slate-900">
                                <TableHead className="text-white font-bold h-14">Case Title & ID</TableHead>
                                <TableHead className="text-white font-bold h-14 text-center">Priority</TableHead>
                                <TableHead className="text-white font-bold h-14 text-center">Status</TableHead>
                                <TableHead className="text-white font-bold h-14">Filed By</TableHead>
                                <TableHead className="text-white font-bold h-14">Date Filed</TableHead>
                                <TableHead className="text-white font-bold h-14 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredComplaints?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center text-muted-foreground font-medium italic">
                                        No matching cases found in your docket.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredComplaints.map((complaint) => (
                                    <TableRow key={complaint._id} className="group hover:bg-slate-50 transition-colors border-slate-100 h-20">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
                                                    {complaint.title}
                                                </span>
                                                <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-2">
                                                    #{complaint._id.substring(18)}
                                                    {complaint.isAnonymous && <Badge variant="secondary" className="scale-75 origin-left bg-slate-200">Anonymous</Badge>}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={`uppercase text-[10px] font-black ${
                                                complaint.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                                complaint.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                                {complaint.priority}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={getStatusVariant(complaint.status)} className="uppercase text-[10px] font-black">
                                                {complaint.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                                                <UserIcon className="w-3.5 h-3.5" />
                                                {complaint.isAnonymous ? "Protected Identity" : "Verified Worker"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium text-muted-foreground">
                                            {new Date(complaint.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary" asChild>
                                                    <Link to={`/legal/cases/${complaint._id}`}>
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-blue-100 hover:text-blue-600">
                                                    <MessageSquare className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
};

export default LegalDashboard;
