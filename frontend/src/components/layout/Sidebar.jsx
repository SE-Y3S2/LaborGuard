import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Calendar, 
  Briefcase, 
  Users, 
  MessageSquare, 
  User, 
  ShieldAlert, 
  Registry,
  BarChart3,
  Search,
  MessageCircle,
  FileBarChart,
  Settings,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../common/Button";

const Sidebar = ({ className }) => {
    const { user } = useAuth();
    const location = useLocation();

    const getNavLinks = () => {
        const role = user?.role;
        
        const links = {
            worker: [
                { title: "Dashboard", href: "/worker/dashboard", icon: LayoutDashboard },
                { title: "My Complaints", href: "/worker/complaints", icon: FileText },
                { title: "File Complaint", href: "/worker/complaints/new", icon: PlusCircle },
                { title: "Appointments", href: "/worker/appointments", icon: Calendar },
                { title: "Job Board", href: "/worker/jobs", icon: Briefcase },
                { title: "Community", href: "/community", icon: Users },
                { title: "Messages", href: "/messages", icon: MessageSquare },
            ],
            employer: [
                { title: "Dashboard", href: "/employer/dashboard", icon: LayoutDashboard },
                { title: "Post Job", href: "/employer/jobs/new", icon: PlusCircle },
                { title: "My Listings", href: "/employer/jobs", icon: Briefcase },
                { title: "Community", href: "/community", icon: Users },
                { title: "Messages", href: "/messages", icon: MessageSquare },
            ],
            lawyer: [
                { title: "Dashboard", href: "/legal/dashboard", icon: LayoutDashboard },
                { title: "My Cases", href: "/legal/cases", icon: ShieldCheck },
                { title: "Appointments", href: "/legal/appointments", icon: Calendar },
                { title: "Community", href: "/community", icon: Users },
                { title: "Messages", href: "/messages", icon: MessageSquare },
            ],
            ngo: [
                { title: "NGO Dashboard", href: "/ngo/dashboard", icon: LayoutDashboard },
                { title: "Community", href: "/community", icon: Users },
                { title: "Messages", href: "/messages", icon: MessageSquare },
                { title: "Job Board", href: "/worker/jobs", icon: Briefcase },
            ],
            admin: [
                { title: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
                { title: "User Management", href: "/admin/users", icon: Users },
                { title: "All Complaints", href: "/admin/complaints", icon: FileText },
                { title: "All Appointments", href: "/admin/appointments", icon: Calendar },
                { title: "Officer Registry", href: "/admin/registry", icon: ShieldAlert },
                { title: "Content Reports", href: "/admin/reports", icon: AlertCircle },
                { title: "Community", href: "/community", icon: Users },
            ]
        };

        return links[role] || [];
    };

    const navLinks = getNavLinks();

    return (
        <aside className={cn("flex flex-col w-64 bg-slate-900 text-slate-300 h-full border-r border-slate-800 shadow-xl", className)}>
            <div className="p-6">
                <Link to="/" className="flex items-center space-x-2">
                    <span className="text-xl font-black tracking-tighter text-white">
                        Labor<span className="text-primary">Guard</span>
                    </span>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-1 py-4 overflow-y-auto custom-scrollbar">
                {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.href;
                    
                    return (
                        <Link
                            key={link.href}
                            to={link.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group",
                                isActive 
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                                    : "hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Icon className={cn(
                                "w-4 h-4 transition-transform group-hover:scale-110",
                                isActive ? "text-white" : "text-slate-400 group-hover:text-primary"
                            )} />
                            {link.title}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black uppercase shadow-inner">
                        {user?.firstName?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-black text-white truncate uppercase tracking-wider">{user?.firstName} {user?.lastName}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter truncate">{user?.role}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
