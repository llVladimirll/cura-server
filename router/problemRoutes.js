const express = require('express');
const router = express.Router();
const { createProblem, getProblems, detailProblem } = require('../controller/problemController');
const { verifyToken } = require("../middleware/auth");
const createUpload = require('../config/cloudinary');


const upload = createUpload('cura/problem');
router.post('/', upload.single('image'), verifyToken, createProblem);

router.get('/all', getProblems);

router.get('/:id', detailProblem);
module.exports = router;
