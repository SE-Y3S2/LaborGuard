import { useParams, useNavigate } from "react-router-dom";
import { useJobs } from "@/hooks/useJobs";
import { 
  Users, 
  ChevronLeft, 
  Mail, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  FileText,
  BadgeCheck,
  MessageSquare,
  Briefcase,
  UserCheck,
  ArrowRight,
  TrendingDown
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Spinner } from "@/components/common/Spinner";
import { Avatar, AvatarFallback } from "@/components/common/Avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const JobApplicantsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { useGetJob, useGetJobApplications, updateApplicationStatus } = useJobs();

    const { data: job, isLoading: jobLoading } = useGetJob(id);
    const { data: applicants, isLoading: appsLoading } = useGetJobApplications(id);

    const handleStatusUpdate = async (appId, status) => {
        try {
            await updateApplicationStatus.mutateAsync({ appId, status, jobId: id });
        } catch (error) {
            // Handled in hook
        }
    };

    if (jobLoading || appsLoading) return (
        <div className="p-32 flex flex-col items-center">
            <Spinner size="lg" />
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">SCANNING VERIFIED PROFILES...</p>
        </div>
    );

    return (
        <div className="space-y-12 animate-fade-in pb-20 mt-4">
            {/* Navigation & Header */}
            <div className="flex justify-between items-center px-4">
                <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full font-black uppercase tracking-widest text-[9px] text-slate-400 hover:text-primary transition-all">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Command Center
                </Button>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Tracking Code:</span>
                    <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[10px] tracking-widest uppercase py-1">APPS-REVIEW-v3</Badge>
                </div>
            </div>

            <header className="space-y-3 px-4">
                <Badge variant="outline" className="text-primary border-primary/20 font-black uppercase tracking-[0.2em] text-[9px] px-4 py-1.5 rounded-full bg-primary/5">Talent Acquisition</Badge>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                            Review <br />
                            <span className="text-primary italic">Applications.</span>
                        </h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <Briefcase className="h-4 w-4" /> 
                             {job?.title}
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Applicant List */}
            <div className="space-y-8 px-2">
                {applicants?.length === 0 ? (
                    <div className="p-32 bg-slate-50 rounded-[56px] border-2 border-dashed border-slate-100 flex flex-col items-center text-center space-y-6">
                        <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-slate-200 shadow-sm border border-slate-100">
                            <Users className="h-10 w-10" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-black text-slate-800 tracking-tight">No Candidates have Applied Yet.</p>
                            <p className="text-sm font-bold text-slate-400 max-w-xs leading-relaxed uppercase italic">Our engine is currently promoting this listing to verified workers in your region.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {applicants.map((app) => (
                            <div key={app._id} className="bg-white p-8 md:p-12 rounded-[56px] border border-slate-100 shadow-xl shadow-slate-200/20 group hover:border-primary/20 transition-all duration-500 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-20 h-full bg-slate-50/50 -mr-10 -skew-x-12 opacity-0 group-hover:opacity-100 transition-all" />
                                
                                <div className="relative z-10 flex flex-col lg:flex-row gap-12">
                                    {/* Left: Bio & Identity */}
                                    <div className="lg:w-1/3 space-y-8">
                                        <div className="flex items-center gap-5">
                                            <Avatar className="h-20 w-20 ring-8 ring-slate-50 shadow-inner">
                                                <AvatarFallback className="bg-primary/20 text-primary text-2xl font-black uppercase">{app.workerName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 leading-tight">{app.workerName}</h3>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <BadgeCheck className="h-4 w-4 text-blue-500" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identity Verified</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="p-5 bg-slate-50 rounded-3xl space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Communication</p>
                                                <p className="text-sm font-bold text-slate-700 truncate">{app.workerEmail}</p>
                                            </div>
                                            <div className="flex items-center gap-3 ml-2">
                                                <Clock className="h-4 w-4 text-primary" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">File Date: {new Date(app.appliedDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Center: Experience & Narrative */}
                                    <div className="flex-1 space-y-8 lg:px-10 lg:border-x lg:border-slate-100">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <TrendingDown className="h-4 w-4 text-primary" />
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Experience Statement</h4>
                                            </div>
                                            <p className="text-sm font-bold text-slate-600 leading-relaxed whitespace-pre-wrap italic">"{app.workerExperience}"</p>
                                        </div>

                                        {app.additionalDetails && (
                                            <div className="space-y-2">
                                                <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Notes & Availability</h4>
                                                <p className="text-xs font-bold text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">{app.additionalDetails}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Actions & Status */}
                                    <div className="lg:w-1/4 flex flex-col justify-between gap-8 pt-4">
                                        <div className="space-y-2 text-right lg:text-left">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Application Status</p>
                                            <Badge className={cn(
                                                "px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]",
                                                app.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                                                app.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                                                'bg-amber-100 text-amber-700'
                                            )}>
                                                {app.status}
                                            </Badge>
                                        </div>

                                        <div className="space-y-3">
                                            {app.status === 'pending' ? (
                                                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                                                    <Button 
                                                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[9px] bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100"
                                                        onClick={() => handleStatusUpdate(app._id, 'accepted')}
                                                        disabled={updateApplicationStatus.isPending}
                                                    >
                                                        <UserCheck className="h-4 w-4 mr-2" />
                                                        Accept & Hire
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[9px] text-red-500 hover:bg-red-50"
                                                        onClick={() => handleStatusUpdate(app._id, 'rejected')}
                                                        disabled={updateApplicationStatus.isPending}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Decline
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button 
                                                    variant="outline" 
                                                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[9px] border-2 border-slate-100"
                                                    onClick={() => handleStatusUpdate(app._id, 'pending')}
                                                    disabled={updateApplicationStatus.isPending}
                                                >
                                                    <AlertCircle className="h-4 w-4 mr-2" />
                                                    Revert to Pending
                                                </Button>
                                            )}
                                            
                                            <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[9px] border-2 border-primary/10 text-primary hover:bg-primary/5 transition-all group">
                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                Direct Message
                                                <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobApplicantsPage;
