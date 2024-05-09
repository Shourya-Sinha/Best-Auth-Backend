const UserController  = require('../Controller/AuthController');
const router = require('express').Router();
const upload = require('../Utils/multer');
const imageUploader = require('../UploadsImage/imageUpload');

router.post('/v1/users/login', UserController.LoginUser);
router.post('/v1/users/register', UserController.RegisterUser, UserController.sendOtp );
router.post('/v1/users/send-otp', UserController.sendOtp);
router.post('/v1/users/verify-otp', UserController.verifyOtp);
router.post('/v1/users/reset-password', UserController.ResetPassowrd);

router.post('/v1/users/change-password', UserController.ChangePassword);

router.post('/v1/users/upload', UserController.Protect, upload.single('image'), imageUploader.uploadImage );

module.exports = router;
