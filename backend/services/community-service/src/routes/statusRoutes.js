const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');

router.post('/', statusController.createStatus);
router.get('/feed/:userId', statusController.getStatuses);
router.delete('/:statusId', statusController.deleteStatus);

module.exports = router;
