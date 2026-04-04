import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { complaintApi } from "@/api/complaintApi";
import { 
  Building, 
  BarChart3, 
  Users, 
  ShieldAlert, 
  Globe, 
  TrendingUp,
  Map,
  FileText,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Link } from "react-router-dom";

const NGODashboard = () => {
    const { user } = useAuth();

    // Fetch system-wide stats for advocacy
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['ngo-stats'],
        queryFn: async () => {
            const res = await complaintApi.getStats();
            return res.data.data;
        }
    });

    // Fetch critical unassigned cases for intervention
    const { data: criticalCases, isLoading: casesLoading } = useQuery({
        queryKey: ['critical-cases'],
        queryFn: async () => {
            const res = await complaintApi.getAllComplaints({ priority: 'critical', status: 'pending' });
            return res.data.data || [];
        }
    });

    if (statsLoading || casesLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="mt-4 font-bold text-lg text-muted-foreground">Generating Advocacy Insights...</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8">
                <div className="space-y-1">
                    <Badge variant="outline" className="text-primary font-bold uppercase tracking-wider bg-primary/5">
                        Civil Society Portal
                    </Badge>
                    <h1 className="text-4xl font-extrabold tracking-tight">Advocacy Dashboard</h1>
                    <p className="text-muted-foreground text-lg">
                        Monitoring labor rights for <span className="font-bold text-slate-800">{user?.organizationName || "Your Organization"}</span>
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <Button className="rounded-full">
                        <Globe className="w-4 h-4 mr-2" />
                        Public Reports
                    </Button>
                </div>
            </header>

            {/* Advocacy Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900 text-white border-none shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Monitored Cases</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <h3 className="text-5xl font-black">{stats?.total || 0}</h3>
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                        <p className="text-slate-400 text-xs mt-4 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-green-400" />
                            +12% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-muted-foreground text-xs font-bold uppercase">Critical Hotspots</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <h3 className="text-5xl font-black text-destructive">{stats?.byPriority?.critical || 0}</h3>
                            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-destructive">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-muted-foreground text-xs mt-4">Requiring immediate intervention</p>
                    </CardContent>
                </Card>

                <Card className="border-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-muted-foreground text-xs font-bold uppercase">Workers Protected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <h3 className="text-5xl font-black text-green-600">{stats?.byStatus?.resolved || 0}</h3>
                            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-muted-foreground text-xs mt-4">Successful resolutions</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Intervention List */}
                <Card className="shadow-lg border-2">
                    <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-destructive" />
                                Critical Intervention Queue
                            </CardTitle>
                            <CardDescription>Unassigned high-risk complaints needing advocacy.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {criticalCases?.length === 0 ? (
                                <p className="text-center py-10 text-muted-foreground italic">No critical unassigned cases detected.</p>
                            ) : (
                                criticalCases.map((c) => (
                                    <div key={c._id} className="flex items-start justify-between p-4 border rounded-2xl hover:bg-slate-50 transition-colors">
                                        <div className="space-y-1">
                                            <h4 className="font-bold line-clamp-1">{c.title}</h4>
                                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                                                <span>#{c._id.substring(18)}</span>
                                                <span className="flex items-center gap-1"><Map className="w-2.5 h-2.5" /> {c.location.city}</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link to={`/ngo/cases/${c._id}`}>
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Sector Analysis */}
                <Card className="shadow-lg border-2">
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            Sector Breakdown
                        </CardTitle>
                        <CardDescription>Industry-wise labor violation tracking.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            {Object.entries(stats?.byCategory || {}).map(([category, count]) => (
                                <div key={category} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold capitalize">{category.replace('_', ' ')}</span>
                                        <span className="text-muted-foreground">{count} cases</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary" 
                                            style={{ width: `${(count / stats?.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default NGODashboard;
