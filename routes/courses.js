const express = require('express');
const { protect } = require('../middlewares/auth');
const { getAllCourses, getSingleCourse, addCourse, updateCourse, deleteCourse } = require('../controllers/courses');
const router = express.Router({ mergeParams: true });


router.route('/').get(getAllCourses).post(protect, addCourse);
router.route('/:id').get(getSingleCourse).put(protect, updateCourse).delete(protect, deleteCourse);


module.exports = router;