import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const getDashboardLink = () => {
        if (!user) return '/';
        if (user.role === 'admin') return '/admin/dashboard';
        if (user.role === 'worker') return '/worker/dashboard';
        if (user.role === 'employer') return '/employer/dashboard';
        if (user.role === 'lawyer') return '/legal/dashboard';
        if (user.role === 'ngo') return '/ngo/dashboard';
        return '/';
    };

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
                        <Link to="/worker/jobs" className="text-sm font-semibold transition-colors hover:text-primary">Job Board</Link>
                        <Link to="/community" className="text-sm font-semibold transition-colors hover:text-primary">Community</Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <Button variant="ghost" size="icon" className="relative group">
                                <Bell className="w-5 h-5" />
                                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-primary text-[10px]">3</Badge>
                            </Button>

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
                                        <Link to="/worker/profile">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>My Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/worker/complaints">
                                            <FileText className="mr-2 h-4 w-4" />
                                            <span>My Complaints</span>
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
                        <Link to="/worker/jobs" className="text-lg font-semibold px-2 py-1" onClick={() => setIsMenuOpen(false)}>Job Board</Link>
                        <Link to="/community" className="text-lg font-semibold px-2 py-1" onClick={() => setIsMenuOpen(false)}>Community</Link>
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
