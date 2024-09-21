import {
    toggleVideoLike,
    toggleCommentLike,
    toggelTweetLike,
    getLikedVideos,
} from "../controllers/like.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/toggle/v/:videoId", toggleVideoLike);
router.post("/toggle/c/:commentId", toggleCommentLike);
router.post("/toggle/t/:tweetId", toggelTweetLike);
router.get("/videos", getLikedVideos);

export default router;
