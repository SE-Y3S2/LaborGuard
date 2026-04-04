import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobApi } from "@/api/jobApi";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const JobBoardPage = () => {
    const { user, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedJob, setSelectedJob] = useState(null);
    const [applyData, setApplyData] = useState({ experience: "", details: "" });

    // Queries
    const { data: jobs, isLoading: jobsLoading } = useQuery({
        queryKey: ['jobs'],
        queryFn: async () => {
            const res = await jobApi.getJobs();
            return res.data.data || [];
        }
    });

    const { data: myApplications } = useQuery({
        queryKey: ['my-applications'],
        queryFn: async () => {
            if (!isAuthenticated || user?.role !== 'worker') return [];
            const res = await jobApi.getMyApplications();
            return res.data.data || [];
        },
        enabled: isAuthenticated && user?.role === 'worker'
    });

    // Mutation
    const applyMutation = useMutation({
        mutationFn: ({ jobId, data }) => jobApi.applyForJob(jobId, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['my-applications']);
            toast.success("Application submitted successfully!");
            setSelectedJob(null);
            setApplyData({ experience: "", details: "" });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to apply");
        }
    });

    const hasApplied = (jobId) => myApplications?.some(app => app.jobId?._id === jobId);

    const filteredJobs = jobs?.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (jobsLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="mt-4 font-bold text-lg text-muted-foreground">Loading Opportunities...</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8">
                <div className="space-y-1">
                    <Badge variant="outline" className="text-primary font-bold uppercase tracking-wider bg-primary/5 mb-2">
                        Opportunity Board
                    </Badge>
                    <h1 className="text-4xl font-extrabold tracking-tight">Verified Job Postings</h1>
                    <p className="text-muted-foreground text-lg italic">
                        Find fair work with guaranteed wages and safe conditions.
                    </p>
                </div>
                
                <div className="flex w-full md:w-auto gap-2">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search jobs, titles, locations..." 
                            className="pl-10 h-11 rounded-full bg-slate-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {/* Jobs Grid */}
            {filteredJobs?.length === 0 ? (
                <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <AlertCircle className="text-slate-300 w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold">No matching vacancies found</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto mt-1">Try adjusting your search terms or check back later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredJobs?.map((job) => (
                        <Card key={job._id} className="flex flex-col h-full hover:shadow-2xl transition-all duration-300 group border-slate-200/60 overflow-hidden">
                            <div 
                                className="h-48 bg-cover bg-center relative" 
                                style={{ backgroundImage: `url(${job.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop'})` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <Badge className="bg-primary/95 text-white border-none mb-2">
                                        {job.jobType}
                                    </Badge>
                                    <h3 className="text-xl font-extrabold text-white leading-tight">
                                        {job.title}
                                    </h3>
                                </div>
                            </div>

                            <CardContent className="flex-1 p-6 space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-bold text-slate-700">
                                        <DollarSign className="w-3 h-3" />
                                        {job.wage.amount} {job.wage.currency} / {job.wage.frequency}
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-bold text-slate-700">
                                        <MapPin className="w-3 h-3" />
                                        {job.location?.city}
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                    {job.description}
                                </p>
                            </CardContent>

                            <CardFooter className="p-6 pt-0 mt-auto border-t">
                                {isAuthenticated && user?.role === 'worker' ? (
                                    hasApplied(job._id) ? (
                                        <Button disabled className="w-full bg-green-50 text-green-700 border-green-200 hover:bg-green-50 font-bold h-11">
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Applied
                                        </Button>
                                    ) : (
                                        <Button 
                                            className="w-full font-bold h-11 shadow-lg shadow-primary/20"
                                            onClick={() => setSelectedJob(job)}
                                        >
                                            Apply Now
                                        </Button>
                                    )
                                ) : (
                                    <Button variant="outline" className="w-full font-bold h-11" onClick={() => toast.error("Please login as a worker to apply")}>
                                        Sign in to Apply
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Application Dialog */}
            <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-extrabold">Apply for {selectedJob?.title}</DialogTitle>
                        <DialogDescription>
                            Let the employer know about your relevant experience and availability.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label className="font-bold">1. Your Relevant Experience</Label>
                            <Textarea 
                                placeholder="Tell us about your past work and skills..." 
                                className="min-h-[120px] bg-slate-50"
                                value={applyData.experience}
                                onChange={(e) => setApplyData({ ...applyData, experience: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold">2. Additional Details</Label>
                            <Textarea 
                                placeholder="Contact info, availability, or questions..." 
                                className="min-h-[80px] bg-slate-50"
                                value={applyData.details}
                                onChange={(e) => setApplyData({ ...applyData, details: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setSelectedJob(null)}>Cancel</Button>
                        <Button 
                            className="px-8 font-bold"
                            onClick={() => applyMutation.mutate({ jobId: selectedJob?._id, data: applyData })}
                            disabled={applyMutation.isPending}
                        >
                            {applyMutation.isPending ? "Submitting..." : "🚀 Submit Application"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default JobBoardPage;
