const express = require('express');
const router = express.Router();
const { register, login, logout} = require('../controller/userController');
const {verifyToken} = require("../auth");

// Post register route
router.post('/register', register);

// Post login route
router.post('/login', login);

// Post logout route
router.post('/logout', verifyToken, logout);

module.exports = router;
