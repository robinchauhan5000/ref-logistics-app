import { NoRecordFoundError, UnauthorisedError, WarningError } from '../../../../lib/errors/index';
import Agent from '../../models/agent.model';
import MESSAGES from '../../../../lib/utils/messages';
import InternalServerError from '../../../../lib/errors/internal-server-error.error';
import mergedEnvironmentConfig from '../../../../config/env.config';
import ServiceApi from '../../../../lib/utils/serviceApi';
import Task from '../../models/task.model';
import Role from '../../models/role.model';
import User from '../../models/user.model';
import NotificationService from './notifications.service';

// const notificationServiceURL = mergedEnvironmentConfig.default.intraServiceApiEndpoints.notification

const mainSiteURL = mergedEnvironmentConfig.default.mainSiteURL;
class AgentService {
  notificationService = new NotificationService();
  async create(agentData: any): Promise<any> {
    try {
      const agent = new Agent(agentData);
      const savedAgent = await agent.save();
      if (savedAgent) {
        const mailData = {
          emailTemplate: 'invitation.ejs.html',
          payload: {
            username: agentData.firstName,
            emailRecipients: agentData.email,
            subject: 'ONDC logistics',
            verificationLink: `${mainSiteURL}/create-password/${agentData.userId}`,
          },
        };
        const currentUser = { id: agentData.userId };
        ServiceApi.sendEmail(mailData, currentUser, '');
        return true;
      }
    } catch (error) {
      throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
  async getAllDriver() {
    try {
      const agents: any = await Agent.find({}).populate('userId');
      return agents;
    } catch (error) {
      throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async isAgentDetailsUpdated(userId: string) {
    try {
      const agent = await Agent.findOne({ userId: userId }).select('isDetailsUpdated');
      return agent;
    } catch (error) {
      throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async update(data: any, agentId: string): Promise<any> {
    try {
      const user: any = await Agent.findById(agentId).populate({ path: 'userId', select: 'name' });
      if (data?.lastName || data?.firstName) {
        await User.findByIdAndUpdate(user?.userId?._id, {
          $set: { name: `${data?.firstName } ${data?.lastName}`, firstName: data?.firstName, lastName: data?.lastName },
        });
      }

      const updatedAgent: any = await Agent.findOneAndUpdate(
        { _id: agentId },
        { $set: { ...data, isDetailsUpdated: true } },
        { new: true },
      );
      if (updatedAgent !== null) {
        return updatedAgent;
      } else {
        throw new NoRecordFoundError(MESSAGES.USER_NOT_EXISTS);
      }
    } catch (error: any) {
      if (error.status === 404) {
        throw error;
      }

      throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async searchAgent(startLocation: string, _endLocation: string): Promise<any> {
    try {
      const [startLat, startLong] = startLocation.split(',');
      const query = {
        isOnline: true,
        currentLocation: {
          $near: {
            $geometry: { type: 'Point', coordinates: [startLat||0, startLong||0] },
            $minDistance: 0,
            $maxDistance: 50000000000000000000000,
          },
        },
      };
      const agents = await Agent.find(query)
        .select('userId vehicleDetails.vehicleNumber')
        .populate({ path: 'userId', select: 'name mobile email vehicleDetails.vehicleNumber' })
        .lean();
      const agentCount = await Agent.find(query).count();
      if (!agents) {
        throw new NoRecordFoundError(MESSAGES.USER_NOT_EXISTS);
      }

      return { agents, agentCount };
    } catch (error: any) {
      console.log("errorMonitor++++++++",error);
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getAgentList(searchPayload: any) {
    try {
      const gps = searchPayload?.fulfillments[0]?.start?.location?.gps;
      const coordinates = gps.split(',');
      const startLat = coordinates[0];
      const startLong = coordinates[1];
      const query = {
        $and: [
          // { isOnline: true },
          // { isAvailable: true },
          {
            currentLocation: {
              $near: {
                $geometry: { type: 'Point', coordinates: [startLat, startLong] },
                $minDistance: 0,
                $maxDistance: 50000000000,
              },
            },
          },
        ],
      };
      const agents: any = await Agent.find(query)
        .populate({ path: 'userId', select: 'name enabled' })
        .select('userId addressDetails basePrice pricePerkilometer')
        .limit(1);
      const activeAgents = agents?.filter((agent: any) => agent.userId.enabled === 1);
      return activeAgents;
    } catch (error: any) {
      console.log({ error });
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getAgent(userId: string) {
    try {
      const agent = await Agent.findOne({ userId });
      if (agent) {
        return agent;
      } else {
        throw new NoRecordFoundError(MESSAGES.USER_NOT_EXISTS);
      }
    } catch (error: any) {
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getAgentById(id: string) {
    try {
      const agent = await Agent.findById(id);
      if (agent) {
        return agent;
      } else {
        throw new NoRecordFoundError(MESSAGES.USER_NOT_EXISTS);
      }
    } catch (error: any) {
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getAgentDetails(id: string) {
    try {
      const agentDetails: any = await Agent.findById(id).populate({ path: 'userId', select: 'name mobile email' });
      let totalTasksCount = 0;
      let tasksInProgress = 0;
      let completedTasks = 0;
      const inProgressStatus = ['Searching-for-Agent', 'Agent-assigned', 'Order-picked-up', 'Out-for-delivery'];
      const completedTasksStatus = ['RTO-Delivered', 'RTO-Disposed', 'Order-delivered'];
      const totalTasks: any = await Task.find({ assignee: id, is_confirmed: true });
      if (totalTasks !== null) {
        totalTasksCount = totalTasks.filter((task: any) => task.is_confirmed === true).length;
        tasksInProgress = totalTasks.filter((task: any) => inProgressStatus.includes(task.status)).length;
        completedTasks = totalTasks.filter((task: any) => completedTasksStatus.includes(task.status)).length;
      }

      return { agentDetails, totalTasksCount, tasksInProgress, completedTasks };
    } catch (error: any) {
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getTasks(userId: string): Promise<any> {
    try {
      const tasks = await Task.find({ assignee: userId });
      return tasks;
    } catch (error: any) {
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async deleteAgent(userId: string, id: string) {
    try {
      const user = await User.findById({ _id: userId }); // checking if the user exists that is trying to delete the agent!
      if (!user) {
        throw new NoRecordFoundError(MESSAGES.MEMBER_NOT_EXISTS);
      }

      const agentToDelte: any = await Agent.findById(id).select({ userId: 1 }); // finding the agent to delete
      const assignedTasks = await Task.find({ assignee: agentToDelte._id }); // finding if the agent is assigned to any task
      if (assignedTasks && assignedTasks.length > 0) {
        throw new WarningError(MESSAGES.DELETE_AGENT_ERROR);
      }

      const role = await Role.findOne({ _id: user?.role });

      if (role?.name === 'Admin' || role?.name === 'Super Admin') {
        // checking the role of the user deleting the agent
        await Agent.findByIdAndRemove(id,{
          lean:true
        }); // delete agent from the Db
        await User.findByIdAndRemove(agentToDelte?.userId,{
          lean:true
        }); // delete the user related to agent from the Db
        return true;
      } else {
        throw new UnauthorisedError(MESSAGES.UNAUTHORISED_ERROR);
      }
    } catch (error: any) {
      if (error.status === 404 || error.status === 401 || error.status === 403 || error.status === 418) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async blockAgent(agentId: string, userId: string, enabled: number): Promise<any> {
    try {
      const user: any = await User.findById({ _id: userId });
      const role: any = await Role.findOne({ _id: user.role });

      if (role.name === 'Admin' || role.name === 'Super Admin') {
        const agentDetails: any = await Agent.findOneAndUpdate(
          { _id: agentId },
          {
            $set: {
              isOnline: false,
            },
          },
          { new: true },
        );
        const userTask: any = await Task.find({ assignee: agentDetails._id });
        if (userTask?.length) {
          throw new WarningError(MESSAGES.DELETE_AGENT_ERROR);
        } else {
          if (enabled === 1) {
            await User.findOneAndUpdate(
              {
                _id: agentDetails.userId,
              },
              { $unset: { failedLoginAttempts: 1, isAccountLocked: 1, accountLockedAt: 1 } },
            );
          }
          await User.findOneAndUpdate(
            {
              _id: agentDetails.userId,
            },
            {
              $set: { enabled, activeToken: '' },
            },
          );
        }
      } else {
        throw new UnauthorisedError(MESSAGES.UNAUTHORISED_ERROR);
      }
    } catch (error: any) {
      if (error.status === 404 || error.status === 401 || error.status === 403 || error.status === 418) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async toggleIsOnline(id: string, isOnline: boolean): Promise<any> {
    try {
      const agent: any = await Agent.findOne({ userId: id });
      const task: any = await Task.findOne({ assignee: agent._id });
      if (task?.status === 'Agent-assigned') {
        if (!isOnline) {
          task.agentOfflineTime = new Date().getTime();
          agent.isOnline = false;
          await task.save();
          agent.isAvailable = true;
          await Task.updateOne(
            { _id: task._id },
            {
              $unset: { assignee: '', assignedBy: '' },
              $set: { status: 'Searching-for-Agent' },
            },
          );
        }
      }

      if (isOnline === true) {
        await this.notificationService.create({
          text: 'One Driver is Online',
          type: 'Driver',
          typeId: agent._id,
          status: 'Unread',
        });
        agent.isAvailable = true;
        agent.isOnline = true;
      } else if (isOnline === false) {
        agent.isAvailable = true;
        agent.isOnline = false;
      }

      await agent.save();
      return { task: task ? task : {}, notify: task ? true : false, agentId: agent._id };
    } catch (error) {
      throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async updateAvailability(toupdate: any, agentId: string) {
    try {
      const updatedAgent = await Agent.findOneAndUpdate({ _id: agentId }, { $set: toupdate });
      return updatedAgent;
    } catch (error) {
      throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
  async disableAgent(agentId: string) {
    try {
      const agentDetails: any = await Agent.findOne({ _id: agentId });
      const updatedAgent = await User.findOneAndUpdate(
        {
          _id: agentDetails.userId,
        },
        {
          $set: { enabled: 2 },
        },
      );
      return updatedAgent;
    } catch (error) {
      throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
  async markOnlineOrOffline(status: boolean) {
    try {
            const users: any = await User.find({'enabled': 1})
      return await Agent.updateMany({userId: { $in:await users.map((user: any) => user._id) }  }, { $set: { isOnline: status, isAvailable: status } });
    } catch (error) {
      throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  //   async getAllDriver() {
  //     try {
  //       const agents: any = await Agent.find({}).populate('userId');
  //       return agents;
  //     } catch (error) {
  //       throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
  //     }
  //   }
}

export default AgentService;
