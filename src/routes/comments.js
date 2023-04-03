const express = require("express");

const router = express.Router();

const controller = require("../controllers/Comments");
const verifyToken = require("../middleware/verifyToken");

router.post("/new-comment", verifyToken, controller.saveComments);
router.delete("/delete-comment/:id", verifyToken, controller.deleteComments);

module.exports = router;
