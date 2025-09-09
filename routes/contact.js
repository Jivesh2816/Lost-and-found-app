const express = require('express');
const router = express.Router();
const { sendContactMessage, getPendingContactRequests } = require('../controllers/contactController');

router.post('/', sendContactMessage);
router.get('/admin/pending', getPendingContactRequests);

module.exports = router;


