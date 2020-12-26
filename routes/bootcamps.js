const express = require('express');
const { getBootcamp, createBootcamp, getSingleBootcamp, updateBootcamp, uploadFileBootcamp, deleteBootcamp } = require('../controllers/bootcamps');
const router = express.Router();
const courserouter = require('./courses');
const advanceResult = require('../middlewares/advanceResults');
const Bootcmap = require('../models/Bootcmap');
const { protect, rolebaseAuth } = require('../middlewares/auth');

router.use('/:bootcampId/cources', courserouter);

router.route('/').get(advanceResult(Bootcmap, 'courses'), getBootcamp)
    .post(protect, rolebaseAuth('publisher', 'admin'), createBootcamp);
router.route('/:id').get(getSingleBootcamp).
put(protect, rolebaseAuth('publisher', 'admin'), updateBootcamp)
    .delete(protect, rolebaseAuth('publisher', 'admin'), deleteBootcamp);
router.route('/:id/photo').put(protect, rolebaseAuth('publisher', 'admin'), uploadFileBootcamp);

module.exports = router;