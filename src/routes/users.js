"use strict";

const express = require("express");

const router = express.Router();

const controller = require("../controllers/users");

router.post("/register", controller.save);
router.post("/login", controller.login);
router.delete("/delete/:id", controller.delete);

module.exports = router;
