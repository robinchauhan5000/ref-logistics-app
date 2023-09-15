import express from 'express'
import OndcController from '../controllers/ondc.controller'

const router = express.Router()
const ondcController = new OndcController()

router.post('/client/search', ondcController.agentSearch)

router.post('/client/Init', ondcController.orderInit)

router.post('/client/confirm', ondcController.orderConfirm)

router.post('/client/update', ondcController.orderUpdate)

router.post('/client/status', ondcController.orderStatus)

router.post('/client/support', ondcController.support)

router.post('/client/cancel', ondcController.cancel)
router.post('/client/track', ondcController.track)

router.post('/client/issue', ondcController.issue)
router.post('/client/issue_status', ondcController.issueStatus)

export default router
