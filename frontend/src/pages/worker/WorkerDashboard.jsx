import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance";
import { 
  FileText, 
  Briefcase, 
  MessageSquare, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const WorkerDashboard = () => {
    const { user } = useAuth();
    
    // Fetch worker stats (Simplified for now, will replace with proper hooks in Phase 4)
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['worker-stats'],
        queryFn: async () => {
            const res = await axiosInstance.get('/complaints/my');
            const complaints = res.data.data || [];
            return {
                total: complaints.length,
                pending: complaints.filter(c => c.status === 'pending').length,
                review: complaints.filter(c => c.status === 'under_review').length,
                resolved: complaints.filter(c => c.status === 'resolved').length,
                allComplaints: complaints
            };
        }
    });

    if (statsLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="mt-4 font-bold text-lg text-muted-foreground">Initializing Worker Portal...</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Welcome Banner */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-8">
                <div className="space-y-1">
                    <Badge variant="outline" className="text-primary font-bold uppercase tracking-wider bg-primary/5">
                        Worker Portal
                    </Badge>
                    <h1 className="text-4xl font-extrabold tracking-tight">
                        Hello, {user?.firstName || 'Worker'}
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Manage your complaints, explore jobs, and track your rights resolution.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button asChild className="rounded-full px-6">
                        <Link to="/worker/complaints/new">
                            <FileText className="w-4 h-4 mr-2" />
                            File New Complaint
                        </Link>
                    </Button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-lg transition-all group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Total Complaints</CardTitle>
                        <FileText className="w-4 h-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold">{stats?.total || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Lifetime filings</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Pending</CardTitle>
                        <Clock className="w-4 h-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-amber-500">{stats?.pending || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Under Review</CardTitle>
                        <AlertCircle className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-blue-500">{stats?.review || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Assigned to officer</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Resolved</CardTitle>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-green-500">{stats?.resolved || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Case closed successfully</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions & Profile */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-primary text-primary-foreground shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <CardContent className="pt-8 flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-extrabold mb-4 border-2 border-white/40 shadow-inner">
                                {user?.firstName?.charAt(0)}
                            </div>
                            <h3 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h3>
                            <p className="text-primary-foreground/80 mb-6">{user?.email}</p>
                            <Button variant="secondary" className="w-full font-bold">
                                View Full Profile
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            <Button asChild variant="outline" className="w-full justify-start h-12 text-md">
                                <Link to="/worker/jobs">
                                    <Briefcase className="w-4 h-4 mr-3" />
                                    Browse Job Board
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start h-12 text-md">
                                <Link to="/messages">
                                    <MessageSquare className="w-4 h-4 mr-3" />
                                    Messages
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start h-12 text-md">
                                <Link to="/worker/appointments">
                                    <Calendar className="w-4 h-4 mr-3" />
                                    Legal Appointments
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Dashboard Content */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">My Recent Complaints</CardTitle>
                            <CardDescription>Track the status of your active disputes.</CardDescription>
                        </div>
                        <Button asChild variant="ghost" className="font-bold text-primary px-0 hover:bg-transparent">
                            <Link to="/worker/dashboard">Refresh List</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {stats?.total === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-slate-50/50 rounded-3xl border-2 border-dashed">
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-300 shadow-sm">
                                    <FileText className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold">No active complaints found</p>
                                    <p className="text-sm text-muted-foreground">If you're facing labor issues, file a complaint to get assistance.</p>
                                </div>
                                <Button asChild className="rounded-full px-8 shadow-lg shadow-primary/20">
                                    <Link to="/worker/complaints/new">Start Filing Now</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {stats?.allComplaints?.slice(0, 5).map((complaint) => (
                                    <Link 
                                        key={complaint._id} 
                                        to={`/worker/complaints/${complaint._id}`}
                                        className="group block p-5 rounded-2xl border bg-white hover:border-primary/50 hover:shadow-md transition-all active:scale-[0.99]"
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="uppercase text-[10px] h-5">
                                                        {complaint.category.replace('_', ' ')}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground font-mono">#{complaint._id.substring(18)}</span>
                                                </div>
                                                <h4 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">{complaint.title}</h4>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(complaint.createdAt).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1 font-bold text-primary/70 uppercase">Status: {complaint.status.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 ${
                                                complaint.status === 'resolved' ? 'border-green-100 bg-green-50 text-green-600' : 
                                                complaint.status === 'rejected' ? 'border-red-100 bg-red-50 text-red-600' :
                                                'border-slate-100 bg-slate-50 text-slate-400'
                                            }`}>
                                                {complaint.status === 'resolved' ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default WorkerDashboard;
