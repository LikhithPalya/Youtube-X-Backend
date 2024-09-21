import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addComment,
    getVideoComments,
    deleteComment,
    updateComment,
} from "../controllers/comment.controller.js";
const router = Router();

router.use(verifyJWT);

router.get("/:videoId", getVideoComments);
router.post("/:videoId", addComment);

router.delete("/c/:commentId", deleteComment);
router.patch("/c/:commentId", updateComment);

export default router;
