const express = require('express');
const router = express.Router();
const { register, login, logout, joinProblem, donate} = require('../controller/userController');
const {verifyToken} = require("../middleware/auth");

// Post register route
router.post('/register', register);

// Post login route
router.post('/login', login);

// Post logout route
router.post('/logout', verifyToken, logout);

// Post join volunteer route
router.post('/join/:id', verifyToken, joinProblem)

router.post('/donate/:id', verifyToken, donate)

module.exports = router;
