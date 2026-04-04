import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobApi } from "@/api/jobApi";
import { 
  Users, 
  ChevronLeft, 
  Mail, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  FileText,
  BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const JobApplicantsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Fetch Job Details
    const { data: job, isLoading: jobLoading } = useQuery({
        queryKey: ['job', id],
        queryFn: async () => {
            const res = await jobApi.getJobById(id);
            return res.data.data;
        }
    });

    // Fetch Applicants
    const { data: applicants, isLoading: appsLoading } = useQuery({
        queryKey: ['job-applicants', id],
        queryFn: async () => {
            const res = await jobApi.getJobApplications(id);
            return res.data.data || [];
        }
    });

    const statusMutation = useMutation({
        mutationFn: ({ appId, status }) => jobApi.updateApplicationStatus(appId, status),
        onSuccess: () => {
            queryClient.invalidateQueries(['job-applicants', id]);
            toast.success("Application status updated!");
        }
    });

    if (jobLoading || appsLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="mt-4 font-bold text-lg text-muted-foreground">Retrieving Applicant Profiles...</p>
            </div>
        );
    }

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
                        <Badge variant="outline" className="uppercase font-bold px-3 bg-primary/5">
                            Applicant Review
                        </Badge>
                        <span className="text-sm text-muted-foreground font-mono">#{job._id.substring(18)}</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">{job.title}</h1>
                    <p className="text-muted-foreground text-lg italic">
                        Viewing {applicants?.length || 0} applications for this position.
                    </p>
                </div>
            </div>

            {/* Applicants List */}
            {applicants?.length === 0 ? (
                <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Users className="text-slate-300 w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold">No applications yet</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto mt-1">Check back later or promote your job posting.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {applicants.map((app) => (
                        <Card key={app._id} className="hover:shadow-lg transition-all border-slate-200/60 overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b flex flex-row justify-between items-center py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {app.workerName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{app.workerName}</CardTitle>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Mail className="w-3 h-3" /> {app.workerEmail}
                                        </div>
                                    </div>
                                </div>
                                <Badge className={`uppercase font-bold ${
                                    app.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                                    app.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 
                                    'bg-amber-100 text-amber-700'
                                }`}>
                                    {app.status}
                                </Badge>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">Relevant Experience</Label>
                                            <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{app.workerExperience}</p>
                                        </div>
                                        {app.additionalDetails && (
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">Additional Info</Label>
                                                <p className="text-sm text-muted-foreground italic">{app.additionalDetails}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col justify-between border-l md:pl-8 space-y-4">
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <Clock className="w-4 h-4" />
                                            Applied on {new Date(app.appliedDate).toLocaleDateString()}
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            {app.status === 'pending' ? (
                                                <>
                                                    <Button 
                                                        className="flex-1 bg-green-600 hover:bg-green-700 font-bold"
                                                        onClick={() => statusMutation.mutate({ appId: app._id, status: 'accepted' })}
                                                        disabled={statusMutation.isPending}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                                        Accept
                                                    </Button>
                                                    <Button 
                                                        variant="destructive" 
                                                        className="flex-1 font-bold"
                                                        onClick={() => statusMutation.mutate({ appId: app._id, status: 'rejected' })}
                                                        disabled={statusMutation.isPending}
                                                    >
                                                        <XCircle className="w-4 h-4 mr-2" />
                                                        Reject
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button 
                                                    variant="outline" 
                                                    className="w-full font-bold"
                                                    onClick={() => statusMutation.mutate({ appId: app._id, status: 'pending' })}
                                                    disabled={statusMutation.isPending}
                                                >
                                                    <AlertCircle className="w-4 h-4 mr-2" />
                                                    Revert to Pending
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JobApplicantsPage;
