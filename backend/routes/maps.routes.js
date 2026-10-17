const express=require("express")
const router=express.Router()
const mapController = require("../controllers/map.controller")
const authMiddleware = require('../middlewares/auth.middleware')
const { query } = require("express-validator")

router.get(
    '/get-coordinates',
    query('address').isString().trim().isLength({ min: 3 }),
    authMiddleware.authUser,
    mapController.getCoordinates
)

router.get('/get-distance-time',
    query('origin').isString().isLength({ min: 3 }),
    query('destination').isString().isLength({ min: 3 }),
    authMiddleware.authUser,
    mapController.getDistanceTime
)

router.get('/get-suggestions',
    query('input').isString().trim().isLength({ min: 3 }).withMessage('Input must be at least 3 characters long'),
    authMiddleware.authUser,
    mapController.getAutoCompleteSuggestion
)

module.exports = router;