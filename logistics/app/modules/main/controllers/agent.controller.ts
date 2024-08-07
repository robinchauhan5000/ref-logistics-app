import { NextFunction, Request, Response } from 'express';
import AgentService from '../v1/services/agent.service';
// import uploadToS3 from '../../../lib/utils/uploadToS3';
import TaskService from '../v1/services/task.service';
import logger from '../../../lib/logger';
import eventEmitter from '../../../lib/utils/eventEmitter';
import { getSearchResponse } from '../../../lib/utils/utilityFunctions';
import SearchDumpService from '../v1/services/searchDump.service';
import HubsService from '../v1/services/hubs.service';
import getDistance2 from '../../../lib/utils/distanceCalculation.util';
interface RequestExtended extends Request {
  user?: any;
}
// import UserService from '../v1/services/user.service'

const agentService = new AgentService();
const taskService = new TaskService();
const searchDumpService = new SearchDumpService();
const hubsService = new HubsService();
const descriptorName = 'ONDC Logistics';
const long_desc = 'ONDC Logistics to delivery your goods in one go';
const short_desc = 'ONDC Logistics to delivery your goods in one go';
class AgentContoller {
  async searchAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const searchPayload = req.body;

      const startGPS = searchPayload?.fulfillments[0]?.start?.location?.gps.split(',');
      const endGPS = searchPayload?.fulfillments[0]?.end?.location?.gps.split(',');

      const weight = searchPayload?.linked_order?.order.weight;

      const dimensions = searchPayload?.linked_order?.order.dimensions;
      const fulfillmentType = searchPayload?.fulfillments[0]?.type;

      const category = searchPayload?.category;
      const distance = await getDistance2(startGPS, endGPS);

      let type = 'P2P'
      // const distance =4;
      if (distance > 25) {
         type = 'P2H2P';
        // check hub for pickup location
        const pickupPincode = searchPayload?.fulfillments[0]?.start?.location?.address?.area_code;
        const sourceHub = await hubsService.getHubByPincode(parseInt(pickupPincode));
        if (!sourceHub) {
          res.send({
            data: {
              error: {
                type: 'DOMAIN-ERROR',
                code: '60001',
                message: 'Pickup location not serviceable by Logistics Provider',
              },
            },
          });
        }
        const dropPincode = searchPayload?.fulfillments[0]?.end?.location?.address?.area_code;
        const destinationHub: any = await hubsService.getHubByPincode(parseInt(dropPincode));
        if (!destinationHub) {
          res.send({
            data: {
              error: {
                type: 'DOMAIN-ERROR',
                code: '60002',
                message: 'Dropoff location not serviceable by Logistics Provider',
              },
            },
          });
        }
        const agents = await agentService.getAgentList(searchPayload);

        if (agents.length === 0) {
          res.send({
            data: {
              error: {
                type: 'DOMAIN-ERROR',
                code: '60004',
                message: 'Delivery Partners not available',
              },
            },
          });
        }

        if ( distance > 20 && category.id === 'Immediate Delivery') {
          res.send({
            data: {
              error: {
                type: 'DOMAIN-ERROR',
                code: '60004',
                message: 'We are not supporting immeditate delivery for long distance',
              },
            },
          });
        }

        const { responseData, delivery_id, RTO_id, taxPrice, weightPrice, total_charge } = await getSearchResponse(
          startGPS,
          endGPS,
          agents[0],
          weight,
          dimensions,
          category.id,
          fulfillmentType,
          type,
          // destinationHub
        );
        await searchDumpService.create({
          delivery: delivery_id,
          rto: RTO_id,
          transaction_id: searchPayload.transaction_id,
          order: searchPayload?.linked_order?.order,
          fulfillments: searchPayload?.fulfillments,
          payment: searchPayload?.payment,
          charge: {
            tax: taxPrice,
            charge: 124,
            weightPrice: weightPrice,
            totalCharge: total_charge,
          },
          type: 'P2H2P',
          locations: {
            sourceHub,
            destinationHub,
          },
        });

        res.send({
          data: {
            id: agents[0]._id,
            descriptor: {
              name: descriptorName,
              long_desc: long_desc,
              short_desc: short_desc,
            },
            ...responseData,
          },
        });
      } else if (distance <= 25) {
        const agents = await agentService.getAgentList(searchPayload);

        if (agents.length === 0) {
          res.send({
            data: {
              error: {
                type: 'DOMAIN-ERROR',
                code: '60001',
                message: 'Pickup location not serviceable by Logistics Provider',
              },
            },
          });
        }

        const { delivery_id, RTO_id, total_charge, weightPrice, taxPrice, responseData } = await getSearchResponse(
          startGPS,
          endGPS,
          agents[0],
          weight,
          dimensions,
          category.id,
          fulfillmentType,
          type
        );

        await searchDumpService.create({
          delivery: delivery_id,
          rto: RTO_id,
          transaction_id: searchPayload.transaction_id,
          order: searchPayload?.linked_order?.order,
          fulfillments: searchPayload?.fulfillments,
          payment: searchPayload?.payment,
          charge: {
            tax: taxPrice,
            weightPrice: weightPrice,
            totalCharge: total_charge,
          },
          type: 'P2P',
        });

        res.send({
          data: {
            id: agents[0]._id,
            descriptor: {
              name: descriptorName,
              long_desc: long_desc,
              short_desc: short_desc,
            },
            ...responseData,
          },
        });
      } else {
        res.send({
          data: {
            error: {
              type: 'DOMAIN-ERROR',
              code: '60003',
              message: 'Delivery distance exceeds the maximum serviceability distance',
            },
          },
        });
      }
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
      // const files = req.files as Express.Multer.File[];
      let result: any = 'https://s3-us-west-2.amazonaws.com/my-images/example.jpg';
      // for (const file of files) {
      //   result = await uploadToS3(file); // result.Location
      // }

      res.send({ message: 'Successfully uploaded', data: { url: result } });
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

  async markOnlineOrOffline(req: Request, res: Response, next: NextFunction) {
    try {
      const status: boolean = req.body.status;
      await agentService.markOnlineOrOffline(status);

      res.status(200).send({
        message: `Driver's status changed sucessfully`,
        data: {
          status,
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
