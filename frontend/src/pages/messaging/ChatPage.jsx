import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messageApi } from "@/api/messageApi";
import { useRealtime } from "@/hooks/useRealtime";
import { useMessagingStore } from "@/store/messagingStore";
import { useSearchParams } from "react-router-dom";
import { 
  Send, 
  Search, 
  MoreVertical, 
  MessageSquare, 
  Clock, 
  CheckCheck,
  Phone,
  Video,
  ChevronLeft,
  User as UserIcon,
  Plus,
  ShieldCheck,
  Paperclip,
  Smile,
  Loader2,
  Trash2,
  AlertCircle,
  MoreHorizontal,
  Lock
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Input } from "@/components/common/Input";
import { Spinner } from "@/components/common/Spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/common/Avatar";
import { cn } from "@/lib/utils";

const ChatPage = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { activeConversationId, setActiveConversation, addMessage } = useMessagingStore();
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const scrollRef = useRef();
    const [searchParams] = useSearchParams();
    const caseId = searchParams.get('case');

    // Enable Real-time Listening
    useRealtime();

    // Fetch Conversations Hub
    const { data: conversations, isLoading: convsLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const res = await messageApi.getConversations();
            return res.data.data || [];
        }
    });

    // Auto-select conversation if ?case= param is present
    useEffect(() => {
        if (caseId && conversations?.length > 0 && !activeConversationId) {
            // Try to find a conversation related to this case
            const matchingConv = conversations.find(c => 
                c.relatedCaseId === caseId || c.metadata?.caseId === caseId
            );
            if (matchingConv) {
                setActiveConversation(matchingConv._id);
            }
        }
    }, [caseId, conversations, activeConversationId, setActiveConversation]);

    // Active Conversation Messages (Hydrated via TanStack + Realtime Sync)
    const { data: messages, isLoading: messagesLoading } = useQuery({
        queryKey: ['messages', activeConversationId],
        queryFn: async () => {
            const res = await messageApi.getMessages(activeConversationId);
            return res.data.data || [];
        },
        enabled: !!activeConversationId,
    });

    const sendMutation = useMutation({
        mutationFn: (data) => messageApi.sendMessage(data),
        onSuccess: (res) => {
            // Optimistically update is handled by the hook usually, but we ensure cache sync here
            queryClient.invalidateQueries(['messages', activeConversationId]);
            setNewMessage("");
            scrollToBottom();
        }
    });

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversationId) return;
        
        const activeConv = conversations?.find(c => c._id === activeConversationId);
        const recipientId = activeConv?.participants.find(p => p._id !== user.id);
        
        sendMutation.mutate({
            recipientId,
            content: newMessage,
            conversationId: activeConversationId
        });
    };

    const currentConv = conversations?.find(c => c._id === activeConversationId);
    const otherParticipant = currentConv?.participants.find(p => p._id !== user.id);

    if (convsLoading) return (
        <div className="p-32 flex flex-col items-center">
            <Spinner size="lg" />
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono italic">ESTABLISHING SECURE UPLINK...</p>
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-120px)] w-full overflow-hidden bg-white rounded-[56px] border border-slate-100 shadow-3xl animate-fade-in mt-4">
            {/* Sidebar: Tactical Contacts */}
            <div className={cn(
                "w-full md:w-96 border-r flex flex-col bg-slate-50/50",
                activeConversationId ? 'hidden md:flex' : 'flex'
            )}>
                <div className="p-10 space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900">Archive.</h1>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Communications</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white shadow-sm hover:scale-110 transition-all border border-slate-100">
                            <Plus className="w-5 h-5 text-primary" />
                        </Button>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder="Identify contact..." 
                            className="pl-14 h-14 rounded-[28px] bg-white border-none shadow-sm focus:ring-2 focus:ring-primary/10 text-sm font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2 custom-scrollbar">
                    {conversations?.map((conv) => {
                        const p = conv.participants.find(part => part._id !== user.id);
                        const isActive = activeConversationId === conv._id;
                        return (
                            <div 
                                key={conv._id} 
                                onClick={() => setActiveConversation(conv._id)}
                                className={cn(
                                    "flex items-center gap-4 p-6 rounded-[32px] cursor-pointer transition-all duration-300 relative group",
                                    isActive 
                                        ? "bg-slate-900 text-white shadow-2xl scale-[1.02] z-10" 
                                        : "hover:bg-white hover:shadow-xl hover:shadow-slate-200/20"
                                )}
                            >
                                <div className="relative">
                                    <Avatar className="h-14 w-14 border-2 border-white/10 group-hover:scale-105 transition-transform duration-500">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${p?._id}`} />
                                        <AvatarFallback className="bg-primary/20 text-primary font-black uppercase text-xs">{p?.firstName?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-4 border-white shadow-sm" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-black truncate text-sm tracking-tight">{p?.firstName} {p?.lastName}</h4>
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-widest",
                                            isActive ? "text-slate-500" : "text-slate-300"
                                        )}>
                                            12:45
                                        </span>
                                    </div>
                                    <p className={cn(
                                        "text-[10px] truncate font-bold uppercase tracking-widest",
                                        isActive ? "text-primary italic" : "text-slate-400"
                                    )}>
                                        {conv.lastMessage?.content || "PROTOCOL INITIALIZED"}
                                    </p>
                                </div>
                                {conv.unreadCount > 0 && !isActive && (
                                    <Badge className="h-5 min-w-5 flex items-center justify-center rounded-full bg-primary text-white text-[9px] font-black">
                                        {conv.unreadCount}
                                    </Badge>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area: The Narrative Hub */}
            <div className={cn(
                "flex-1 flex flex-col bg-white",
                !activeConversationId ? 'hidden md:flex' : 'flex'
            )}>
                {activeConversationId ? (
                    <>
                        {/* Terminal Header */}
                        <div className="p-6 md:p-10 border-b flex items-center justify-between z-10 bg-white/80 backdrop-blur-xl">
                            <div className="flex items-center gap-6">
                                <Button variant="ghost" size="icon" className="md:hidden h-12 w-12 rounded-2xl bg-slate-50" onClick={() => setActiveConversation(null)}>
                                    <ChevronLeft className="w-5 h-5 text-slate-400" />
                                </Button>
                                <div className="relative">
                                    <Avatar className="h-16 w-16 border shadow-sm">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${otherParticipant?._id}`} />
                                        <AvatarFallback className="bg-slate-100 text-slate-400"><UserIcon /></AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-4 border-white shadow-glow-green" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{otherParticipant?.firstName} {otherParticipant?.lastName}</h2>
                                        <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[8px] tracking-[0.2em] uppercase px-3">E2E ENCRYPTED</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Authorized {otherParticipant?.role || 'Stakeholder'} Link</span>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden lg:flex gap-3">
                                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-100 shadow-sm text-slate-400 hover:text-primary transition-all">
                                    <Phone className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-100 shadow-sm text-slate-400 hover:text-primary transition-all">
                                    <Video className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-100 shadow-sm text-slate-400 hover:text-primary transition-all">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Transcript Content */}
                        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-[0.98]">
                            {messagesLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <Spinner size="lg" />
                                </div>
                            ) : (
                                messages?.map((msg, i) => {
                                    const isMe = msg.senderId === user.id;
                                    return (
                                        <div 
                                            key={i} 
                                            className={cn(
                                                "flex group/msg animate-in fade-in slide-in-from-bottom-4 duration-500",
                                                isMe ? 'justify-end' : 'justify-start'
                                            )}
                                        >
                                            <div className={cn(
                                                "max-w-[80%] md:max-w-[65%] space-y-3",
                                                isMe ? "items-end" : "items-start"
                                            )}>
                                                <div className={cn(
                                                    "p-6 text-sm font-bold leading-relaxed shadow-xl relative",
                                                    isMe 
                                                        ? "bg-slate-900 text-white rounded-[32px] rounded-tr-none shadow-slate-900/10" 
                                                        : "bg-white text-slate-700 rounded-[32px] rounded-tl-none border border-slate-100 shadow-slate-200/20"
                                                )}>
                                                    {msg.content}
                                                    {isMe && (
                                                        <div className="absolute top-0 right-0 -mr-1 -mt-1 h-3 w-3 bg-primary rounded-full border-2 border-slate-900" />
                                                    )}
                                                </div>
                                                <div className={cn(
                                                    "flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.15em]",
                                                    isMe ? 'flex-row-reverse text-slate-400' : 'text-slate-300'
                                                )}>
                                                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-primary" />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input Protocol */}
                        <div className="p-10 border-t bg-white">
                            <form 
                                onSubmit={handleSendMessage} 
                                className="flex items-center gap-4 bg-slate-50 p-3 rounded-[32px] border-2 border-transparent focus-within:border-primary/20 focus-within:bg-white transition-all shadow-inner"
                            >
                                <Button variant="ghost" size="icon" type="button" className="h-12 w-12 rounded-2xl text-slate-300 hover:text-primary transition-all">
                                    <Paperclip className="w-5 h-5" />
                                </Button>
                                <Input 
                                    placeholder="Input secure message narrative..." 
                                    className="flex-1 bg-transparent border-none focus-visible:ring-0 text-sm font-bold py-6 h-12 placeholder:text-slate-300"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" type="button" className="hidden sm:flex h-12 w-12 rounded-2xl text-slate-300 hover:text-amber-500 transition-all">
                                        <Smile className="w-5 h-5" />
                                    </Button>
                                    <Button 
                                        size="icon" 
                                        className="h-12 w-12 rounded-2xl shadow-2xl shadow-primary/30 group/send" 
                                        type="submit" 
                                        disabled={!newMessage.trim() || sendMutation.isPending}
                                    >
                                        {sendMutation.isPending ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-slate-50/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
                        <div className="relative space-y-8 animate-in zoom-in duration-1000">
                            <div className="w-40 h-40 bg-white rounded-[56px] flex items-center justify-center shadow-3xl border-2 border-slate-50 mx-auto relative group">
                                <div className="absolute inset-0 bg-primary/5 rounded-[56px] scale-110 animate-pulse" />
                                <MessageSquare className="w-20 h-20 text-primary relative z-10 group-hover:rotate-12 transition-transform duration-700" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-4xl font-black tracking-tight text-slate-900 uppercase italic">Narrative Hub</h3>
                                <p className="text-sm font-bold text-slate-400 max-w-sm mx-auto uppercase tracking-widest leading-relaxed">
                                    Secure, encrypted communication channels for case management and advocacy support.
                                </p>
                            </div>
                            <Badge className="bg-green-50 text-green-600 border-green-100 font-black px-6 py-2 rounded-full text-[10px] tracking-widest animate-fade-in transition-all">
                                <Lock className="h-3 w-3 mr-2" />
                                PROTOCOL SECURE
                            </Badge>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
