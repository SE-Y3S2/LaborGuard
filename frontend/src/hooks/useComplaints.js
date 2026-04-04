import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complaintApi } from "@/api/complaintApi";
import { toast } from "sonner";

export const useComplaints = (id) => {
  const queryClient = useQueryClient();

  // Fetch all complaints with optional filters
  const useGetComplaints = (params) => {
    return useQuery({
      queryKey: ["complaints", params],
      queryFn: async () => {
        const res = await complaintApi.getAllComplaints(params);
        return res.data.data || [];
      },
      placeholderData: (prev) => prev,
    });
  };

  // Fetch only my complaints (worker)
  const useGetMyComplaints = (params) => {
    return useQuery({
      queryKey: ["my-complaints", params],
      queryFn: async () => {
        const res = await complaintApi.getMyComplaints(params);
        return res.data.data || [];
      },
    });
  };

  // Fetch a single complaint by ID
  const useGetComplaint = (complaintId) => {
    return useQuery({
      queryKey: ["complaint", complaintId || id],
      queryFn: async () => {
        const res = await complaintApi.getComplaintById(complaintId || id);
        return res.data.data;
      },
      enabled: !!(complaintId || id),
    });
  };

  // Create a new complaint
  const createComplaintMutation = useMutation({
    mutationFn: (data) => complaintApi.createComplaint(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["my-complaints"]);
      toast.success("Complaint filed successfully!");
      return res.data.data;
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to file complaint");
    },
  });

  // Update complaint status (Lawyer/Admin)
  const updateStatusMutation = useMutation({
    mutationFn: ({ complaintId, status, reason }) => 
      complaintApi.updateComplaintStatus(complaintId, { status, reason }),
    onSuccess: (res, { complaintId }) => {
      queryClient.invalidateQueries(["complaint", complaintId]);
      queryClient.invalidateQueries(["complaints"]);
      toast.success(`Complaint status updated to ${res.data.data.status}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update status");
    },
  });

  // Assign complaint (Admin)
  const assignComplaintMutation = useMutation({
    mutationFn: ({ complaintId, officerId }) => 
      complaintApi.assignComplaint(complaintId, officerId),
    onSuccess: (res, { complaintId }) => {
      queryClient.invalidateQueries(["complaint", complaintId]);
      queryClient.invalidateQueries(["complaints"]);
      toast.success("Case assigned to legal officer");
    },
  });

  // Upload attachment
  const uploadAttachmentMutation = useMutation({
    mutationFn: ({ complaintId, file }) => 
      complaintApi.uploadAttachment(complaintId, file),
    onSuccess: (res, { complaintId }) => {
      queryClient.invalidateQueries(["complaint", complaintId]);
      toast.success("Attachment uploaded successfully");
    },
  });

  // Download Report (PDF)
  const downloadReport = async (complaintId) => {
    try {
      const res = await complaintApi.downloadReport(complaintId || id);
      // Logic for handling binary response and triggering download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `complaint-${complaintId || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success("Generating report...");
    } catch (err) {
      toast.error("Failed to generate report");
    }
  };

  // Fetch my appointments (worker/lawyer)
  const useGetMyAppointments = (params) => {
    return useQuery({
      queryKey: ["appointments", "my", params],
      queryFn: async () => {
        const res = await complaintApi.getMyAppointments(params);
        return res.data.data || [];
      },
    });
  };

  // Confirm appointment (Admin/Legal)
  const confirmAppointmentMutation = useMutation({
    mutationFn: ({ appointmentId, data }) => complaintApi.confirmAppointment(appointmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["appointments"]);
      toast.success("Appointment confirmed");
    },
  });

  // Reschedule appointment
  const rescheduleAppointmentMutation = useMutation({
    mutationFn: ({ appointmentId, data }) => complaintApi.rescheduleAppointment(appointmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["appointments"]);
      toast.success("Appointment rescheduled");
    },
  });

  // Cancel appointment
  const cancelAppointmentMutation = useMutation({
    mutationFn: ({ appointmentId, reason }) => complaintApi.cancelAppointment(appointmentId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries(["appointments"]);
      toast.success("Appointment cancelled");
    },
  });

  return {
    useGetComplaints,
    useGetMyComplaints,
    useGetComplaint,
    useGetMyAppointments,
    createComplaint: createComplaintMutation,
    updateStatus: updateStatusMutation,
    assignComplaint: assignComplaintMutation,
    uploadAttachment: uploadAttachmentMutation,
    downloadReport,
    confirmAppointment: confirmAppointmentMutation,
    rescheduleAppointment: rescheduleAppointmentMutation,
    cancelAppointment: cancelAppointmentMutation,
  };
};
