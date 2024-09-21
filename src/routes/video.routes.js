import {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
} from "../controllers/video.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/v", getAllVideos);
router.post(
    "/",
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    publishVideo
);
router.get("/:videoId", getVideoById);
router.patch("/:videoId", upload.single("thumbnail"), updateVideo);
router.delete("/:videoId", deleteVideo);

router.patch("/toggle/publish/:videoId", togglePublishStatus);

export default router;
