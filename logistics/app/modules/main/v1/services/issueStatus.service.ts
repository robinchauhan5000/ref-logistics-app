import InternalServerError from '../../../../lib/errors/internal-server-error.error';

import IssueStatus from '../../models/issueStatus.model';
import MESSAGES from '../../../../lib/utils/messages';

class IssueStatusService {
  async create(data: any): Promise<any> {
    try {
      const issueStatus = new IssueStatus(data);
      const savedObj = await issueStatus.save();
      if (savedObj) {
        return true;
      }
    } catch (error: any) {
      if (error.status === 409) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }
  async getIssue(query: any): Promise<any> {
    try {
      const list = await IssueStatus.find(query);
      if (list.length > 0) {
        return list;
      } else {
        return [];
      }
    } catch (error) {
      throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
}

export default IssueStatusService;
