const express = require('express')
const { body,query } = require('express-validator')
const router = express.Router();
const rideController = require('../controllers/ride.controller')
const authMiddleware = require('../middlewares/auth.middleware')


router.post('/create',
    authMiddleware.authUser,
    body('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
    body('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
    body('vehicleType').isString().isIn([ 'auto', 'car' , 'moto']).withMessage('Invalid vehicle Type'),
    rideController.createRide
)

router.post('/:rideId/accept',
    authMiddleware.authCaptain,
    rideController.acceptRide
)

router.post('/:rideId/start',
    authMiddleware.authCaptain,
    body('otp').isString().isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be a 6-digit number'),
    rideController.startRide
)

router.post('/:rideId/complete',
    authMiddleware.authCaptain,
    body('amountCollected').isFloat({ min: 0 }).withMessage('Amount collected must be a non-negative number'),
    body('paymentMethod').isIn(['cash', 'upi']).withMessage('Payment method must be cash or upi'),
    rideController.completeRide
)

router.patch('/:rideId/payment-method',
    authMiddleware.authUser,
    body('paymentMethod').isIn(['cash', 'upi']).withMessage('Payment method must be cash or upi'),
    rideController.selectPaymentMethod
)

router.post('/:rideId/cancel',
    authMiddleware.authUser,
    rideController.cancelRide
)

router.get('/active/captain',
    authMiddleware.authCaptain,
    rideController.getActiveRideForCaptain
)

router.get('/active/user',
    authMiddleware.authUser,
    rideController.getActiveRideForUser
)

router.get('/get-fare',
    authMiddleware.authUser,
    query('pickup').isString().isLength({ min: 3 }).withMessage('Invalid Pickup address'),
    query('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
    rideController.getFare
)

module.exports = router;
