const asyncHandler = require('../middlewares/async');
const Bootcmap = require('../models/Bootcmap');
const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');

exports.getAllCourses = asyncHandler(async(req, res, next) => {
    let query;
    if (req.params.bootcampId) {
        query = await Course.find({
            bootcamp: req.params.bootcampId
        });
    } else {
        query = Course.find().populate('bootcamp');
    }
    const allCourses = await query;
    res.status(200).json({ sucess: true, count: allCourses.length, data: allCourses });
});


exports.getSingleCourse = asyncHandler(async(req, res, next) => {

    const course = await Course.findById(req.params.id).populate('bootcamp');
    if (!course) {
        return next(new ErrorResponse('Course not found with id', 404));
    }
    res.status(200).json({ sucess: true, count: course.length, data: course });
});

exports.addCourse = asyncHandler(async(req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;


    const bootcamp = await Bootcmap.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`),
            404
        );
    }

    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to add  this course`,
                401
            )
        );
    }


    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        data: course
    });
});

exports.updateCourse = asyncHandler(async(req, res, next) => {
    let course = await Course.findById(req.params.id);

    if (!course) {
        return next(
            new ErrorResponse(`No course with the id of ${req.params.id}`),
            404
        );
    }
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update  this course`,
                401
            )
        );
    }


    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: course
    });
});

exports.deleteCourse = asyncHandler(async(req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(
            new ErrorResponse(`No course with the id of ${req.params.id}`),
            404
        );
    }
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to delete  this course`,
                401
            )
        );
    }

    await course.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});