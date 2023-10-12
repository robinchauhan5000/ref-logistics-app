import { NextFunction, Request, Response } from 'express';
import IssueService from '../v1/services/issue.service';
import ApplicationSettingService from '../v1/services/applicationSetting.service';
import IssueStatusService from '../v1/services/issueStatus.service';
import logger from '../../../lib/logger';
import eventEmitter from '../../../lib/utils/eventEmitter';
import logisticsConstants from '../../../config/constant/logisticsConstants';
import { removeProtocolFromURL } from '../../../lib/utils/commonHelper.util';
import HttpRequest from '../../../lib/utils/HttpRequest';
import ModifyPayload from '../../../lib/utils/modifyPayload';

const issueServie = new IssueService();
const issueStatusService = new IssueStatusService();
const applicationSettingService = new ApplicationSettingService();
const modifyPayload = new ModifyPayload();

const clientURL = process.env.PROTOCOL_BASE_URL || '';
class IssueController {
  async createIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      if (data?.status === 'OPEN') {
        const appSettings: any = await applicationSettingService.getSupport();
        const respondentAction = {
          respondent_action: 'PROCESSING',
          short_desc: 'Complaint is being processed',
          updated_at: new Date().toISOString(),
          updated_by: {
            org: {
              name: `${removeProtocolFromURL(process.env.MAIN_SITE_URL || '')}::${logisticsConstants.CONTEXT_DOMAIN}`,
            },
            contact: {
              phone: appSettings[0].phone,
              email: appSettings[0].email,
            },
            person: {
              name: appSettings[0].name,
            },
          },
          cascaded_level: 2,
        };
        data.updated_at = new Date();
        data.issue_actions.respondent_actions.push(respondentAction);
        const savedIssue = await issueServie.create({ ...data, issueState: 'Pending' });
        if (savedIssue) {
          const issueState = {
            issueId: savedIssue._id,
            status: 'Pending',
          };
          await issueStatusService.create(issueState);
          eventEmitter.emit('live_update', { issue: 'created' });
          res.status(200).send({
            message: 'Issue create successfully.',
            data: savedIssue,
          });
        }
      } else {
        const issue: any = await issueServie.getIssueByIssueId(data.id);
        issue.status = 'CLOSED';
        issue.issueState = 'Closed';
        issue.rating = data?.rating;
        issue.issue_actions.complainant_actions = data.issue_actions.complainant_actions;
        await issue.save();
        const issueState = {
          issueId: issue._id,
          status: 'Closed',
        };
        await issueStatusService.create(issueState);
        eventEmitter.emit('live_update', { issue: 'updated' });
        res.status(200).send({
          message: 'Issue updated successfully.',
        });
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }
  async allIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, limit, search }: { skip?: number; limit?: number; search?: string } = req.query;
      const parsedSkip: number = skip || 0;
      const parsedLimit: number = limit || 10;
      const parsedSearch: string = search || '';
      const issueList = await issueServie.allIssues(parsedSkip, parsedLimit, parsedSearch);
      res.status(200).send({
        message: 'Issues fetched successfully',
        data: {
          issueList,
          issueCount: issueList.length,
        },
      });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }
  async issueById(req: Request, res: Response, next: NextFunction) {
    try {
      const issueId = req.params.id;
      const issue = await issueServie.issueById(issueId);
      res.status(200).send({
        message: 'Issue fetched successfully',
        data: {
          issue,
        },
      });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }
  async updateIssueStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const issueId = req.params.id;
      const data = req.body;
      const appSettings: any = await applicationSettingService.getSupport();
      const respondentAction = {
        respondent_action: 'RESOLVED',
        short_desc: 'Complaint is resolved.',
        updated_at: new Date(),
        updated_by: {
          org: {
            name: `${removeProtocolFromURL(process.env.MAIN_SITE_URL || '')}::${logisticsConstants.CONTEXT_DOMAIN}`,
          },
          contact: {
            phone: appSettings[0].phone,
            email: appSettings[0].email,
          },
          person: {
            name: appSettings[0].name,
          },
        },
        cascaded_level: 2,
      };

      const resolution = {
        short_desc: data.short_desc,
        long_desc: data.long_desc,
        action_triggered: data.action_triggered,
      };
      const resolution_provider = {
        respondent_info: {
          type: 'TRANSACTION-COUNTERPARTY-NP',
          organization: {
            org: {
              name: `${removeProtocolFromURL(process.env.MAIN_SITE_URL || '')}::${logisticsConstants.CONTEXT_DOMAIN}`,
            },
            contact: {
              phone: appSettings[0].phone,
              email: appSettings[0].email,
            },
            person: {
              name: appSettings[0].name,
            },
          },
          resolution_support: {
            chat_link: 'http://chat-link/respondent',
            contact: {
              phone: appSettings[0].phone,
              email: appSettings[0].email,
            },
            gros: [
              {
                person: {
                  name: 'Sam D',
                },
                contact: {
                  phone: appSettings[0].phone,
                  email: appSettings[0].email,
                },
                gro_type: 'TRANSACTION-COUNTERPARTY-NP-GRO',
              },
            ],
          },
        },
      };
      const issue: any = await issueServie.issueById(issueId);
      issue.issue_actions.respondent_actions.push(respondentAction);
      const toUpdate = {
        issue_actions: issue.issue_actions,
        status: 'RESOLVED',
        resolution,
        resolution_provider,
        issueState: 'Resolved',
      };
      const updatedIssue = await issueServie.updateIssue(issueId, toUpdate);
      const issueState = {
        issueId: issue._id,
        status: 'Resolved',
      };
      await issueStatusService.create(issueState);
      eventEmitter.emit('live_update', { issue: 'updated' });
      const headers = {};
      const onIssueStatusPayload = await modifyPayload.issueStatus(updatedIssue);
      const httpRequest = new HttpRequest(
        `${clientURL}/protocol/v1/issue_status`, //TODO: allow $like query
        'POST',
        onIssueStatusPayload,
        headers,
      );
      httpRequest.send();

      res.status(200).send({ message: 'Issue updated successfully.', updatedIssue });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      // console.log('object');
      const issueId = req.params.id;
      const issue: any = await issueServie.issueById(issueId);
      const appSettings: any = await applicationSettingService.getSupport();
      const respondentAction = {
        respondent_action: 'PROCESSING',
        short_desc: 'Complaint is being processed',
        updated_at: new Date(),
        updated_by: {
          org: {
            name: `${removeProtocolFromURL(process.env.MAIN_SITE_URL || '')}::${logisticsConstants.CONTEXT_DOMAIN}`,
          },
          contact: {
            phone: appSettings[0].phone,
            email: appSettings[0].email,
          },
          person: {
            name: appSettings[0].name,
          },
        },
        cascaded_level: 2,
      };
      issue.issue_actions.respondent_actions.push(respondentAction);
      const toUpdate = {
        issue_actions: issue.issue_actions,
        issueState: 'Processing',
      };
      const updatedIssue = await issueServie.updateIssue(issueId, toUpdate);
      const issueState = {
        issueId: issue._id,
        status: 'Processing',
      };
      await issueStatusService.create(issueState);

      eventEmitter.emit('live_update', { issue: 'updated' });
      const headers = {};
      const onIssueStatusPayload = await modifyPayload.issueStatus(updatedIssue);
      const httpRequest = new HttpRequest(
        `${clientURL}/protocol/v1/issue_status`, //TODO: allow $like query
        'POST',
        onIssueStatusPayload,
        headers,
      );
      httpRequest.send();
      res.status(200).send({ message: 'Your issue is now being processed.' });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async issueStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const issue: any = await issueServie.getIssueByIssueId(data.issue_id);
      if (issue) {
        res.status(200).send({ message: 'Issue details', issue });
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }
}

export default IssueController;
