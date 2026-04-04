import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance";
import { 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  Trash2, 
  CheckCircle, 
  XCircle,
  MoreVertical,
  Filter,
  ShieldAlert,
  Search,
  Activity,
  UserCheck,
  UserPlus,
  LayoutGrid,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Settings,
  Bell,
  Lock,
  Globe,
  PieChart,
  HardDrive,
  Cpu,
  RefreshCw,
  Database,
  History
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Input } from "@/components/common/Input";
import { Spinner } from "@/components/common/Spinner";
import { EmptyState } from "@/components/common/EmptyState";
import { Avatar, AvatarFallback } from "@/components/common/Avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AdminDashboard = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("users");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPending, setFilterPending] = useState(false);

    // Fetch users
    const { data: users, isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const res = await axiosInstance.get('/admin/users');
            return res.data.data.users || [];
        }
    });

    const approveMutation = useMutation({
        mutationFn: (userId) => axiosInstance.put(`/admin/users/${userId}/approve`),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users']);
            toast.success("User identity verified and role authorized.");
        }
    });

    const roleMutation = useMutation({
        mutationFn: ({ userId, role }) => axiosInstance.put(`/admin/users/${userId}/role`, { role }),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users']);
            toast.success("Global permissions updated.");
        }
    });

    const statusMutation = useMutation({
        mutationFn: ({ userId, isActive }) => axiosInstance.put(`/admin/users/${userId}/status`, { isActive }),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users']);
            toast.success("User access status toggled.");
        }
    });

    const filteredUsers = (users || []).filter(u => {
        const matchesSearch = 
            u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPending = filterPending ? (!u.isApproved && u.role !== 'worker') : true;
        return matchesSearch && matchesPending;
    });

    if (isLoading) return (
        <div className="p-32 flex flex-col items-center">
            <Spinner size="lg" />
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono italic">INITIALIZING GOVERNANCE PROTOCOLS...</p>
        </div>
    );

    const stats = [
        { label: "Total Residents", value: users?.length || 0, icon: Users, color: "text-primary", bg: "bg-primary/10" },
        { label: "Unverified Roles", value: users?.filter(u => !u.isApproved && u.role !== 'worker').length || 0, icon: ShieldAlert, color: "text-amber-500", bg: "bg-amber-50" },
        { label: "System Uptime", value: "99.98%", icon: Activity, color: "text-green-500", bg: "bg-green-50" },
        { label: "Audit Log Integrity", value: "100%", icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-50" },
    ];

    return (
        <div className="space-y-12 animate-fade-in pb-20 mt-4 px-2 lg:px-6">
            {/* Header: Root Authority */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="space-y-4">
                    <Badge variant="outline" className="text-destructive border-red-200 font-black uppercase tracking-[0.2em] text-[9px] px-4 py-1.5 rounded-full bg-red-50 shadow-sm">Root System Authority</Badge>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
                        Platform <br />
                        <span className="text-primary italic">Governance.</span>
                    </h1>
                    <p className="text-sm font-bold text-slate-400 max-w-xl leading-relaxed uppercase italic">
                        Logged as <span className="text-slate-800 not-italic font-black">Cluster Admin</span>. Managing global state, encryption keys, and identity protocols.
                    </p>
                </div>
                
                <div className="flex gap-4">
                     <div className="flex items-center gap-1.5 bg-slate-900 p-2 rounded-[24px] shadow-2xl">
                        <Button 
                            onClick={() => setActiveTab("users")}
                            className={cn(
                                "h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all",
                                activeTab === "users" ? "bg-primary text-white shadow-lg" : "bg-transparent text-slate-500 hover:text-white"
                            )}
                        >
                            <Users className="h-4 w-4 mr-2" />
                            User Registry
                        </Button>
                        <Button 
                            onClick={() => setActiveTab("health")}
                            className={cn(
                                "h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all",
                                activeTab === "health" ? "bg-primary text-white shadow-lg" : "bg-transparent text-slate-500 hover:text-white"
                            )}
                        >
                            <Cpu className="h-4 w-4 mr-2" />
                            System Health
                        </Button>
                        <Button 
                            onClick={() => setActiveTab("audit")}
                            className={cn(
                                "h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all",
                                activeTab === "audit" ? "bg-primary text-white shadow-lg" : "bg-transparent text-slate-500 hover:text-white"
                            )}
                        >
                            <History className="h-4 w-4 mr-2" />
                            Audit Logs
                        </Button>
                    </div>
                </div>
            </header>

            {/* Metrics Dashboard */}
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

            {activeTab === "users" && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col lg:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input 
                                placeholder="Search by name, email, or digital signature..." 
                                className="pl-14 h-14 rounded-[28px] bg-slate-50/50 border-none shadow-inner focus:bg-white text-sm font-bold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button 
                                variant={filterPending ? "default" : "outline"}
                                onClick={() => setFilterPending(!filterPending)}
                                className={cn(
                                    "h-14 px-8 rounded-full font-black uppercase tracking-widest text-[9px]",
                                    filterPending ? "bg-amber-500 text-white border-none shadow-lg shadow-amber-200" : "border-2 border-slate-100 text-slate-400"
                                )}
                            >
                                <ShieldAlert className="h-4 w-4 mr-2" />
                                Review Suspicious Identity
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">User Identity</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Governance Role</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Status Matrix</th>
                                    <th className="p-8 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Management</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-20 text-center">
                                            <EmptyState icon={Users} title="Registry Empty" description="Zero identities matching your query found in the vault." />
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((u) => (
                                        <tr key={u._id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="p-8">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-4 ring-slate-50">
                                                        <AvatarFallback className="bg-primary/10 text-primary font-black uppercase text-xs">{u.firstName?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">{u.firstName} {u.lastName}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 tracking-tight">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <select 
                                                    className="h-10 px-4 rounded-xl bg-slate-100 border-none text-[10px] font-black uppercase tracking-tight text-slate-700 outline-none appearance-none cursor-pointer"
                                                    value={u.role}
                                                    onChange={(e) => roleMutation.mutate({ userId: u._id, role: e.target.value })}
                                                >
                                                    <option value="worker">Worker</option>
                                                    <option value="employer">Employer</option>
                                                    <option value="lawyer">Lawyer</option>
                                                    <option value="ngo">NGO</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="p-8">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("h-2.5 w-2.5 rounded-full", u.isApproved ? "bg-green-500 shadow-glow" : "bg-amber-500")} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{u.isApproved ? "Verified" : "Pending"}</span>
                                                </div>
                                            </td>
                                            <td className="p-8 text-right space-x-3">
                                                {!u.isApproved && u.role !== 'worker' && (
                                                    <Button 
                                                        size="sm" 
                                                        className="h-10 rounded-xl font-black uppercase tracking-widest text-[8px] bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-100"
                                                        onClick={() => approveMutation.mutate(u._id)}
                                                    >
                                                        Authorize Identity
                                                    </Button>
                                                )}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-[24px] border border-slate-100 shadow-3xl">
                                                        <DropdownMenuItem 
                                                            className="p-4 rounded-xl font-black uppercase tracking-widest text-[9px] cursor-pointer hover:bg-slate-50"
                                                            onClick={() => statusMutation.mutate({ userId: u._id, isActive: !u.isActive })}
                                                        >
                                                            {u.isActive ? "Deactivate User" : "Activate User"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="p-4 rounded-xl font-black uppercase tracking-widest text-[9px] cursor-pointer text-destructive hover:bg-red-50">
                                                            Purge From Records
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "health" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom-5 duration-500">
                    <div className="bg-slate-900 rounded-[56px] p-12 text-white space-y-10 shadow-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-[100px]" />
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black tracking-tight uppercase italic flex items-center gap-3">
                                    <Cpu className="h-6 w-6 text-primary" />
                                    Cluster Diagnostics
                                </h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Backend Microservices Status</p>
                            </div>
                            <Button variant="outline" className="h-12 w-12 rounded-2xl border-white/10 hover:bg-white/5 p-0">
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-8">
                            {[
                                { name: "Auth Service", status: "Healthy", latency: "12ms" },
                                { name: "Complaint Core", status: "Healthy", latency: "42ms" },
                                { name: "Messaging Hub", status: "Optimized", latency: "8ms" },
                                { name: "Job Engine", status: "Healthy", latency: "24ms" },
                            ].map((svc, i) => (
                                <div key={i} className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-2xl bg-slate-800 flex items-center justify-center">
                                            <Database className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest">{svc.name}</p>
                                            <p className="text-[9px] font-bold text-slate-500">{svc.latency} Latency</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-green-500/10 text-green-400 border-none font-black text-[8px] uppercase px-3 py-1">
                                        {svc.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[56px] p-12 border border-slate-100 shadow-xl space-y-10">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black tracking-tight uppercase italic flex items-center gap-3 text-slate-900">
                                <HardDrive className="h-6 w-6 text-primary" />
                                Vault Integrity
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Database & Security Metrics</p>
                        </div>
                        <div className="space-y-10">
                            {[
                                { label: "Cold Storage Usage", val: "42%", cap: "500GB" },
                                { label: "Active Connections", val: "124", cap: "1K" },
                                { label: "Encryption Key Age", val: "12", cap: "30 Days" },
                            ].map((m, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{m.label}</span>
                                        <span className="text-sm font-black text-slate-900">{m.val} / <span className="text-slate-400">{m.cap}</span></span>
                                    </div>
                                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary shadow-glow transition-all duration-1000" style={{ width: m.val }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-8 bg-red-50 rounded-[40px] border-2 border-red-100 space-y-4">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                <h4 className="text-xs font-black uppercase tracking-widest text-red-700">Security Breach Protocol</h4>
                            </div>
                            <p className="text-[10px] font-bold text-red-500/60 leading-relaxed uppercase">Manual lockdown of the User Vault is available only through secure physical terminal access.</p>
                            <Button className="w-full h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[9px]">
                                Force Global Logout
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "audit" && (
                <div className="bg-white rounded-[56px] border border-slate-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-500">
                    <div className="p-10 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase italic">Immutable Logs</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">History of every governance action taken on the platform.</p>
                        </div>
                        <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 text-[10px] font-black uppercase tracking-widest">
                            Export Log (.XLSX)
                        </Button>
                    </div>
                    <div className="p-10 space-y-6">
                        {[
                            { action: "ROLE_UPGRADE", user: "John Doe", meta: "Moderator -> Admin", time: "2 mins ago" },
                            { action: "USER_VERIFIED", user: "Sarah Smith", meta: "Employer Status Confirmed", time: "14 mins ago" },
                            { action: "SYSTEM_REBOOT", user: "ROOT", meta: "Microservice Synchronization", time: "1 hour ago" },
                            { action: "KEY_ROTATION", user: "Security", meta: "JWT Secret Rolled", time: "3 hours ago" },
                        ].map((log, i) => (
                            <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-slate-50 rounded-[32px] border border-slate-100 group hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <Badge className="bg-slate-900 text-white text-[8px] font-black mb-1 px-2">{log.action}</Badge>
                                        <p className="text-sm font-black text-slate-800">{log.user}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{log.meta}</p>
                                    </div>
                                </div>
                                <div className="text-right mt-4 md:mt-0 font-mono text-[9px] font-black uppercase text-slate-300">
                                    {log.time}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
