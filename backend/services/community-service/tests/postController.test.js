const postController = require('../src/controllers/postController');
const Post = require('../src/models/Post');
const UserProfile = require('../src/models/UserProfile');
const Report = require('../src/models/Report');
const { emitEvent } = require('../src/utils/kafkaProducer');

jest.mock('../src/models/Post');
jest.mock('../src/models/UserProfile');
jest.mock('../src/models/Report');
jest.mock('../src/utils/kafkaProducer');

describe('Post Controller', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = {
            params: {},
            body: {},
            query: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    // ... createPost
    describe('createPost', () => {
        it('should create and return a post', async () => {
            mockReq.body = { authorId: '1', content: 'hello' };
            const mockSave = jest.fn();
            Post.mockImplementation(() => ({ save: mockSave }));

            await postController.createPost(mockReq, mockRes);

            expect(mockSave).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(201);
        });
    });

    // ... getFeed
    describe('getFeed', () => {
        it('should return 404 if profile not found', async () => {
            mockReq.params.userId = '1';
            UserProfile.findOne.mockResolvedValue(null);

            await postController.getFeed(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });

        it('should return posts from following + self', async () => {
            mockReq.params.userId = '1';
            UserProfile.findOne.mockResolvedValue({ following: ['2'] });

            const mockChain = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([{ id: 1 }])
            };
            Post.find.mockReturnValue(mockChain);

            await postController.getFeed(mockReq, mockRes);

            expect(Post.find).toHaveBeenCalledWith({ authorId: { $in: ['2', '1'] } });
            expect(mockRes.json).toHaveBeenCalledWith([{ id: 1 }]);
        });
    });

    // ... getPostById, updatePost, deletePost
    describe('getPostById', () => {
        it('should return 404 if post not found', async () => {
            mockReq.params.postId = '1';
            Post.findById.mockResolvedValue(null);

            await postController.getPostById(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });

        it('should return the post', async () => {
            mockReq.params.postId = '1';
            Post.findById.mockResolvedValue({ id: '1' });
            await postController.getPostById(mockReq, mockRes);
            expect(mockRes.json).toHaveBeenCalledWith({ id: '1' });
        });
    });

    describe('updatePost', () => {
        it('should return 403 if unauthorized', async () => {
            mockReq.params.postId = 'p1';
            mockReq.body = { authorId: 'user1', content: 'new' };
            Post.findById.mockResolvedValue({ authorId: 'user2' });

            await postController.updatePost(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
        });

        it('should update the post', async () => {
            mockReq.params.postId = 'p1';
            mockReq.body = { authorId: '1', content: 'new' };
            const post = { authorId: '1', content: 'old', save: jest.fn() };
            Post.findById.mockResolvedValue(post);

            await postController.updatePost(mockReq, mockRes);

            expect(post.content).toBe('new');
            expect(post.save).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalled();
        });
    });

    describe('deletePost', () => {
        it('should allow deletion by author', async () => {
            mockReq.params.postId = 'p1';
            mockReq.body = { authorId: '1' };
            Post.findById.mockResolvedValue({ authorId: '1' });

            await postController.deletePost(mockReq, mockRes);

            expect(Post.findByIdAndDelete).toHaveBeenCalledWith('p1');
            expect(mockRes.json).toHaveBeenCalled();
        });
    });

    describe('likePost', () => {
        it('should emit event when someone else likes', async () => {
            mockReq.params.postId = 'p1';
            mockReq.body = { userId: '2' };
            const post = { _id: 'p1', authorId: '1', likes: [], save: jest.fn() };
            Post.findById.mockResolvedValue(post);

            await postController.likePost(mockReq, mockRes);

            expect(post.likes).toContain('2');
            expect(emitEvent).toHaveBeenCalledWith('community-events', 'post_liked', {
                likerId: '2', authorId: '1', postId: 'p1'
            });
        });

        it('should unlike properly', async () => {
            mockReq.params.postId = 'p1';
            mockReq.body = { userId: '1' };
            const post = { _id: 'p1', authorId: '1', likes: ['1'], save: jest.fn() };
            Post.findById.mockResolvedValue(post);
            await postController.likePost(mockReq, mockRes);
            expect(post.likes.length).toBe(0);
        });
    });

    describe('sharePost', () => {
        it('should increment share count', async () => {
            mockReq.params.postId = '1';
            const post = { shareCount: 0, save: jest.fn() };
            Post.findById.mockResolvedValue(post);

            await postController.sharePost(mockReq, mockRes);

            expect(post.shareCount).toBe(1);
        });
    });

    describe('getTrendingFeed', () => {
        it('should aggregate and sort', async () => {
            Post.aggregate.mockResolvedValue([{ id: 2 }]);
            await postController.getTrendingFeed(mockReq, mockRes);
            expect(Post.aggregate).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith([{ id: 2 }]);
        });
    });

    describe('searchByHashtag', () => {
        it('should search query by hashtag', async () => {
            mockReq.params.tag = 'LegalAid';
            const mockChain = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([{ id: 1 }])
            };
            Post.find.mockReturnValue(mockChain);

            await postController.searchByHashtag(mockReq, mockRes);

            expect(Post.find).toHaveBeenCalledWith({ hashtags: 'LegalAid' });
            expect(mockRes.json).toHaveBeenCalledWith([{ id: 1 }]);
        });
    });

    describe('votePoll', () => {
        it('should 400 if user already voted', async () => {
            mockReq.params.postId = 'p1';
            mockReq.body = { userId: '1', optionIndex: 0 };
            Post.findById.mockResolvedValue({
                poll: { options: [{ votes: ['1'] }] }
            });

            await postController.votePoll(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('should register vote', async () => {
            mockReq.params.postId = 'p1';
            mockReq.body = { userId: '1', optionIndex: 0 };
            const post = {
                poll: { options: [{ votes: [] }] },
                save: jest.fn()
            };
            Post.findById.mockResolvedValue(post);

            await postController.votePoll(mockReq, mockRes);

            expect(post.poll.options[0].votes).toContain('1');
            expect(post.save).toHaveBeenCalled();
        });
    });

    describe('reportPost', () => {
        it('should increment report count and save report document', async () => {
            mockReq.params.postId = 'p1';
            mockReq.body = { reporterId: 'usr1', reason: 'spam' };
            const post = { isReported: false, reportCount: 0, save: jest.fn() };
            Post.findById.mockResolvedValue(post);
            const mockSaveReport = jest.fn();
            Report.mockImplementation(() => ({ save: mockSaveReport }));

            await postController.reportPost(mockReq, mockRes);

            expect(post.isReported).toBe(true);
            expect(post.reportCount).toBe(1);
            expect(post.save).toHaveBeenCalled();
            expect(mockSaveReport).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalled();
        });
    });
});
