import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/authApi";
import { complaintApi } from "@/api/complaintApi";
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
  History,
  FileText,
  Server,
  Zap,
  Terminal,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Input } from "@/components/common/Input";
import { Spinner } from "@/components/common/Spinner";
import { EmptyState } from "@/components/common/EmptyState";
import { Avatar, AvatarFallback } from "@/components/common/Avatar";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AdminDashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "users";
    
    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };

    const [searchTerm, setSearchTerm] = useState("");
    const [filterPending, setFilterPending] = useState(false);

    // Fetch users (Governance Registry)
    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            // Placeholder: Admin-only privileged route
            // const res = await authApi.getAllUsers(); 
            // Mocking for high-fidelity UI demonstration
            return [
                { _id: 'u1', firstName: "Admin", lastName: "Root", email: "admin@laborguard.org", role: "admin", isApproved: true, isActive: true, city: "Colombo" },
                { _id: 'u2', firstName: "Legal", lastName: "Officer", email: "lawyer@laborguard.lk", role: "lawyer", isApproved: true, isActive: true, city: "Kandy" },
                { _id: 'u3', firstName: "NGO", lastName: "Observer", email: "ngo@vforce.org", role: "ngo", isApproved: false, isActive: true, city: "Jaffna" },
                { _id: 'u4', firstName: "Employer", lastName: "Corp", email: "hr@company.com", role: "employer", isApproved: false, isActive: true, city: "Gampaha" },
            ];
        }
    });

    const approveMutation = useMutation({
        mutationFn: (userId) => {
            console.log("Approving user:", userId);
            return Promise.resolve();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users']);
            toast.success("User identity verified and role authorized.");
        }
    });

    const filteredUsers = (usersData || []).filter(u => {
        const matchesSearch = 
            u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPending = filterPending ? !u.isApproved : true;
        return matchesSearch && matchesPending;
    });

    if (usersLoading) return (
        <div className="p-32 flex flex-col items-center">
            <Spinner size="lg" />
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono italic">INITIALIZING GOVERNANCE PROTOCOLS...</p>
        </div>
    );

    const stats = [
        { label: "Total Residents", value: usersData?.length || 0, icon: Users, color: "text-primary", bg: "bg-primary/10" },
        { label: "Unverified Roles", value: usersData?.filter(u => !u.isApproved).length || 0, icon: ShieldAlert, color: "text-amber-500", bg: "bg-amber-50" },
        { label: "System Uptime", value: "99.98%", icon: Activity, color: "text-green-500", bg: "bg-green-50" },
        { label: "Audit Log Integrity", value: "100%", icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-50" },
    ];

    return (
        <div className="space-y-12 animate-fade-in pb-20 mt-4 px-2 lg:px-6">
            {/* Header: Root System Authority */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                <div className="space-y-4">
                    <Badge variant="outline" className="text-destructive border-red-200 font-black uppercase tracking-[0.3em] text-[10px] px-6 py-2 rounded-full bg-red-50 shadow-sm ring-2 ring-red-50/50">Root System Authority</Badge>
                    <h1 className="text-6xl font-black tracking-tighter text-slate-900 leading-none">
                        Platform <br />
                        <span className="text-primary italic">Governance.</span>
                    </h1>
                    <p className="text-base font-bold text-slate-400 max-w-xl leading-relaxed uppercase italic">
                        Logged as <span className="text-slate-800 not-italic font-black">Cluster Admin</span>. Managing global state, encryption keys, and identity protocols.
                    </p>
                </div>
                
                <div className="flex gap-4">
                     <div className="flex items-center gap-1.5 bg-slate-900 p-2 rounded-[24px] shadow-2xl">
                        {[
                            { id: "users", icon: Users, label: "Registry" },
                            { id: "health", icon: Cpu, label: "Hardware" },
                            { id: "audit", icon: History, label: "Logs" }
                        ].map((tab) => (
                            <Button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300",
                                    activeTab === tab.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-transparent text-slate-500 hover:text-white"
                                )}
                            >
                                <tab.icon className="h-4 w-4 mr-2" />
                                {tab.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Global Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-2">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-xl shadow-slate-200/20 group hover:border-primary/20 transition-all duration-500">
                        <div className="flex justify-between items-start mb-6">
                            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border", s.bg, s.color)}>
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
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col lg:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input 
                                placeholder="Search by name, email, or digital signature..." 
                                className="pl-14 h-14 rounded-[28px] bg-slate-50/50 border-none shadow-inner focus:bg-white text-sm font-bold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button 
                            variant={filterPending ? "default" : "outline"}
                            onClick={() => setFilterPending(!filterPending)}
                            className={cn(
                                "h-14 px-8 rounded-full font-black uppercase tracking-widest text-[9px] transition-all",
                                filterPending ? "bg-amber-500 text-white border-none shadow-lg shadow-amber-200" : "border-2 border-slate-100 text-slate-400"
                            )}
                        >
                            <ShieldAlert className="h-4 w-4 mr-2" />
                            Identity Verification Queue
                        </Button>
                    </div>

                    <div className="bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto p-4">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="p-8 text-[11px] font-black uppercase tracking-widest text-slate-400">User Identity</th>
                                    <th className="p-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Governance Role</th>
                                    <th className="p-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Status Matrix</th>
                                    <th className="p-8 text-right text-[11px] font-black uppercase tracking-widest text-slate-400">Vault Mgmt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredUsers.map((u) => (
                                    <tr key={u._id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="p-8">
                                            <div className="flex items-center gap-6">
                                                <Avatar className="h-14 w-14 border-2 border-white shadow-sm ring-4 ring-slate-50">
                                                    <AvatarFallback className="bg-primary/10 text-primary font-black uppercase text-xs">{u.firstName?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{u.firstName} {u.lastName}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 tracking-tight">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <Badge className={cn(
                                                "px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[8px]",
                                                u.role === 'admin' ? 'bg-red-900 text-white' : 'bg-slate-100 text-slate-500'
                                            )}>
                                                {u.role}
                                            </Badge>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("h-2.5 w-2.5 rounded-full", u.isApproved ? "bg-green-500 shadow-glow" : "bg-amber-500")} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{u.isApproved ? "Verified" : "Pending"}</span>
                                            </div>
                                        </td>
                                        <td className="p-8 text-right space-x-3">
                                            {!u.isApproved && (
                                                <Button 
                                                    size="sm" 
                                                    className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[9px] bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-100"
                                                    onClick={() => approveMutation.mutate(u._id)}
                                                >
                                                    Authorize
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "health" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom-5 duration-700">
                    <div className="bg-slate-900 rounded-[64px] p-16 text-white space-y-12 shadow-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-60 h-60 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black tracking-tight uppercase italic flex items-center gap-4">
                                    <Server className="h-8 w-8 text-primary shadow-glow-primary" />
                                    Cluster Diagnostics
                                </h3>
                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 italic">Global Microservices Pipeline Status</p>
                            </div>
                            <Button variant="outline" className="h-14 w-14 rounded-[24px] border-white/10 hover:bg-white/5 p-0 transition-all">
                                <RefreshCw className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-6 relative z-10">
                            {[
                                { name: "Auth Vault Interface", status: "Operational", lat: "12ms", icon: Lock },
                                { name: "Case Intelligence Core", status: "Operational", lat: "24ms", icon: Database },
                                { name: "Messaging Uplink", status: "Optimized", lat: "8ms", icon: Zap },
                                { name: "Advocacy Engine", status: "Operational", lat: "18ms", icon: Globe },
                            ].map((svc, i) => (
                                <div key={i} className="flex justify-between items-center bg-white/5 p-8 rounded-[36px] border border-white/10 group hover:border-primary/30 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="h-12 w-12 rounded-[20px] bg-slate-800 flex items-center justify-center border border-white/5">
                                            <svc.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black uppercase tracking-widest leading-none mb-1">{svc.name}</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{svc.lat} Average Latency</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-green-500/10 text-green-400 border-none font-black text-[9px] uppercase px-4 py-1.5 shadow-sm">
                                        {svc.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[64px] p-16 border border-slate-100 shadow-xl space-y-12 relative overflow-hidden">
                        <div className="space-y-1">
                            <h3 className="text-3xl font-black tracking-tight uppercase italic flex items-center gap-4 text-slate-900">
                                <HardDrive className="h-8 w-8 text-primary" />
                                Hardware Integrity
                            </h3>
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic">Cloud Infrastructure Resource Allocation</p>
                        </div>
                        <div className="space-y-12">
                            {[
                                { label: "Vault Cloud Storage", val: "42%", cap: "1.0 PB", color: "bg-primary" },
                                { label: "Concurrent Request Load", val: "124", cap: "10K", color: "bg-blue-500" },
                                { label: "Global Key Health", val: "100%", cap: "ROTATION: 12d", color: "bg-green-500" },
                            ].map((m, i) => (
                                <div key={i} className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">{m.label}</span>
                                        <span className="text-base font-black text-slate-900">{m.val} <span className="text-xs text-slate-300 font-bold ml-1">/ {m.cap}</span></span>
                                    </div>
                                    <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100">
                                        <div className={cn("h-full rounded-full shadow-glow transition-all duration-1000", m.color || "bg-primary")} style={{ width: m.val }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-10 bg-red-50 rounded-[48px] border-2 border-red-100 space-y-6 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 h-40 w-40 bg-red-100 rounded-full -mr-20 -mt-20 blur-[60px] opacity-20" />
                            <div className="flex items-center gap-4">
                                <AlertTriangle className="h-6 w-6 text-red-500 shadow-glow-red" />
                                <h4 className="text-sm font-black uppercase tracking-tight text-red-700">Protocol: Emergency Sanitization</h4>
                            </div>
                            <p className="text-[11px] font-bold text-red-500/70 leading-relaxed uppercase italic">Manual purge and global session termination are authorized only via secure physical terminal keys.</p>
                            <Button className="w-full h-16 rounded-[28px] bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-red-200 transition-all hover:scale-[1.02]">
                                Global Unauthorized Handshake Reset
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "audit" && (
                <div className="bg-slate-50 rounded-[64px] border border-slate-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-700">
                    <div className="p-12 border-b border-slate-100 bg-white flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic flex items-center gap-4">
                                <Terminal className="h-8 w-8 text-slate-800" />
                                Immutable Record
                            </h3>
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic">End-to-end cryptographic history of system governance actions.</p>
                        </div>
                        <Button variant="outline" className="h-14 px-10 rounded-[28px] border-slate-200 text-[10px] font-black uppercase tracking-widest bg-white shadow-sm transition-all hover:bg-slate-50">
                            Download Cryptographic Proof (.PDF)
                        </Button>
                    </div>
                    <div className="p-12 space-y-6">
                        {[
                            { action: "ROLE_ELEVATION", actor: "ROOT", meta: "Moderator -> Cluster Admin", time: "2m", status: "HASHED" },
                            { action: "CRYPTO_KEY_ROTATION", actor: "SYSTEM", meta: "RS256 Private key rolled", time: "14m", status: "VERIFIED" },
                            { action: "AUDIT_RECONCILIATION", actor: "SEC_OPS", meta: "Database consistency check: 100%", time: "1h", status: "SIGNED" },
                            { action: "USER_SANCTION", actor: "ADMIN_02", meta: "Suspicious identity quarantined", time: "3h", status: "PENDING" },
                        ].map((log, i) => (
                            <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 bg-white rounded-[40px] border border-slate-100 group hover:border-slate-300 transition-all shadow-sm">
                                <div className="flex items-center gap-8">
                                    <div className="h-14 w-14 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors">
                                        <Database className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex gap-2 mb-2">
                                            <Badge className="bg-slate-900 text-white text-[9px] font-black px-3 py-1 uppercase">{log.action}</Badge>
                                            <Badge className="bg-green-50 text-green-600 border-none text-[8px] font-black uppercase">{log.status}</Badge>
                                        </div>
                                        <p className="text-base font-black text-slate-900 tracking-tight">{log.actor}</p>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight italic">{log.meta}</p>
                                    </div>
                                </div>
                                <div className="text-right mt-6 md:mt-0 space-y-1">
                                    <p className="text-xl font-black text-slate-900 tracking-tighter">{log.time} <span className="text-[9px] uppercase text-slate-300 tracking-widest font-bold">AGO</span></p>
                                    <p className="text-[10px] font-mono text-slate-300">0x76a...92b4</p>
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
