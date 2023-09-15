import { Request, Response, NextFunction } from 'express';
import { BadRequestParameterError } from '../../../../lib/errors';
import { Schema } from 'joi';

interface MiddlewareOptions {
  schema: Schema;
}

const middleware = (options: MiddlewareOptions) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log({ res });

    const { schema } = options;
    const data = req.body;
    const message: any = schema.validate(data)?.error?.message;
    if (message) {
      next(new BadRequestParameterError(message));
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export default middleware;
