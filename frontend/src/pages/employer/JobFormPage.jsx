import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobApi } from "@/api/jobApi";
import { 
  Briefcase, 
  DollarSign, 
  MapPin, 
  Type, 
  Image as ImageIcon,
  CheckCircle2,
  ChevronLeft,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const jobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000),
  wageAmount: z.preprocess((val) => Number(val), z.number().min(0, "Wage must be positive")),
  wageFrequency: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'yearly', 'per-task']),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'temporary', 'freelance']),
  city: z.string().min(2, "City is required"),
  address: z.string().min(5, "Address is required"),
  compliesWithMinimumWage: z.boolean().default(true),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  status: z.enum(['open', 'closed', 'filled', 'pending_review']).default('open')
});

const JobFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEdit = !!id;

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            wageFrequency: 'daily',
            jobType: 'contract',
            compliesWithMinimumWage: true,
            status: 'open'
        }
    });

    // Fetch job if editing
    const { data: job, isLoading: jobLoading } = useQuery({
        queryKey: ['job', id],
        queryFn: async () => {
            const res = await jobApi.getJobById(id);
            return res.data.data;
        },
        enabled: isEdit
    });

    useEffect(() => {
        if (job) {
            reset({
                title: job.title,
                description: job.description,
                wageAmount: job.wage.amount,
                wageFrequency: job.wage.frequency,
                jobType: job.jobType,
                city: job.location.city,
                address: job.location.address,
                compliesWithMinimumWage: job.compliesWithMinimumWage,
                imageUrl: job.imageUrl,
                status: job.status
            });
        }
    }, [job, reset]);

    const mutation = useMutation({
        mutationFn: (data) => {
            const payload = {
                title: data.title,
                description: data.description,
                wage: {
                    amount: data.wageAmount,
                    frequency: data.wageFrequency,
                    currency: 'LKR'
                },
                location: {
                    city: data.city,
                    address: data.address,
                    country: 'Sri Lanka'
                },
                jobType: data.jobType,
                compliesWithMinimumWage: data.compliesWithMinimumWage,
                imageUrl: data.imageUrl || undefined,
                status: data.status
            };
            return isEdit ? jobApi.updateJob(id, payload) : jobApi.createJob(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['employer-jobs']);
            toast.success(isEdit ? "Job updated successfully!" : "Job posted successfully!");
            navigate("/employer/dashboard");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to save job");
        }
    });

    if (isEdit && jobLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="mt-4 font-bold text-lg text-muted-foreground">Loading Job Details...</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-fade-in">
            <Button variant="ghost" onClick={() => navigate(-1)} className="group mb-4">
                <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </Button>

            <header className="space-y-2 border-b pb-8">
                <h1 className="text-4xl font-extrabold tracking-tight">{isEdit ? 'Edit Vacancy' : 'Post a New Vacancy'}</h1>
                <p className="text-muted-foreground text-lg italic">
                    {isEdit ? 'Update your job listing details.' : 'Fill in the information to find qualified informal workers.'}
                </p>
            </header>

            <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-8">
                <Card className="shadow-lg border-2">
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-primary" />
                            Job Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Job Title</Label>
                            <Input id="title" placeholder="e.g., Construction Laborer, Domestic Helper" {...register("title")} className={errors.title ? "border-destructive" : ""} />
                            {errors.title && <p className="text-xs text-destructive font-bold">{errors.title.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="jobType">Job Type</Label>
                                <Select value={watch("jobType")} onValueChange={(val) => setValue("jobType", val)}>
                                    <SelectTrigger id="jobType" className={errors.jobType ? "border-destructive" : ""}>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full-time">Full-time</SelectItem>
                                        <SelectItem value="part-time">Part-time</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                        <SelectItem value="temporary">Temporary</SelectItem>
                                        <SelectItem value="freelance">Freelance</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.jobType && <p className="text-xs text-destructive font-bold">{errors.jobType.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={watch("status")} onValueChange={(val) => setValue("status", val)}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                        <SelectItem value="filled">Filled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Full Description</Label>
                            <Textarea 
                                id="description" 
                                placeholder="Describe the roles, responsibilities, and requirements..." 
                                className={`min-h-[150px] bg-slate-50 ${errors.description ? "border-destructive" : ""}`}
                                {...register("description")}
                            />
                            {errors.description && <p className="text-xs text-destructive font-bold">{errors.description.message}</p>}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="shadow-md border-2">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <DollarSign className="w-4 h-4 text-primary" />
                                Compensation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="wageAmount">Wage Amount (LKR)</Label>
                                <Input id="wageAmount" type="number" placeholder="5000" {...register("wageAmount")} className={errors.wageAmount ? "border-destructive" : ""} />
                                {errors.wageAmount && <p className="text-xs text-destructive font-bold">{errors.wageAmount.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="wageFrequency">Payment Frequency</Label>
                                <Select value={watch("wageFrequency")} onValueChange={(val) => setValue("wageFrequency", val)}>
                                    <SelectTrigger id="wageFrequency">
                                        <SelectValue placeholder="Frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="per-task">Per Task</SelectItem>
                                        <SelectItem value="hourly">Hourly</SelectItem>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox 
                                    id="wageCompliance" 
                                    checked={watch("compliesWithMinimumWage")}
                                    onCheckedChange={(checked) => setValue("compliesWithMinimumWage", checked === true)}
                                />
                                <Label htmlFor="wageCompliance" className="text-xs font-semibold italic">Complies with minimum wage standards</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border-2">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MapPin className="w-4 h-4 text-primary" />
                                Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" placeholder="e.g. Colombo" {...register("city")} className={errors.city ? "border-destructive" : ""} />
                                {errors.city && <p className="text-xs text-destructive font-bold">{errors.city.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Work Address</Label>
                                <Input id="address" placeholder="e.g. 123, Galle Road" {...register("address")} className={errors.address ? "border-destructive" : ""} />
                                {errors.address && <p className="text-xs text-destructive font-bold">{errors.address.message}</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-md border-2">
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-primary" />
                            Visual Presence
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">Job Image URL (Optional)</Label>
                            <Input id="imageUrl" placeholder="https://images.unsplash.com/..." {...register("imageUrl")} className={errors.imageUrl ? "border-destructive" : ""} />
                            {errors.imageUrl && <p className="text-xs text-destructive font-bold">{errors.imageUrl.message}</p>}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4 pt-10">
                    <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => navigate(-1)}>Cancel</Button>
                    <Button type="submit" className="flex-[2] h-12 text-lg font-bold" disabled={mutation.isPending}>
                        {mutation.isPending ? "Syncing..." : isEdit ? "🚀 Update Vacancy" : "🚀 Publish Vacancy"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default JobFormPage;
