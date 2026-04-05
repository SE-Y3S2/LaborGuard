const express = require('express');
const router  = express.Router();
const statusController = require('../controllers/statusController');
const { protect }      = require('../middleware/authMiddleware');

router.use(protect);

router.post('/',            statusController.createStatus);
router.get('/:userId',      statusController.getStatuses);
router.delete('/:statusId', statusController.deleteStatus);

module.exports = router;