import express from 'express';
 import SubscribeController from '../controllers/subscribe.controller';
const router = express.Router();

const subscribeController = new SubscribeController();

// Route for handling subscription requests
router.post('/on_subscribe', subscribeController.onSubscribe);

export default router;
