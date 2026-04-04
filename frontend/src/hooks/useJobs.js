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

  // Create job (Employer/Admin)
  const createJobMutation = useMutation({
    mutationFn: (data) => jobApi.createJob(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["jobs"]);
      toast.success("Job vacancy posted successfully!");
      return res.data.data;
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to post job");
    },
  });

  // Update job
  const updateJobMutation = useMutation({
    mutationFn: ({ jobId, data }) => jobApi.updateJob(jobId, data),
    onSuccess: (res, { jobId }) => {
      queryClient.invalidateQueries(["job", jobId]);
      queryClient.invalidateQueries(["jobs"]);
      toast.success("Job updated successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update job");
    },
  });

  // Delete job
  const deleteJobMutation = useMutation({
    mutationFn: ({ jobId }) => jobApi.deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries(["jobs"]);
      toast.success("Job deleted successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete job");
    },
  });

  return {
    useGetJobs,
    useGetJob,
    createJob: createJobMutation,
    updateJob: updateJobMutation,
    deleteJob: deleteJobMutation,
  };
};
