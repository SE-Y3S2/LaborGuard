import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance";
import { 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  Trash2, 
  CheckCircle, 
  XCircle,
  MoreVertical,
  Filter
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
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const AdminDashboard = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [filterPending, setFilterPending] = useState(false);

    // Fetch users
    const { data: userData, isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const res = await axiosInstance.get('/admin/users');
            return res.data.data.users || [];
        }
    });

    // Mutations
    const approveMutation = useMutation({
        mutationFn: (userId) => axiosInstance.put(`/admin/users/${userId}/approve`),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users']);
            toast.success("User approved successfully");
        }
    });

    const roleMutation = useMutation({
        mutationFn: ({ userId, role }) => axiosInstance.put(`/admin/users/${userId}/role`, { role }),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users']);
            toast.success("Role updated successfully");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (userId) => axiosInstance.delete(`/admin/users/${userId}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users']);
            toast.success("User deleted successfully");
        }
    });

    const statusMutation = useMutation({
        mutationFn: ({ userId, isActive }) => axiosInstance.put(`/admin/users/${userId}/status`, { isActive }),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users']);
            toast.success("Status updated successfully");
        }
    });

    const filteredUsers = filterPending 
        ? userData?.filter(u => !u.isApproved && u.role !== 'worker' && u.role !== 'admin') 
        : userData;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="mt-4 font-bold text-lg text-muted-foreground">Accessing Governance Portal...</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-8">
                <div className="space-y-1">
                    <Badge variant="outline" className="text-destructive font-bold uppercase tracking-wider bg-destructive/5 mb-2">
                        System Governance
                    </Badge>
                    <h1 className="text-4xl font-extrabold tracking-tight">Platform Administration</h1>
                    <p className="text-muted-foreground text-lg">
                        Manage users, approve roles, and monitor system health.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        variant={filterPending ? "default" : "outline"} 
                        onClick={() => setFilterPending(!filterPending)}
                        className="rounded-full"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        {filterPending ? "Showing Pending" : "Filter Pending"}
                    </Button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold">{userData?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Pending Approval</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-amber-500">
                            {userData?.filter(u => !u.isApproved && u.role !== 'worker').length || 0}
                        </div>
                    </CardContent>
                </Card>
                {/* More stats could go here */}
            </div>

            {/* User Management Table */}
            <Card>
                <CardHeader>
                    <CardTitle>User Directory</CardTitle>
                    <CardDescription>Manage platform access and role assignments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User Profile</TableHead>
                                    <TableHead>Verification</TableHead>
                                    <TableHead>Platform Role</TableHead>
                                    <TableHead>Approval</TableHead>
                                    <TableHead className="text-right">Management</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers?.map((u) => (
                                        <TableRow key={u._id}>
                                            <TableCell>
                                                <div className="font-bold">{u.firstName} {u.lastName}</div>
                                                <div className="text-xs text-muted-foreground">{u.email}</div>
                                                <div className="text-xs text-primary font-medium">{u.phone}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <div className={`w-2 h-2 rounded-full ${u.isEmailVerified ? 'bg-green-500' : 'bg-red-500'}`} />
                                                        Email {u.isEmailVerified ? 'OK' : 'Pending'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <div className={`w-2 h-2 rounded-full ${u.isApproved ? 'bg-green-500' : 'bg-amber-500'}`} />
                                                        Role {u.isApproved ? 'Approved' : 'Awaiting'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Select 
                                                    defaultValue={u.role} 
                                                    onValueChange={(val) => roleMutation.mutate({ userId: u._id, role: val })}
                                                >
                                                    <SelectTrigger className="w-[120px] h-8 text-xs font-semibold">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="worker">Worker</SelectItem>
                                                        <SelectItem value="employer">Employer</SelectItem>
                                                        <SelectItem value="lawyer">Lawyer</SelectItem>
                                                        <SelectItem value="ngo">NGO</SelectItem>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                {u.isApproved ? (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Verified ✓</Badge>
                                                ) : (
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="h-8 text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100"
                                                        onClick={() => approveMutation.mutate(u._id)}
                                                    >
                                                        Approve
                                                    </Button>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        onClick={() => statusMutation.mutate({ userId: u._id, isActive: !u.isActive })}
                                                        title={u.isActive ? "Deactivate" : "Activate"}
                                                    >
                                                        {u.isActive ? <XCircle className="w-4 h-4 text-slate-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                                                    </Button>
                                                    <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        className="text-destructive"
                                                        onClick={() => {
                                                            if (window.confirm("Delete user permanently?")) {
                                                                deleteMutation.mutate(u._id);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;
