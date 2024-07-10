const express = require('express');
const { fileUpload } = require('../controllers/fileUpload.controller');
const router = express.Router();

router.post('/upload',fileUpload);


module.exports=router;