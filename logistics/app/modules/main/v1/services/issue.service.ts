import Issue from '../../models/issue.model';
import InternalServerError from '../../../../lib/errors/internal-server-error.error';
import MESSAGES from '../../../../lib/utils/messages';
import { DuplicateRecordFoundError, NoRecordFoundError } from '../../../../lib/errors/index';
import Task from '../../models/task.model';

class IssueService {
  async create(data: any): Promise<any> {
    try {
      const existingTask = await Task.findOne({ transaction_id: data?.transaction_id });
      if (!existingTask) {
        throw new NoRecordFoundError(MESSAGES.TASK_NOT_FOUND_FOR_TRANSACTION_ID);
      }

      const existingIssue = await Issue.findOne({ id: data?.id });
      if (existingIssue) {
        throw new DuplicateRecordFoundError(MESSAGES.DUPLICATE_ISSUE_ID);
      }

      const newIssue = new Issue(data);
      const savedIssue = await newIssue.save();
      if (savedIssue) {
        return savedIssue;
      }
    } catch (error: any) {
      if (error.status === 409 || error.status === 404) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }
  async allIssues(parsedSkip: number, parsedLimit: number, searchString?: string | undefined): Promise<any> {
    try {
      const issueList = await Issue.find({
        $or: [{ id: { $regex: searchString, $options: 'i' } }, { category: { $regex: searchString, $options: 'i' } }],
      })
        .sort({ createdAt: -1 })
        .skip(parsedSkip)
        .limit(parsedLimit);
      if (issueList) {
        return issueList;
      }
    } catch (error: any) {
      if (error.status === 409) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async issueById(issueId: string): Promise<any> {
    try {
      const issue = await Issue.findOne({ _id: issueId });
      if (issue) {
        return issue;
      }
    } catch (error: any) {
      if (error.status === 409) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }
  async getIssueByIssueId(id: string): Promise<any> {
    try {
      const issue = await Issue.findOne({ id: id });
      if (issue) {
        return issue;
      }
    } catch (error: any) {
      if (error.status === 409) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async updateIssue(id: string, toUpdate: any): Promise<any> {
    try {
      const issue = await Issue.findOneAndUpdate({ _id: id }, { $set: toUpdate });
      if (issue) {
        return issue;
      }
    } catch (error: any) {
      if (error.status === 409) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }
}

export default IssueService;
