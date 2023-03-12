const express = require("express");

const router = express.Router();

const controller = require("../controllers/users");
const verifyToken = require("../middleware/verifyToken");

router.post("/register", controller.save);
router.post("/login", controller.login);
router.delete("/delete", verifyToken, controller.delete);

module.exports = router;
