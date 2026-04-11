import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationStore } from '@/store/notificationStore';
import { 
  Menu, 
  X, 
  LogOut, 
  User, 
  Bell, 
  Globe, 
  ChevronDown,
  LayoutDashboard,
  Briefcase,
  FileText,
  MessageSquare,
  CheckCheck,
  Clock,
  Users,
  Gavel,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Badge } from '@/components/common/Badge';
import { cn } from '@/lib/utils';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    // Real notification integration
    const { useGetUnreadCount, useGetNotifications, markAllAsRead } = useNotifications();
    const { data: unreadCount } = useGetUnreadCount();
    const { data: notifications } = useGetNotifications();
    const storeUnread = useNotificationStore((s) => s.unreadCount);

    // Use live count from API or store (whichever is higher — store may have real-time increments)
    const displayUnread = Math.max(unreadCount || 0, storeUnread || 0);

    const getDashboardLink = () => {
        if (!user) return '/';
        if (user.role === 'admin') return '/admin/dashboard';
        if (user.role === 'worker') return '/worker/dashboard';
        if (user.role === 'employer') return '/employer/dashboard';
        if (user.role === 'lawyer') return '/legal/dashboard';
        if (user.role === 'ngo') return '/ngo/dashboard';
        return '/';
    };

    const getProfileLink = () => {
        if (user?.role === 'worker') return '/worker/profile';
        // Other roles don't have dedicated profile pages yet — go to dashboard
        return getDashboardLink();
    };

    const getComplaintsLink = () => {
        if (user?.role === 'worker') return '/worker/complaints';
        if (user?.role === 'lawyer') return '/legal/cases';
        if (user?.role === 'admin') return '/admin/dashboard?tab=users';
        if (user?.role === 'ngo') return '/ngo/cases';
        return '/community';
    };

    const getComplaintsLabel = () => {
        if (user?.role === 'worker') return 'My Complaints';
        if (user?.role === 'lawyer') return 'Case Docket';
        if (user?.role === 'ngo') return 'Investigations';
        if (user?.role === 'admin') return 'User Registry';
        if (user?.role === 'employer') return 'My Job Listings';
        return 'Dashboard';
    };

    const getComplaintsIcon = () => {
        if (user?.role === 'lawyer') return Gavel;
        if (user?.role === 'ngo') return ShieldAlert;
        if (user?.role === 'admin') return Users;
        if (user?.role === 'employer') return Briefcase;
        return FileText;
    };

    const ComplaintsIcon = getComplaintsIcon();

    // Recent notifications (max 5)
    const recentNotifications = Array.isArray(notifications) ? notifications.slice(0, 5) : [];

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-6 md:px-10 max-w-7xl mx-auto">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-extrabold tracking-tighter text-foreground">
                            Labor<span className="text-primary">Guard</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex gap-6">
                        <Link to="/" className="text-sm font-semibold transition-colors hover:text-primary">Home</Link>
                        <Link to="/jobs" className="text-sm font-semibold transition-colors hover:text-primary">Job Board</Link>
                        <Link to="/community" className="text-sm font-semibold transition-colors hover:text-primary">Community</Link>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <>
                            {/* Messages Link */}
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="relative group"
                                onClick={() => navigate('/messages')}
                            >
                                <MessageSquare className="w-5 h-5" />
                            </Button>

                            {/* Notification Bell — real data */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative group">
                                        <Bell className="w-5 h-5" />
                                        {displayUnread > 0 && (
                                            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 p-0 flex items-center justify-center bg-primary text-[9px] font-black text-white rounded-full shadow-lg shadow-primary/30 animate-in zoom-in duration-300">
                                                {displayUnread > 99 ? '99+' : displayUnread}
                                            </Badge>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-80 p-0 rounded-2xl border border-slate-100 shadow-2xl" align="end" forceMount>
                                    <div className="p-4 border-b flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-black text-slate-900">Notifications</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {displayUnread > 0 ? `${displayUnread} unread` : 'All caught up'}
                                            </p>
                                        </div>
                                        {displayUnread > 0 && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-[10px] font-bold text-primary hover:bg-primary/5 uppercase tracking-widest"
                                                onClick={() => markAllAsRead.mutate()}
                                            >
                                                <CheckCheck className="h-3 w-3 mr-1" />
                                                Read All
                                            </Button>
                                        )}
                                    </div>

                                    <div className="max-h-80 overflow-y-auto">
                                        {recentNotifications.length > 0 ? (
                                            recentNotifications.map((n, i) => (
                                                <div 
                                                    key={n._id || i} 
                                                    className={cn(
                                                        "p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer",
                                                        !n.isRead && "bg-primary/5"
                                                    )}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={cn(
                                                            "h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                                            n.type === 'message' ? 'bg-blue-100 text-blue-600' :
                                                            n.type === 'complaint' ? 'bg-amber-100 text-amber-600' :
                                                            'bg-slate-100 text-slate-500'
                                                        )}>
                                                            {n.type === 'message' ? <MessageSquare className="h-4 w-4" /> :
                                                             n.type === 'complaint' ? <FileText className="h-4 w-4" /> :
                                                             <Bell className="h-4 w-4" />}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-bold text-slate-800 line-clamp-1">{n.title}</p>
                                                            <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{n.body}</p>
                                                            <div className="flex items-center gap-1 mt-1.5 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                                                                <Clock className="h-3 w-3" />
                                                                {new Date(n.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        {!n.isRead && (
                                                            <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-12 text-center">
                                                <Bell className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                                                <p className="text-xs font-bold text-slate-400">No notifications yet</p>
                                            </div>
                                        )}
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Profile Dropdown — role-aware */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-primary/10 border p-0">
                                        <span className="text-primary font-bold">
                                            {user?.firstName?.charAt(0)}
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-bold leading-none">{user?.firstName} {user?.lastName}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                            <Badge variant="outline" className="w-fit mt-1 text-[9px] font-bold uppercase tracking-widest">
                                                {user?.role}
                                            </Badge>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link to={getDashboardLink()}>
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to={getProfileLink()}>
                                            <User className="mr-2 h-4 w-4" />
                                            <span>My Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to={getComplaintsLink()}>
                                            <ComplaintsIcon className="mr-2 h-4 w-4" />
                                            <span>{getComplaintsLabel()}</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/messages">
                                            <MessageSquare className="mr-2 h-4 w-4" />
                                            <span>Messages</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/community">
                                            <Globe className="mr-2 h-4 w-4" />
                                            <span>Community</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" asChild className="hidden sm:inline-flex font-bold">
                                <Link to="/login">Sign In</Link>
                            </Button>
                            <Button asChild className="rounded-full px-6 font-bold">
                                <Link to="/register">Join Platform</Link>
                            </Button>
                        </div>
                    )}

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="md:hidden" 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X /> : <Menu />}
                    </Button>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t bg-background p-4 space-y-4 animate-in slide-in-from-top duration-300">
                    <nav className="flex flex-col gap-4">
                        <Link to="/" className="text-lg font-semibold px-2 py-1" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        <Link to="/jobs" className="text-lg font-semibold px-2 py-1" onClick={() => setIsMenuOpen(false)}>Job Board</Link>
                        <Link to="/community" className="text-lg font-semibold px-2 py-1" onClick={() => setIsMenuOpen(false)}>Community</Link>
                        {isAuthenticated && (
                            <>
                                <Link to="/messages" className="text-lg font-semibold px-2 py-1" onClick={() => setIsMenuOpen(false)}>Messages</Link>
                                <Link to={getDashboardLink()} className="text-lg font-semibold px-2 py-1" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                            </>
                        )}
                        <DropdownMenuSeparator />
                        {!isAuthenticated && (
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <Button variant="outline" asChild onClick={() => setIsMenuOpen(false)}>
                                    <Link to="/login">Sign In</Link>
                                </Button>
                                <Button asChild onClick={() => setIsMenuOpen(false)}>
                                    <Link to="/register">Sign Up</Link>
                                </Button>
                            </div>
                        )}
                    </nav>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
