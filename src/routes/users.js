const express = require("express");

const router = express.Router();

const controller = require("../controllers/users");
const verifyToken = require("../middleware/verifyToken");

router.get("/get-stats-by-users", verifyToken, controller.getStatsByUsers);
router.post("/register", controller.save);
router.post("/login", controller.login);
router.put("/edit-user", verifyToken, controller.editUser);
router.delete("/delete", verifyToken, controller.delete);

module.exports = router;
