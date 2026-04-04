import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { communityApi } from "@/api/communityApi";
import { toast } from "sonner";

export const useCommunity = () => {
    const queryClient = useQueryClient();

    // Fetch Posts
    const useGetPosts = (params) => useQuery({
        queryKey: ['community-posts', params],
        queryFn: async () => {
            const res = await communityApi.getPosts(params);
            return res.data.data || [];
        }
    });

    // Fetch Polls
    const useGetPolls = () => useQuery({
        queryKey: ['community-polls'],
        queryFn: async () => {
            // Mocking polls for now as the API might be coming soon
            return [
                {
                    _id: 'p1',
                    question: "Have you received your EPF/ETF contributions on time this month?",
                    options: [
                        { label: "Yes, fully received", votes: 42, selectedIndex: 0 },
                        { label: "Partially received", votes: 12, selectedIndex: 0 },
                        { label: "Not received at all", votes: 28, selectedIndex: 0 },
                        { label: "Not sure/Checking", votes: 8, selectedIndex: 0 },
                    ],
                    totalVotes: 90,
                    hasVoted: false,
                    category: "Financial Security"
                },
                {
                    _id: 'p2',
                    question: "Which labor right violation is most common in your current sector?",
                    options: [
                        { label: "Unpaid Overtime", votes: 156, selectedIndex: 0 },
                        { label: "Lack of Safety Gear", votes: 89, selectedIndex: 0 },
                        { label: "Unfair Termination", votes: 212, selectedIndex: 0 },
                        { label: "Gender Pay Gap", votes: 64, selectedIndex: 0 },
                    ],
                    totalVotes: 521,
                    hasVoted: true,
                    votedIndex: 2,
                    category: "Policy Advocacy"
                }
            ];
        }
    });

    // Mutations
    const createPost = useMutation({
        mutationFn: (data) => communityApi.createPost(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['community-posts']);
            toast.success("Experience shared with the global community.");
        }
    });

    const likePost = useMutation({
        mutationFn: (id) => communityApi.likePost(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['community-posts']);
        }
    });

    const votePoll = useMutation({
        mutationFn: ({ pollId, optionIndex }) => {
            // Mock API call
            console.log(`Voting on poll ${pollId} for option ${optionIndex}`);
            return Promise.resolve();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['community-polls']);
            toast.success("Sentiment recorded.");
        }
    });

    return {
        useGetPosts,
        useGetPolls,
        createPost,
        likePost,
        votePoll
    };
};
