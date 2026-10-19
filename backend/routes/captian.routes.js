const captianController = require('../controllers/captian.controller.js');
const express=require('express');
const authMiddleware=require('../middlewares/auth.middleware.js');
const router=express.Router();
const { body } = require('express-validator');


router.post('/register', [
    body('fullname.firstname').notEmpty().withMessage('First name is required'),
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('vehicle.colour').isLength({ min: 3 }).withMessage('Colour must be at least 3 characters long'),
    body('vehicle.plate').isLength({ min: 3 }).withMessage('Plate must be at least 3 characters long'),
    body('vehicle.capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
    body('vehicle.vehicleType').isIn(['car', 'motorcycle', 'auto']).withMessage('Vehicle type must be either car, motorcycle, or auto')
], captianController.registerCaptain);

router.post('/login', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], captianController.loginCaptain);


router.get('/profile', authMiddleware.authCaptain, captianController.getCaptianProfile);
router.get('/stats', authMiddleware.authCaptain, captianController.getCaptainStats);
router.patch('/profile-image', authMiddleware.authCaptain, captianController.updateProfileImage);

router.patch('/payment-details',
    authMiddleware.authCaptain,
    body('upiId')
        .trim()
        .matches(/^[\w.-]{2,256}@[A-Za-z]{2,64}$/)
        .withMessage('Enter a valid UPI ID, such as name@bank'),
    captianController.updatePaymentDetails
);

router.get('/logout',authMiddleware.authCaptain, captianController.logoutCaptian)

module.exports=router;