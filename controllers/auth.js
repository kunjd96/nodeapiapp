const asyncHandler = require('../middlewares/async');
const User = require('../models/User');
const { use } = require('../routes/auth');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

exports.registerUser = asyncHandler(async(req, res, next) => {
    const { name, email, password, role } = req.body;
    const user = await User.create({
        name,
        email,
        password,
        role
    });
    sedTokenReponse(user, 200, res);
    // const token = user.getSignedJwtToken();
    // res.status(200).json({ success: true, Data: user, token });
});

exports.loginUser = asyncHandler(async(req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorResponse('Enter Email And Password', 400));
    }
    const user = await User.findOne({ email: email }).select('+password');
    if (!user) {
        return next(new ErrorResponse('Invalid Credentaials', 401));
    }
    const checkPasswordmatch = await user.matchPassword(password);
    if (!checkPasswordmatch) {
        return next(new ErrorResponse('Invalid Credentaials', 401));
    }
    sedTokenReponse(user, 200, res);
    // const token = user.getSignedJwtToken();
    // res.status(200).json({ success: true, token });
});

exports.getMe = asyncHandler(async(req, res, next) => {
    const user = req.user;
    const userData = await User.findById(user.id);
    res.status(200)
        .json({
            success: true,
            data: userData
        });
});

exports.logoutUser = asyncHandler(async(req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200)
        .json({
            success: true,
            data: {}
        });
});

exports.forgotPassword = asyncHandler(async(req, res, next) => {

    const userData = await User.findOne({ email: req.body.email });
    if (!userData) {
        return next(new ErrorResponse('No User Email ', 404));
    }
    const resetToken = userData.getResetToken();
    console.log(resetToken);
    await userData.save({ validateBeforeSave: false });
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
    const message = `Reset Link ${resetUrl}`;
    try {
        await sendEmail({
            email: userData.email,
            subject: 'password reset token',
            message
        });
        res.status(200)
            .json({
                success: true,
                data: 'Email Sent'
            });
    } catch (error) {
        console.log(error);
        userData.resetPasswordToken = undefined;
        userData.resetPasswordExpire = undefined;
        await userData.save({
            validateBeforeSave: false
        });
        return next(new ErrorResponse('Eamil Not Sent', 500));
    }


});

exports.resetPassword = asyncHandler(async(req, res, next) => {

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
    const userData = await User.findOne({
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now()
        }
    });
    if (!userData) {
        return next(new ErrorResponse('Invalid Token', 400));
    }
    console.log(userData);
    userData.password = req.body.password;
    userData.resetPasswordToken = undefined;
    userData.resetPasswordExpire = undefined;
    await userData.save();
    sedTokenReponse(userData, 200, res);

});

const sedTokenReponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    const option = {
        expires: new Date(Date.now() + process.env.JWT_EXPIRE_COOKIE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') {
        option.secure = true;
    }
    res.status(statusCode).cookie('token', token, option)
        .json({
            success: true,
            token
        });
};