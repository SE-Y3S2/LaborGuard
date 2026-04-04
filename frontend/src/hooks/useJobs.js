import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobApi } from "@/api/jobApi";
import { toast } from "sonner";

export const useJobs = (id) => {
  const queryClient = useQueryClient();

  // Fetch all jobs with filters
  const useGetJobs = (params) => {
    return useQuery({
      queryKey: ["jobs", params],
      queryFn: async () => {
        const res = await jobApi.getJobs(params);
        return res.data.data || [];
      },
      placeholderData: (prev) => prev,
    });
  };

  // Fetch single job
  const useGetJob = (jobId) => {
    return useQuery({
      queryKey: ["job", jobId || id],
      queryFn: async () => {
        const res = await jobApi.getJobById(jobId || id);
        return res.data.data;
      },
      enabled: !!(jobId || id),
    });
  };

  // Fetch applications for a job (Employer)
  const useGetJobApplications = (jobId) => {
    return useQuery({
      queryKey: ["job-applicants", jobId],
      queryFn: async () => {
        const res = await jobApi.getJobApplications(jobId);
        return res.data.data || [];
      },
      enabled: !!jobId,
    });
  };

  // Fetch my applications (Worker)
  const useGetMyApplications = () => {
    return useQuery({
      queryKey: ["my-applications"],
      queryFn: async () => {
        const res = await jobApi.getMyApplications();
        return res.data.data || [];
      },
    });
  };

  // Apply for job
  const applyForJobMutation = useMutation({
    mutationFn: ({ jobId, data }) => jobApi.applyForJob(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["my-applications"]);
      toast.success("Application submitted successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to apply");
    },
  });

  // Update application status (Employer)
  const updateApplicationStatusMutation = useMutation({
    mutationFn: ({ appId, status }) => jobApi.updateApplicationStatus(appId, status),
    onSuccess: (res, { jobId }) => {
      queryClient.invalidateQueries(["job-applicants", jobId]);
      toast.success("Application status updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update status");
    },
  });

  return {
    useGetJobs,
    useGetJob,
    useGetJobApplications,
    useGetMyApplications,
    createJob: createJobMutation,
    updateJob: updateJobMutation,
    deleteJob: deleteJobMutation,
    applyForJob: applyForJobMutation,
    updateApplicationStatus: updateApplicationStatusMutation,
  };
};
