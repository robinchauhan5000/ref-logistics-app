import { NextFunction, Request, Response } from 'express';
import logger from '../../../lib/logger';
import { pgClient } from '../../../init/pgdatabase.init';

interface CustomRequest extends Request {
    user?: any;
}

class OndcRequestController {
    async getOndcFilteredRequests(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
        try {
            const { transaction_id } = req.query;
            const query = {
                text: 'SELECT * FROM ondc_request WHERE request->\'context\'->>\'transaction_id\' = $1 ORDER BY created_at',
                values: [transaction_id]
            };
            const result = await pgClient.query(query);
            res.send({
                message: 'Records successfully fetched',
                data: result.rows,
                meta: {
                    count: result.rowCount
                }
            });
        } catch (error: any) {
            logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
            next(error);
        }
    }

    async getOndcRequests(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
        try {
            let text = "SELECT * FROM ondc_request";
            const { transaction_id } = req.query;
            const values = [];
            if (transaction_id) {
                text = text.concat(" WHERE request->\'context\'->>\'transaction_id\' = $1");
                values.push(transaction_id);
            }
            const query = {
                text,
                values
            };
            const result = await pgClient.query(query);
            res.send({
                message: 'Records successfully fetched',
                data: result.rows,
                meta: {
                    count: result.rowCount
                }
            });
        } catch (error: any) {
            logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
            next(error);
        }
    }
}

export default OndcRequestController;

