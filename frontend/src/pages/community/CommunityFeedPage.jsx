import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCommunity } from "@/hooks/useCommunity";
import { 
  PlusCircle, 
  Search, 
  Target,
  Sparkles,
  TrendingUp,
  LayoutGrid,
  ChevronRight,
  Send,
  Image as ImageIcon,
  ShieldCheck,
  Globe,
  Filter,
  MessageCircle,
  X
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Input } from "@/components/common/Input";
import { Spinner } from "@/components/common/Spinner";
import { Textarea } from "@/components/ui/Textarea"; // Assuming from UI for now
import { Avatar, AvatarFallback, AvatarImage } from "@/components/common/Avatar";
import { StoryCard } from "@/components/community/StoryCard";
import { PollCard } from "@/components/community/PollCard";
import { cn } from "@/lib/utils";

const CommunityFeedPage = () => {
    const { user } = useAuth();
    const { useGetPosts, useGetPolls, createPost, likePost, votePoll } = useCommunity();
    const [searchTerm, setSearchTerm] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [newPostContent, setNewPostContent] = useState("");

    const { data: posts, isLoading: postsLoading } = useGetPosts({ search: searchTerm });
    const { data: polls, isLoading: pollsLoading } = useGetPolls();

    const handlePostSubmit = (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;
        createPost.mutate({ content: newPostContent }, {
            onSuccess: () => {
                setNewPostContent("");
                setIsPosting(false);
            }
        });
    };

    if (postsLoading || pollsLoading) return (
        <div className="p-32 flex flex-col items-center">
            <Spinner size="lg" />
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono italic">SYNCING COMMUNITY BROADCAST...</p>
        </div>
    );

    return (
        <div className="space-y-16 animate-fade-in pb-20 mt-4">
            {/* Header: Global Narrative */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 px-4">
                <div className="space-y-4">
                    <Badge variant="outline" className="text-primary border-primary/20 font-black uppercase tracking-[0.2em] text-[9px] px-4 py-1.5 rounded-full bg-primary/5">The Labor Collective</Badge>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
                        Shared <br />
                        <span className="text-primary italic">Experiences.</span>
                    </h1>
                    <p className="text-sm font-bold text-slate-400 max-w-xl leading-relaxed uppercase italic">
                        Real stories from the hidden engine of Sri Lanka. <span className="text-slate-800 not-italic font-black">Anonymous. Verified. Empowering.</span>
                    </p>
                </div>
                
                <div className="flex gap-4">
                    <Button 
                        onClick={() => setIsPosting(true)}
                        className="h-16 px-10 rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 group"
                    >
                        <PlusCircle className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
                        Share My Experience
                    </Button>
                </div>
            </header>

            {/* Discovery Hub */}
            <div className="grid lg:grid-cols-4 gap-8 px-2">
                {/* Search & Stats */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20 space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <Search className="h-4 w-4 text-slate-400" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Explore Topics</h3>
                        </div>
                        <Input 
                            placeholder="Search keywords..." 
                            className="bg-slate-50 border-none h-12 rounded-2xl text-xs font-bold px-5"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="flex flex-wrap gap-2">
                            {['Wage_Theft', 'Safety', 'Contracts', 'Transport'].map(t => (
                                <Badge key={t} className="bg-slate-50 hover:bg-primary/10 text-slate-500 hover:text-primary transition-all cursor-pointer border-none font-bold text-[8px] tracking-widest uppercase">
                                    #{t}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[48px] text-white space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 blur-3xl" />
                        <div className="space-y-1">
                            <h3 className="text-lg font-black uppercase tracking-tight">Active Pulse</h3>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Real-time Advocacy metrics</p>
                        </div>
                        <div className="space-y-6">
                            {[
                                { label: "Collective Intelligence", val: "2.4K", change: "+12%" },
                                { label: "Verified Victories", val: "842", change: "+4%" },
                            ].map((s, i) => (
                                <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                                        <p className="text-2xl font-black">{s.val}</p>
                                    </div>
                                    <Badge className="bg-green-500/10 text-green-400 border-none text-[8px] mb-1">{s.change}</Badge>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full h-12 rounded-2xl border-white/10 text-white hover:bg-white/5 text-[9px] font-black uppercase tracking-widest">
                            <Globe className="h-3.5 w-3.5 mr-2" />
                            Global Trends
                        </Button>
                    </div>
                </div>

                {/* Experiential Stream (Masonry) */}
                <div className="lg:col-span-3">
                    <div className="columns-1 md:columns-2 gap-8 space-y-8">
                        {/* Interactive Polls Mixed with Stories */}
                        {polls?.length > 0 && (
                            <PollCard 
                                poll={polls[0]} 
                                onVote={(id, opt) => votePoll.mutate({ pollId: id, optionIndex: opt })} 
                            />
                        )}

                        {posts?.length === 0 ? (
                            <div className="col-span-full py-32 text-center bg-slate-50 rounded-[56px] border-2 border-dashed border-slate-200">
                                <MessageCircle className="h-16 w-16 text-slate-300 mx-auto mb-6" />
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">The Silence is Waiting.</h3>
                                <p className="text-sm font-bold text-slate-400 uppercase italic mt-2">Be the first to break the cycle and share your experience.</p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <StoryCard 
                                    key={post._id} 
                                    story={post} 
                                    onLike={(id) => likePost.mutate(id)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Posting Modal Backdrop */}
            {isPosting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-3">
                                        <Sparkles className="h-6 w-6 text-primary" />
                                        Share My Story
                                    </h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your voice matters. Shared anonymously by default.</p>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                                    onClick={() => setIsPosting(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <form onSubmit={handlePostSubmit} className="space-y-8">
                                <Textarea 
                                    className="min-h-[240px] rounded-[32px] bg-slate-50 border-none p-8 text-lg font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner"
                                    placeholder="Write your experience here... (e.g., 'Late transport again today in the apparel sector. Third time this week...')"
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    autoFocus
                                />

                                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                                    <div className="flex gap-4">
                                        <Button type="button" variant="ghost" className="h-14 px-6 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all">
                                            <ImageIcon className="h-4 w-4 mr-2" />
                                            Add Evidence
                                        </Button>
                                        <div className="flex items-center gap-3 px-6 h-14 bg-green-50/50 rounded-2xl border border-green-100">
                                            <ShieldCheck className="h-4 w-4 text-green-500" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-green-600">Identity Encrypted</span>
                                        </div>
                                    </div>
                                    <Button 
                                        type="submit"
                                        disabled={!newPostContent.trim() || createPost.isPending}
                                        className="h-16 px-12 rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/20 w-full sm:w-auto"
                                    >
                                        {createPost.isPending ? "Broadcasting..." : "Confirm & Share"}
                                        <Send className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityFeedPage;
