// import {OndcService} from '../services';
import { Request, Response, NextFunction } from 'express'
import OndcService from '../services/ondc.service'
import logger from '../lib/logger'

const ondcService = new OndcService()

class OndcController {
  async agentSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ondcService.agentSearch(req.body)
      res.json({ result })
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`)
      next(error)
    }
  }

  async orderInit(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ondcService.orderInit(req.body)
      res.json({ result })
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`)
      next(error)
    }
  }

  async orderConfirm(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ondcService.orderConfirm(req.body)
      res.json({ result })
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`)
      next(error)
    }
  }

  async orderUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ondcService.orderUpdate(req.body)
      res.json({ result })
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`)
      next(error)
    }
  }
  async orderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ondcService.orderStatus(req.body)
      res.json({ result })
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`)
      next(error)
    }
  }
  async support(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ondcService.orderSupport(req.body, req)
      res.json({ result })
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`)
      next(error)
    }
  }
  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ondcService.orderCancel(req.body)
      res.json({ result })
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`)
      next(error)
    }
  }
  async issue(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ondcService.orderIssue(req.body)
      res.json({ result })
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`)
      next(error)
    }
  }
  async issueStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ondcService.issueStatus(req.body)
      res.json({ result })
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`)
      next(error)
    }
  }

  async track(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ondcService.trackOrder(req.body)
      res.json({ result })
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`)
      next(error)
    }
  }
}

export default OndcController
