const asyncHandler = require('../middlewares/async');
const Bootcamp = require('../models/Bootcmap');

const ErrorResponse = require('../utils/errorResponse');
const path = require('path');
const { error } = require('console');
const Bootcmap = require('../models/Bootcmap');



// get all bootcamps
// get /api/V1/bootcamps
exports.getBootcamp = asyncHandler(async(req, res, next) => {


    res.status(200).json(res.advanceResult);


});

exports.getSingleBootcamp = asyncHandler(async(req, res, next) => {

    const singleBootcamps = await Bootcamp.findById(req.params.id);
    if (!singleBootcamps) {
        return next(new ErrorResponse('Bootcamp not found with id', 404));
    }
    res.status(200).json({ sucess: true, data: singleBootcamps });

});

exports.createBootcamp = asyncHandler(async(req, res, next) => {
    req.body.user = req.user.id;
    const bootcampdata = await Bootcamp.findOne({
        user: req.user.id
    });
    if (bootcampdata && req.user.role !== 'admin') {
        return next(new ErrorResponse('Already have one bootcamp', 400));
    }
    const newBootcamp = await Bootcamp.create(req.body);
    res.status(200).json({ sucess: true, data: newBootcamp });

});

exports.updateBootcamp = asyncHandler(async(req, res, next) => {

    let newBootcamp = await Bootcamp.findById(req.params.id);
    if (!newBootcamp) {
        return next(new ErrorResponse('Bootcamp not found with id', 404));
    }
    if (newBootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.params.id} is not authorized to update this bootcamp`,
                401
            )
        );
    }
    newBootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ sucess: true, data: newBootcamp });


});

exports.deleteBootcamp = asyncHandler(async(req, res, next) => {

    let newBootcamp = await Bootcamp.findById(req.params.id);
    if (!newBootcamp) {
        return next(new ErrorResponse('Bootcamp not found with id', 404));
    }
    if (newBootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.params.id} is not authorized to delet this bootcamp`,
                401
            )
        );
    }
    newBootcamp.remove();
    res.status(200).json({ sucess: true, data: {} });

});

exports.uploadFileBootcamp = asyncHandler(async(req, res, next) => {

    const newBootcamp = await Bootcamp.findById(req.params.id);
    if (!newBootcamp) {
        return next(new ErrorResponse('Bootcamp not found with id', 404));
    }
    if (!req.files) {
        return next(new ErrorResponse('Plase Upload Photo', 400));
    }
    console.log(req.files);
    const file = req.files.file;
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse('Please Upload Imag File', 400));
    }

    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please Upload Imag File less then ${process.env.MAX_FILE_UPLOAD}`, 400));
    }

    file.name = `photo_${req.params.id}${path.parse(file.name).ext}`;
    console.log(file.name);

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse('Problem with file upload', 500));
        }
        await Bootcmap.findByIdAndUpdate(req.params.id, { photo: file.name });
        res.status(200).json({ sucess: true, data: file.name });
    });

    // res.status(200).json({ sucess: true, data: {} });

});