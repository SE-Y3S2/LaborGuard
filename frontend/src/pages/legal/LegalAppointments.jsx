import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User as UserIcon, 
  Video, 
  MessageSquare, 
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  LayoutGrid,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Target
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Input } from "@/components/common/Input";
import { Spinner } from "@/components/common/Spinner";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";

const LegalAppointments = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");

    // Mock data for appointments
    const { data: appointments, isLoading } = useQuery({
        queryKey: ['legal-appointments'],
        queryFn: async () => {
            // Placeholder: Backend integration for legal appointments coming soon
            return [
                {
                    _id: 'a1',
                    workerName: "Sunil Perera",
                    type: "Legal Consultation",
                    status: "confirmed",
                    date: new Date(Date.now() + 86400000).toISOString(),
                    location: "Virtual Meeting (Video)",
                    caseId: "C12948"
                },
                {
                    _id: 'a2',
                    workerName: "Kumari de Silva",
                    type: "Evidence Review",
                    status: "pending",
                    date: new Date(Date.now() + 172800000).toISOString(),
                    location: "Colombo Regional Office",
                    caseId: "C84721"
                }
            ];
        }
    });

    if (isLoading) return (
        <div className="p-32 flex flex-col items-center">
            <Spinner size="lg" />
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono italic">SYNCING CALENDAR PROTOCOLS...</p>
        </div>
    );

    return (
        <div className="space-y-12 animate-fade-in pb-20 mt-4 px-2 lg:px-6">
            {/* Header: Global Calendar */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                <div className="space-y-4">
                    <Badge variant="outline" className="text-primary border-primary/20 font-black uppercase tracking-[0.2em] text-[9px] px-4 py-1.5 rounded-full bg-primary/5">Legal Master Calendar</Badge>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
                        Consultation <br />
                        <span className="text-primary italic">Schedule.</span>
                    </h1>
                    <p className="text-sm font-bold text-slate-400 max-w-xl leading-relaxed uppercase italic">
                        Managing justice face-to-face. <span className="text-slate-800 not-italic font-black">Coordinating legal interventions for verified workers.</span>
                    </p>
                </div>
                
                <div className="flex gap-4">
                    <Button variant="outline" className="h-16 px-10 rounded-full font-black uppercase tracking-widest text-[10px] border-2 border-slate-100 bg-white hover:bg-slate-50 transition-all shadow-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Sync Google Calendar
                    </Button>
                </div>
            </header>

            {/* Registry Control Bar */}
            <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <Input 
                        placeholder="Search applicant or Case ID..." 
                        className="pl-14 h-14 rounded-[28px] bg-slate-50/50 border-none shadow-inner focus:bg-white text-sm font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-3 w-full lg:w-auto">
                    <Button variant="ghost" className="h-14 w-14 rounded-[28px] bg-slate-50/50 hover:bg-primary/5 text-slate-400 hover:text-primary transition-all">
                        <Filter className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Appointment Grid */}
            <div className="space-y-8">
                {appointments.length === 0 ? (
                    <EmptyState
                        icon={Calendar}
                        title="Your schedule is clear"
                        description="No appointments scheduled for the current period."
                        className="h-[400px] bg-white border border-slate-100 rounded-[56px]"
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {appointments.map((apt) => (
                            <div key={apt._id} className="group bg-white p-2 rounded-[48px] border border-slate-100 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/40">
                                <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-10 flex-1">
                                        {/* Date/Time Block */}
                                        <div className="space-y-1 bg-slate-900 text-white p-6 rounded-[32px] min-w-[140px] text-center shadow-xl shadow-slate-900/10">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                                            <p className="text-4xl font-black tracking-tighter">{new Date(apt.date).getDate()}</p>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-primary">{new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>

                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-3">
                                                <Badge className={cn(
                                                    "px-3 py-1 rounded-full font-black uppercase tracking-widest text-[8px]",
                                                    apt.status === 'confirmed' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                                )}>
                                                    {apt.status === 'confirmed' ? "Protocol Verified" : "Verification Pending"}
                                                </Badge>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 font-mono">Case #{apt.caseId}</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                                {apt.workerName}
                                                <ShieldCheck className="h-5 w-5 text-blue-500" />
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-400">
                                                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl">
                                                    <Target className="h-4 w-4 text-primary" />
                                                    {apt.type}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-primary" />
                                                    {apt.location}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <Button asChild className="h-16 px-10 rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 group">
                                            <a href="#" className="flex items-center">
                                                {apt.location.includes('Virtual') ? <Video className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                                                {apt.location.includes('Virtual') ? "Launch Secure Link" : "View Logistics"}
                                            </a>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-16 w-16 rounded-full bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                                            <MoreVertical className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Background Texture Accents */}
            <div className="fixed bottom-0 right-0 p-12 opacity-[0.03] pointer-events-none select-none">
                 <Calendar className="h-96 w-96 rotate-12" />
            </div>
        </div>
    );
};

export default LegalAppointments;
