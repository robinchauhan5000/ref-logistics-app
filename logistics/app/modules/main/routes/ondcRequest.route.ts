import express from 'express';
import OndcRequestController from "../controllers/ondcRequest.controller";

const router = express.Router();

const ondcRequestController = new OndcRequestController();
router.get('/v1/ondcRequest', ondcRequestController.getOndcFilteredRequests);
router.get('/v1/ondcRequest/list', ondcRequestController.getOndcRequests);

export default router;
