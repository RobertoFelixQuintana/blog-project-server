const express = require("express");

const router = express.Router();

const controller = require("../controllers/Issues");
const verifyToken = require("../middleware/verifyToken");

router.get("/get-posts", verifyToken, controller.getPosts);
router.get("/get-posts/:id", verifyToken, controller.getPostsById);
router.put("/edit-post", verifyToken, controller.editPost);
router.put("/set-like", verifyToken, controller.setLike);
router.post("/save-posts", verifyToken, controller.savePosts);
router.delete("/delete-posts", verifyToken, controller.deletePosts);

module.exports = router;
