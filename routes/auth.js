const express = require('express');
const { protect } = require('../middlewares/auth');
const { registerUser, loginUser, getMe, forgotPassword, resetPassword, logoutUser } = require('../controllers/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/getMe', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/logout', logoutUser);

module.exports = router;