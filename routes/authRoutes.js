const express = require("express");
const router = express.Router();
const { generateToken } = require("../controllers/authController");

router.post("/tokens", generateToken);

module.exports = router;
