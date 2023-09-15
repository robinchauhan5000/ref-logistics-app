import { NextFunction, Request, Response } from 'express';
import AgentService from '../v1/services/agent.service';
import logger from '../../../lib/logger';
import { getSearchResponse } from '../../../lib/utils/utilityFunctions';
import SearchDumpService from '../v1/services/searchDump.service';
// import UserService from '../v1/services/user.service'

const agentService = new AgentService();
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
}

export default AgentContoller;
