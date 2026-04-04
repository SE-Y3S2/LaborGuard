import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messageApi } from "@/api/messageApi";
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
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ChatPage = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedConv, setSelectedConv] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const scrollRef = useRef();

    // Fetch Conversations
    const { data: conversations, isLoading: convsLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const res = await messageApi.getConversations();
            return res.data.data || [];
        },
        refetchInterval: 10000 // Poll every 10s for new chats
    });

    // Fetch Messages for selected conversation
    const { data: messages, isLoading: messagesLoading } = useQuery({
        queryKey: ['messages', selectedConv?._id],
        queryFn: async () => {
            const res = await messageApi.getMessages(selectedConv._id);
            return res.data.data || [];
        },
        enabled: !!selectedConv,
        refetchInterval: 3000 // Poll every 3s for new messages
    });

    const sendMutation = useMutation({
        mutationFn: (data) => messageApi.sendMessage(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['messages', selectedConv?._id]);
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
        if (!newMessage.trim() || !selectedConv) return;
        
        const recipientId = selectedConv.participants.find(p => p !== user.id);
        sendMutation.mutate({
            recipientId,
            content: newMessage,
            conversationId: selectedConv._id
        });
    };

    if (convsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-white animate-fade-in">
            {/* Sidebar: Conversation List */}
            <div className={`w-full md:w-80 lg:w-96 border-r flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-black tracking-tight">Messages</h1>
                        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-slate-50">
                            <Plus className="w-5 h-5 text-primary" />
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search contacts..." 
                            className="pl-10 rounded-full h-11 bg-slate-50 border-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 space-y-1">
                    {conversations?.map((conv) => (
                        <div 
                            key={conv._id} 
                            onClick={() => setSelectedConv(conv)}
                            className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
                                selectedConv?._id === conv._id ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-slate-50'
                            }`}
                        >
                            <Avatar className="h-12 w-12 border-2 border-white/20">
                                <AvatarImage src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${conv._id}`} />
                                <AvatarFallback><UserIcon /></AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-bold truncate text-sm">Case Officer Support</h4>
                                    <span className={`text-[10px] ${selectedConv?._id === conv._id ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                                        12:45 PM
                                    </span>
                                </div>
                                <p className={`text-xs truncate ${selectedConv?._id === conv._id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                    {conv.lastMessage?.content || "No messages yet"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-slate-50/30 ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
                {selectedConv ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white p-4 border-b flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConv(null)}>
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                                <Avatar className="h-10 w-10 border">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${selectedConv._id}`} />
                                    <AvatarFallback><UserIcon /></AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="font-bold text-slate-800 leading-none">Legal Support Team</h2>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                                    <Phone className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                                    <Video className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {messagesLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                messages?.map((msg, i) => (
                                    <div 
                                        key={i} 
                                        className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                    >
                                        <div className={`max-w-[75%] space-y-1`}>
                                            <div className={`p-4 rounded-3xl text-sm font-medium shadow-sm ${
                                                msg.senderId === user.id 
                                                ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                                : 'bg-white text-slate-700 rounded-tl-none border'
                                            }`}>
                                                {msg.content}
                                            </div>
                                            <div className={`flex items-center gap-1.5 text-[10px] ${msg.senderId === user.id ? 'justify-end' : 'justify-start'} text-muted-foreground font-bold uppercase`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {msg.senderId === user.id && <CheckCheck className="w-3 h-3 text-primary" />}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={scrollRef} />
                        </div>

                        {/* Message Input */}
                        <div className="bg-white p-6 border-t shadow-2xl relative z-10">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border-2 focus-within:border-primary/30 transition-all">
                                <Button variant="ghost" size="icon" type="button" className="text-muted-foreground hover:text-primary">
                                    <Plus className="w-5 h-5" />
                                </Button>
                                <Input 
                                    placeholder="Type your message here..." 
                                    className="flex-1 bg-transparent border-none focus-visible:ring-0 text-sm py-6 h-12"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <Button 
                                    size="icon" 
                                    className="rounded-xl h-10 w-10 shadow-lg" 
                                    type="submit" 
                                    disabled={!newMessage.trim() || sendMutation.isPending}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-4">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-slate-50">
                            <MessageSquare className="w-10 h-10 text-primary animate-bounce-subtle" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black">Your Safe Space</h3>
                            <p className="text-muted-foreground max-w-sm">Select a contact to start chatting securely with legal officers and support teams.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
