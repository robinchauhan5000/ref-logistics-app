import express from 'express';
const router = express.Router();

import IssueController from '../controllers/issue.contorller';
import authentication from '../../../lib/middlewares/authentication';

const issueController = new IssueController();

router.post('/v1/logistics/issue', issueController.createIssue);
router.get('/v1/issue/list',authentication, issueController.allIssue);
router.get('/v1/issue/:id', authentication, issueController.issueById);
router.post('/v1/issue/updateStatus/:id', authentication, issueController.updateStatus);
router.post('/v1/issue/update/:id', authentication, issueController.updateIssueStatus);
router.post('/v1/logistics/issueStatus', issueController.issueStatus);

export default router;
