import { NextFunction, Request, Response } from 'express';
import { comparePayload } from '../../../lib/utils/utilityFunctions';
import logger from '../../../lib/logger';
import searchDump from '../models/searchResponseDump.model';
import Task from '../models/task.model';

const initValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ignoreKeys = ["_id"];
    const paylaod = req.body;
    const searhPayload = await searchDump.findOne({ transaction_id: paylaod?.transaction_id }).lean();

    if (searhPayload !== null) {
      const fulfillments = searhPayload.fulfillments as any;
      delete fulfillments._id;

      const sourcePayload = {
        fulfillments,
        payment: searhPayload.payment
      }

      const targetPayload = {
        fulfillments: paylaod.fulfillments,
        payment: paylaod.payment
      }


      const validaton = comparePayload(sourcePayload, targetPayload);
      const ignored = validaton.errors.filter(ele => !ignoreKeys.includes(Object.keys(ele)[0]));
      if (ignored.length) {
        throw new Error(JSON.stringify(ignored))
      }
    }

    next();
  } catch (error: any) {
    logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
    console.log("Error while checking request payload in middleware: ", { error: error.message });
    res.status(400).json({ error: error.message });
  }
}

const confirmValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ignoreKeys = ["_id", "collected_by", "created_at", "updated_at"];
    const payload = req.body;

    const task = await Task.findOne({ transaction_id: payload?.transaction_id }).lean();

    if (task !== null) {
      const fulfillments = task.fulfillments as any;
      delete fulfillments._id;

      const sourcePayload = {
        fulfillments: task.fulfillments,
        quote: task.quote,
        payment: task.payment,
        billing: task.billing,
        items: task.items,
        linked_order: task.linked_order,
      }

      const targetPayload = {
        fulfillments: payload.fulfillments,
        quote: payload.quote,
        payment: payload.payment,
        billing: payload.billing,
        items: payload.items,
        linked_order: payload.linked_order,
      }

      const validaton = comparePayload(sourcePayload, targetPayload);
      const ignored = validaton.errors.filter(ele => !ignoreKeys.includes(Object.keys(ele)[0]))
      if (ignored.length) {
        throw new Error(JSON.stringify(ignored))
      }
    }

    next()
  } catch (error: any) {
    logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
    console.log("Error while checking request payload in middleware: ", { error: error.message });
    res.status(500).json({ error: error.message });
  }
}

export { initValidator, confirmValidator };
