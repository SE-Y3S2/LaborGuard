const Report = require('../models/Report');

exports.createReport = async (req, res) => {
    try {
        const { reporterId, targetType, targetId, reason } = req.body;

        const report = new Report({
            reporterId,
            targetType,
            targetId,
            reason
        });

        await report.save();
        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error creating report directly', error: error.message });
    }
};

exports.getReports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status;

        const query = status ? { status } : {};

        const reports = await Report.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reports', error: error.message });
    }
};

exports.updateReportStatus = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status } = req.body;

        const report = await Report.findByIdAndUpdate(
            reportId,
            { status },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error updating report status', error: error.message });
    }
};
