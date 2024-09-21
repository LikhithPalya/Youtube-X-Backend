import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getSubscribedChannels,
    toggleSubscription,
    getUserChannelSubscribers,
} from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT);

router.get("/c", getSubscribedChannels);
router.post("/c/:channelId", toggleSubscription);

router.get("/u/:subscriberId", getUserChannelSubscribers);

export default router;
