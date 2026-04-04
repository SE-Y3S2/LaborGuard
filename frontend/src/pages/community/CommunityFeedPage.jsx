import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { communityApi } from "@/api/communityApi";
import { 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  MoreVertical, 
  PlusCircle, 
  Image as ImageIcon,
  Send,
  User as UserIcon,
  Search,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CommunityFeedPage = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [newPostContent, setNewPostContent] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch Feed
    const { data: posts, isLoading } = useQuery({
        queryKey: ['community-feed', searchTerm],
        queryFn: async () => {
            const res = await communityApi.getPosts({ search: searchTerm });
            return res.data.data || [];
        }
    });

    const createPostMutation = useMutation({
        mutationFn: (data) => communityApi.createPost(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['community-feed']);
            setNewPostContent("");
            toast.success("Post shared with the community!");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to post");
        }
    });

    const likeMutation = useMutation({
        mutationFn: (postId) => communityApi.likePost(postId),
        onSuccess: () => {
            queryClient.invalidateQueries(['community-feed']);
        }
    });

    const handleCreatePost = (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;
        
        const formData = new FormData();
        formData.append("content", newPostContent);
        // Add images if any
        createPostMutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="mt-4 font-bold text-lg text-muted-foreground">Connecting to Community...</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <header className="space-y-2 border-b pb-8">
                <h1 className="text-4xl font-extrabold tracking-tight">Worker Community</h1>
                <p className="text-muted-foreground text-lg">
                    Connect, share experiences, and stay informed with fellow informal laborers.
                </p>
            </header>

            {/* Create Post */}
            <Card className="shadow-lg border-2 overflow-hidden">
                <CardContent className="p-0">
                    <form onSubmit={handleCreatePost}>
                        <div className="p-6 space-y-4">
                            <div className="flex gap-4">
                                <Avatar className="h-10 w-10 border-2 border-primary/10">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName}`} />
                                    <AvatarFallback>{user?.firstName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Textarea 
                                    placeholder="What's on your mind today? Share a job tip, legal question, or experience..." 
                                    className="resize-none border-none focus-visible:ring-0 text-lg p-0"
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t flex justify-between items-center">
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" type="button" className="text-muted-foreground hover:text-primary">
                                    <ImageIcon className="w-4 h-4 mr-2" />
                                    Photo
                                </Button>
                            </div>
                            <Button 
                                type="submit" 
                                disabled={!newPostContent.trim() || createPostMutation.isPending}
                                className="rounded-full px-6 shadow-md"
                            >
                                {createPostMutation.isPending ? "Posting..." : "Share Post"}
                                <Send className="w-3.5 h-3.5 ml-2" />
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Feed Filter */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                    placeholder="Search posts or topics..." 
                    className="pl-10 rounded-full h-12 border-2 focus:border-primary/50 bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Posts List */}
            <div className="space-y-6">
                {posts?.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed">
                        <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold">No community activity yet</h3>
                        <p className="text-muted-foreground mt-1 max-w-xs mx-auto">Be the first to share an experience with the community.</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <Card key={post._id} className="shadow-md hover:shadow-lg transition-shadow border-2 border-slate-100 overflow-hidden">
                            <CardHeader className="flex flex-row justify-between items-start pt-6 pb-4">
                                <div className="flex gap-3">
                                    <Avatar className="h-10 w-10 border">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user?.userId}`} />
                                        <AvatarFallback><UserIcon className="w-5 h-5" /></AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-0.5">
                                        <h4 className="font-bold text-sm">Laborer #{post.user?.userId?.substring(18)}</h4>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                            <span className="bg-slate-100 px-1.5 py-0.5 rounded uppercase font-bold text-slate-500">Worker</span>
                                            <span>• {new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="pb-6">
                                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                {post.media && post.media.length > 0 && (
                                    <div className="mt-4 rounded-2xl overflow-hidden border">
                                        <img src={post.media[0].url} alt="Post content" className="w-full object-cover max-h-[400px]" />
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="bg-slate-50/50 border-t py-3 flex justify-between">
                                <div className="flex gap-6">
                                    <button 
                                        className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                                            post.likes?.includes(user?.id) ? 'text-primary' : 'text-slate-500 hover:text-primary'
                                        }`}
                                        onClick={() => likeMutation.mutate(post._id)}
                                    >
                                        <ThumbsUp className={`w-4 h-4 ${post.likes?.includes(user?.id) ? 'fill-primary' : ''}`} />
                                        {post.likes?.length || 0}
                                    </button>
                                    <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors">
                                        <MessageSquare className="w-4 h-4" />
                                        {post.comments?.length || 0}
                                    </button>
                                </div>
                                <button className="text-slate-500 hover:text-primary transition-colors">
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommunityFeedPage;
