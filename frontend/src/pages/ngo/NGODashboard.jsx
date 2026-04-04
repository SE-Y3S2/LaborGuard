import { useAuth } from "@/hooks/useAuth";
import { useComplaints } from "@/hooks/useComplaints";
import { 
  Building, 
  BarChart3, 
  Users, 
  ShieldAlert, 
  Globe, 
  TrendingUp,
  Map,
  FileText,
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  LayoutGrid,
  ChevronRight,
  PieChart,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Spinner } from "@/components/common/Spinner";
import { EmptyState } from "@/components/common/EmptyState";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { complaintApi } from "@/api/complaintApi";
import { cn } from "@/lib/utils";

const NGODashboard = () => {
    const { user } = useAuth();
    const { useGetComplaints } = useComplaints();

    // Fetch system-wide stats for advocacy
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['ngo-stats'],
        queryFn: async () => {
            const res = await complaintApi.getStats();
            return res.data.data;
        }
    });

    // Fetch critical unassigned cases for intervention
    const { data: criticalCases, isLoading: casesLoading } = useGetComplaints({ 
        priority: 'critical', 
        status: 'pending',
        limit: 5
    });

    if (statsLoading || casesLoading) return (
        <div className="p-32 flex flex-col items-center">
            <Spinner size="lg" />
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">AGGREGATING ANALYTICS...</p>
        </div>
    );

    const metrics = [
        { label: "Community Vigilance", value: stats?.total || 0, icon: Globe, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Unassigned Crisis", value: stats?.byPriority?.critical || 0, icon: ShieldAlert, color: "text-red-500", bg: "bg-red-50" },
        { label: "Resolved Advocacy", value: stats?.byStatus?.resolved || 0, icon: ShieldCheck, color: "text-green-500", bg: "bg-green-50" },
        { label: "Monthly Growth", value: "+14%", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    ];

    return (
        <div className="space-y-12 animate-fade-in pb-20 mt-4">
            {/* Header: Advocacy Command */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 px-4">
                <div className="space-y-3">
                    <Badge variant="outline" className="text-primary border-primary/20 font-black uppercase tracking-[0.2em] text-[9px] px-4 py-1.5 rounded-full bg-primary/5">Social Justice Watch</Badge>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-tight">
                        Advocacy <br />
                        <span className="text-primary italic">Intelligence.</span>
                    </h1>
                    <p className="text-sm font-bold text-slate-400 max-w-lg leading-relaxed uppercase italic">
                        Monitoring human rights for <span className="text-slate-800 not-italic font-black">"{user?.organizationName || "Independent Observer"}"</span>. Protecting the unseen workforce.
                    </p>
                </div>
                
                <div className="flex gap-4">
                    <Button className="h-16 px-10 rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 group">
                        <Map className="h-4 w-4 mr-2 group-hover:scale-125 transition-transform" />
                        Heatmap Analysis
                    </Button>
                </div>
            </header>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
                {metrics.map((m, i) => (
                    <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20 group hover:border-primary/20 transition-all duration-500">
                        <div className="flex justify-between items-start mb-6">
                            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", m.bg, m.color)}>
                                <m.icon className="h-6 w-6" />
                            </div>
                        </div>
                        <div>
                            <p className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{m.value}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{m.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-10 px-2">
                {/* Intervention Queue */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex justify-between items-center px-4">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <ShieldAlert className="h-6 w-6 text-red-500 shadow-glow" />
                                High-Risk Intervention Queue
                            </h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Critical pending cases requiring civil society oversight.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {criticalCases?.length === 0 ? (
                            <EmptyState
                                icon={ShieldCheck}
                                title="No Critical Breaches"
                                description="All priority cases are currently being managed by legal officers."
                                className="h-[300px] bg-slate-50 border-none rounded-[56px]"
                            />
                        ) : (
                            criticalCases.map((c) => (
                                <div key={c._id} className="group bg-white p-6 md:p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-red-100 transition-all duration-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Badge className="bg-red-100 text-red-700 border-none text-[9px] font-black uppercase tracking-widest px-3 py-1">CRITICAL PENDING</Badge>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 font-mono">#{c._id.slice(-6)}</span>
                                        </div>
                                        <h4 className="text-xl font-black text-slate-900 leading-tight">{c.title}</h4>
                                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                <Map className="h-3.5 w-3.5" />
                                                {c.location.city}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users className="h-3.5 w-3.5" />
                                                Verified Worker
                                            </div>
                                        </div>
                                    </div>
                                    <Button asChild className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10">
                                        <Link to={`/ngo/cases/${c._id}`}>
                                            Investigate
                                            <ChevronRight className="h-4 w-4 ml-2" />
                                        </Link>
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sentiment & Sector Analysis */}
                <div className="space-y-8">
                    <div className="bg-slate-900 p-10 rounded-[56px] text-white space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 blur-3xl" />
                        <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                            <PieChart className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-black uppercase tracking-tight">Sectoral Drift</h3>
                        </div>

                        <div className="space-y-8">
                            {Object.entries(stats?.byCategory || {}).map(([category, count]) => {
                                const percentage = Math.round((count / (stats?.total || 1)) * 100);
                                return (
                                    <div key={category} className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{category.replace('_', ' ')}</span>
                                            <span className="text-[10px] font-black text-primary uppercase">{percentage}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-primary shadow-glow transition-all duration-1000" 
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <Button variant="outline" className="w-full h-14 rounded-[32px] font-black uppercase tracking-widest text-[9px] border-white/10 text-white hover:bg-white/5 shadow-inner">
                            Download Advocacy Data
                        </Button>
                    </div>

                    <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-8">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-6 w-6 text-green-500" />
                            <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Advocacy Wins</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 text-center space-y-2">
                                <p className="text-3xl font-black text-green-600 tracking-tighter">84%</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Success Resolution Rate</p>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center leading-relaxed italic">
                                Your organization's presence has accelerated legal response times by 40% in monitored cases.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NGODashboard;
