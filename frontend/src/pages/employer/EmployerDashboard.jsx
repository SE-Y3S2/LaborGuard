import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobApi } from "@/api/jobApi";
import { 
  Building2, 
  Briefcase, 
  Users, 
  PlusCircle, 
  Search,
  MoreVertical,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Trash2,
  Edit,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EmployerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");

    // Query for employer's jobs
    const { data: jobs, isLoading: jobsLoading } = useQuery({
        queryKey: ['employer-jobs'],
        queryFn: async () => {
            const res = await jobApi.getJobs({ employerId: user.id });
            return res.data.data || [];
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => jobApi.deleteJob(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['employer-jobs']);
            toast.success("Job deleted successfully");
        }
    });

    const filteredJobs = jobs?.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (jobsLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="mt-4 font-bold text-lg text-muted-foreground">Syncing Employer Data...</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8">
                <div className="space-y-1">
                    <Badge variant="outline" className="text-primary font-bold uppercase tracking-wider bg-primary/5">
                        Employer Command Center
                    </Badge>
                    <h1 className="text-4xl font-extrabold tracking-tight">Manage Your Vacancies</h1>
                    <p className="text-muted-foreground text-lg">
                        Posted by <span className="font-bold text-slate-800">{user?.organizationName || user?.email.split('@')[0]}</span>
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20">
                        <Link to="/employer/jobs/new">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Post New Job
                        </Link>
                    </Button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-50 border-2 border-slate-200/60 transition-all hover:border-primary/40">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Active Listings</p>
                                <h3 className="text-3xl font-extrabold mt-1">{jobs?.length || 0}</h3>
                            </div>
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <Briefcase className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-50 border-2 border-slate-200/60 transition-all hover:border-blue-400/40">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Applicants</p>
                                <h3 className="text-3xl font-extrabold mt-1">--</h3>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Job Listings */}
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Active Postings
                    </h2>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search your jobs..." 
                            className="pl-10 rounded-full bg-slate-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {filteredJobs?.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold">No jobs posted yet</h3>
                        <p className="text-muted-foreground mt-1 max-w-xs mx-auto">Start by creating your first vacancy to find verified workers.</p>
                        <Button asChild className="mt-6" variant="outline">
                            <Link to="/employer/jobs/new">Create First Job</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredJobs?.map((job) => (
                            <Card key={job._id} className="group hover:border-primary/50 transition-all border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md">
                                <CardContent className="p-0 flex flex-col md:flex-row">
                                    <div 
                                        className="w-full md:w-32 h-32 md:h-auto bg-cover bg-center shrink-0" 
                                        style={{ backgroundImage: `url(${job.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop'})` }}
                                    />
                                    <div className="p-6 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2 h-5 text-[10px] uppercase font-bold">
                                                    {job.jobType}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground font-mono">#{job._id.substring(18)}</span>
                                            </div>
                                            <h4 className="text-xl font-extrabold group-hover:text-primary transition-colors">{job.title}</h4>
                                            <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    Pending Apps: --
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Hired: --
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 w-full md:w-auto">
                                            <Button variant="outline" className="flex-1 md:flex-none font-bold" onClick={() => navigate(`/employer/jobs/${job._id}`)}>
                                                Review Applicants
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10">
                                                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 p-2">
                                                    <DropdownMenuItem className="p-3 font-bold cursor-pointer" onClick={() => navigate(`/employer/jobs/${job._id}/edit`)}>
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit Posting
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        className="p-3 font-bold text-destructive hover:text-destructive cursor-pointer"
                                                        onClick={() => deleteMutation.mutate(job._id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete Vacancy
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployerDashboard;
