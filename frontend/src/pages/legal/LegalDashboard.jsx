import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useComplaints } from "@/hooks/useComplaints";
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
  ShieldAlert,
  Calendar,
  Briefcase,
  TrendingDown,
  LayoutGrid,
  ChevronRight,
  MoreVertical,
  Download,
  Building2
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Input } from "@/components/common/Input";
import { Spinner } from "@/components/common/Spinner";
import { EmptyState } from "@/components/common/EmptyState";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/Select"; // Redirected from common to ui
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const LegalDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { useGetComplaints, downloadReport } = useComplaints();
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch assigned complaints
    const { data: complaints, isLoading } = useGetComplaints({ 
        assignedTo: user.id,
        status: statusFilter !== "all" ? statusFilter : undefined
    });

    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending': return { label: 'Pending', class: 'bg-amber-100 text-amber-700' };
            case 'under_review': return { label: 'In Review', class: 'bg-blue-100 text-blue-700' };
            case 'resolved': return { label: 'Resolved', class: 'bg-green-100 text-green-700' };
            case 'rejected': return { label: 'Rejected', class: 'bg-red-100 text-red-700' };
            default: return { label: status, class: 'bg-slate-100 text-slate-700' };
        }
    };

    const filteredComplaints = complaints?.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.organizationName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return (
        <div className="p-32 flex flex-col items-center">
            <Spinner size="lg" />
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">DOCKET SYNCHRONIZATION...</p>
        </div>
    );

    const stats = [
        { label: "Active Docket", value: complaints?.length || 0, icon: Gavel, color: "text-primary", bg: "bg-primary/10" },
        { label: "Critical Priority", value: complaints?.filter(c => c.priority === 'critical').length || 0, icon: ShieldAlert, color: "text-red-500", bg: "bg-red-50" },
        { label: "Upcoming Consults", value: "--", icon: Calendar, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Resolution Rate", value: "84%", icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
    ];

    return (
        <div className="space-y-12 animate-fade-in pb-20 mt-4">
            {/* Header: Legal Command */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 px-4">
                <div className="space-y-3">
                    <Badge variant="outline" className="text-primary border-primary/20 font-black uppercase tracking-[0.2em] text-[9px] px-4 py-1.5 rounded-full bg-primary/5">Justice Protocol v4.0</Badge>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-tight">
                        Case Management <br />
                        <span className="text-primary italic">Docket.</span>
                    </h1>
                    <p className="text-sm font-bold text-slate-400 max-w-lg leading-relaxed uppercase italic">
                        Logged in as <span className="text-slate-800 not-italic font-black">Counselor {user?.firstName}</span>. Ensuring labor law compliance across Sri Lanka.
                    </p>
                </div>
                
                <div className="flex gap-4">
                    <Button variant="outline" size="lg" className="h-16 px-10 rounded-full font-black uppercase tracking-widest text-[10px] border-2 border-slate-100 hover:bg-slate-50 shadow-sm">
                        <FileBarChart className="h-4 w-4 mr-2" />
                        Generate Docket Report
                    </Button>
                </div>
            </header>

            {/* Stats Ecosystem */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20 group hover:border-primary/20 transition-all duration-500">
                        <div className="flex justify-between items-start mb-6">
                            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border", s.bg, s.color)}>
                                <s.icon className="h-6 w-6" />
                            </div>
                        </div>
                        <div>
                            <p className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{s.value}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Case Filters & Registry */}
            <div className="space-y-8 px-2">
                <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col lg:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder="Search by title, worker name, or employer..." 
                            className="pl-14 h-14 rounded-[28px] bg-slate-50/50 border-none shadow-inner focus:bg-white text-sm font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex gap-3 w-full lg:w-auto">
                        <select 
                            className="flex-1 lg:w-52 h-14 rounded-[28px] border-none bg-slate-50/50 px-6 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-inner appearance-none transition-all"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Case Statuses</option>
                            <option value="pending">Pending Review</option>
                            <option value="under_review">Under Investigation</option>
                            <option value="resolved">Resolved Cases</option>
                            <option value="rejected">Rejected Claims</option>
                        </select>

                        <Button variant="ghost" className="h-14 w-14 rounded-[28px] bg-slate-50/50 hover:bg-primary/5 text-slate-400 hover:text-primary transition-all">
                            <Filter className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredComplaints?.length === 0 ? (
                        <EmptyState
                            icon={Gavel}
                            title="Your docket is empty"
                            description="No cases matching your current criteria are assigned to you."
                            className="h-[300px] bg-slate-50 border-none rounded-[56px]"
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredComplaints.map((c) => {
                                const status = getStatusConfig(c.status);
                                return (
                                    <div key={c._id} className="group bg-white rounded-[40px] border border-slate-100 p-2 hover:shadow-2xl hover:border-primary/20 transition-all duration-500 overflow-hidden shadow-sm">
                                        <div className="flex flex-col md:flex-row items-stretch md:items-center">
                                            <div className="p-8 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                                <div className="space-y-3 flex-1 overflow-hidden">
                                                    <div className="flex items-center gap-3">
                                                        <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-none shadow-sm", status.class)}>
                                                            {status.label}
                                                        </Badge>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 font-mono">Case #{c._id.slice(-6)}</span>
                                                        {c.priority === 'critical' && (
                                                            <div className="flex items-center gap-1.5 bg-red-50 px-2 py-0.5 rounded-full ring-1 ring-red-100 animate-pulse">
                                                                <ShieldAlert className="h-3 w-3 text-red-500" />
                                                                <span className="text-[8px] font-black uppercase text-red-500 tracking-tighter">Priority High</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h4 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight line-clamp-1">{c.title}</h4>
                                                    <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                        <div className="flex items-center gap-1.5">
                                                            <Building2 className="h-3.5 w-3.5" />
                                                            {c.organizationName || "Private Employer"}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <UserIcon className="h-3.5 w-3.5" />
                                                            {c.isAnonymous ? "Anonymous Citizen" : "Verified Worker"}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            Filed {new Date(c.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 w-full md:w-auto">
                                                    <Button 
                                                        asChild
                                                        className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
                                                    >
                                                        <Link to={`/legal/cases/${c._id}`}>
                                                            Manage Case
                                                            <ChevronRight className="h-4 w-4 ml-2" />
                                                        </Link>
                                                    </Button>
                                                    
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-slate-50 hover:bg-primary/5 text-slate-400 hover:text-primary transition-all">
                                                                <MoreVertical className="h-5 w-5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-56 p-2 rounded-[24px] border border-slate-100 shadow-2xl">
                                                            <DropdownMenuItem 
                                                                className="p-4 rounded-xl font-black uppercase tracking-widest text-[9px] cursor-pointer hover:bg-slate-50"
                                                                onClick={() => downloadReport(c._id)}
                                                            >
                                                                <Download className="h-4 w-4 mr-3 text-slate-400" />
                                                                Download Dossier
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                className="p-4 rounded-xl font-black uppercase tracking-widest text-[9px] cursor-pointer hover:bg-slate-50"
                                                                onClick={() => navigate(`/messages?case=${c._id}`)}
                                                            >
                                                                <MessageSquare className="h-4 w-4 mr-3 text-slate-400" />
                                                                Open Secure Link
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LegalDashboard;
