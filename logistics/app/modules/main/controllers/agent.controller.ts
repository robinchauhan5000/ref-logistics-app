import { NextFunction, Request, Response } from 'express';
import AgentService from '../v1/services/agent.service';
import uploadToS3 from '../../../lib/utils/uploadToS3';
import TaskService from '../v1/services/task.service';
import logger from '../../../lib/logger';
import eventEmitter from '../../../lib/utils/eventEmitter';
import { getSearchResponse } from '../../../lib/utils/utilityFunctions';
import SearchDumpService from '../v1/services/searchDump.service';
interface RequestExtended extends Request {
  user?: any;
}
// import UserService from '../v1/services/user.service'

const agentService = new AgentService();
const taskService = new TaskService();
const searchDumpService = new SearchDumpService();
class AgentContoller {
  async searchAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const searchPayload = req.body;
      const agents = await agentService.getAgentList(searchPayload);
      const startGPS = searchPayload?.fulfillments[0]?.start?.location?.gps.split(',');
      const endGPS = searchPayload?.fulfillments[0]?.start?.location?.gps.split(',');
      const { delivery_id, RTO_id } = getSearchResponse(startGPS, endGPS, agents[0]);
      await searchDumpService.create({ delivery: delivery_id, rto: RTO_id });

      //calculate distcance and price
      res.send({ data: agents, delivery_id, RTO_id });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async updateAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const agentId = req.params.agentId;
      const agentData = req.body;
      const updatedAgent = await agentService.update(agentData, agentId);
      if (updatedAgent) {
        res.send({ message: 'Detail updated.', data: updatedAgent });
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      let result: any = '';
      for (const file of files) {
        result = await uploadToS3(file); // result.Location
      }

      res.send({ message: 'Successfully uploaded', data: { url: result.Location } });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { startLocation, endLocation } = req.body;
      const { agents, agentCount } = await agentService.searchAgent(startLocation, endLocation);
      res.status(200).send({
        msg: 'Agents fetched successfully',
        data: {
          agents,
          count: agentCount,
        },
      });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async updateLocation(req: RequestExtended, res: Response, next: NextFunction) {
    try {
      const userId = req.user.user.id;
      const agentData: any = await agentService.getAgent(userId);
      const data = req.body;
      const toUpdate = {
        currentLocation: { coordinates: data.currentLocation, type: 'Point', updatedAt: new Date() },
        isOnline: data.isOnline,
      };
      const result = await agentService.update(toUpdate, agentData._id);
      eventEmitter.emit('driverLocation', { location: data.currentLocation, assignee: agentData._id });
      if (result) {
        res.status(200).send({ msg: 'Location updated.' });
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async getQuotes(req: RequestExtended, res: Response, next: NextFunction) {
    try {
      res.status(200).send({ message: 'List found' });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }
  async getTasks(req: RequestExtended, res: Response, next: NextFunction) {
    try {
      const userId = req.user.user.id;
      const agentData = await agentService.getAgent(userId);
      const tasks = await taskService.getTasks(agentData?._id);

      res.status(200).send({
        message: 'List found',
        data: {
          tasks,
        },
      });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async delete(req: RequestExtended, res: Response, next: NextFunction) {
    try {
      const userId = req.user.user.id;
      const id: string = req.params.id;
      await agentService.deleteAgent(userId, id);
      res.status(200).json({
        message: 'Agent Deleted Successfully',
      });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async blockAgent(req: RequestExtended, res: Response, next: NextFunction) {
    try {
      const { enabled, agentId } = req.body;
      const userId = req.user.user.id;
      await agentService.blockAgent(agentId, userId, enabled);
      res.status(200).send({
        message: 'Status changes successfully',
      });
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const agentDetails = await agentService.getAgentDetails(id);
      if (agentDetails) {
        res.status(200).json({
          data: {
            ...agentDetails,
          },
        });
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

  async getLiveLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const agentDetails: any = await agentService.getAgentById(id);
      if (agentDetails) {
        res.status(200).json({
          data: {
            lat: agentDetails?.currentLocation?.coordinates[0],
            lng: agentDetails?.currentLocation?.coordinates[1],
          },
        });
      }
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }
}

export default AgentContoller;
