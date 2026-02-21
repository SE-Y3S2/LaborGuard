const statusController = require('../src/controllers/statusController');
const Status = require('../src/models/Status');
const UserProfile = require('../src/models/UserProfile');

jest.mock('../src/models/Status');
jest.mock('../src/models/UserProfile');

describe('Status Controller', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = {
            params: {},
            body: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('createStatus', () => {
        it('should save status doc', async () => {
            mockReq.body = { authorId: '1', content: 'yes' };
            const mockSave = jest.fn();
            Status.mockImplementation(() => ({ save: mockSave }));

            await statusController.createStatus(mockReq, mockRes);

            expect(mockSave).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(201);
        });
    });

    describe('getStatuses', () => {
        it('should return 404 if profile not found', async () => {
            mockReq.params.userId = '1';
            UserProfile.findOne.mockResolvedValue(null);

            await statusController.getStatuses(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });

        it('should fetch from following + self', async () => {
            mockReq.params.userId = '1';
            UserProfile.findOne.mockResolvedValue({ following: ['2'] });

            const mockChain = {
                sort: jest.fn().mockResolvedValue([{ id: 's1' }])
            };
            Status.find.mockReturnValue(mockChain);

            await statusController.getStatuses(mockReq, mockRes);

            expect(Status.find).toHaveBeenCalledWith({
                authorId: { $in: ['2', '1'] },
                expiresAt: { $gt: expect.any(Date) }
            });
            expect(mockRes.json).toHaveBeenCalledWith([{ id: 's1' }]);
        });
    });

    describe('deleteStatus', () => {
        it('should 403 if unauthorized', async () => {
            mockReq.params.statusId = 's1';
            mockReq.body = { authorId: '1' };
            Status.findById.mockResolvedValue({ authorId: '2' });

            await statusController.deleteStatus(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
        });

        it('should allow deletion by author', async () => {
            mockReq.params.statusId = 's1';
            mockReq.body = { authorId: '1' };
            Status.findById.mockResolvedValue({ authorId: '1' });

            await statusController.deleteStatus(mockReq, mockRes);

            expect(Status.findByIdAndDelete).toHaveBeenCalledWith('s1');
            expect(mockRes.json).toHaveBeenCalled();
        });
    });
});
