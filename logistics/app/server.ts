/**
 * Import libraries, utils and packages
 */
import http from 'http';
import * as WebSocket from 'ws';
import express, { Request, Response, NextFunction } from 'express';
import { getRoutes } from 'get-routes';
import mergedEnvironmentConfig from './config/env.config';
import routes from './init/router.init';
import cors from 'cors';
import './init/database.init';
import './init/pgdatabase.init';
import Bootstrap from './lib/bootstrap';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { runCronJob } from './lib/utils/cronJob';

import logger from './lib/logger';

interface ExtWebSocket extends WebSocket {
  isAlive: boolean;
}

/**
 * Express JS setup
 */
const app = express();

let port = mergedEnvironmentConfig.default.servicePort || '3019';
try {
  port = parseInt(port, 10);
  if (Number.isNaN(port)) {
    // named pipe
    port = mergedEnvironmentConfig.default.servicePort;
  }

  if (port >= 0) {
    // port number
    port = mergedEnvironmentConfig.default.servicePort;
  }
} catch (error) {
  port = mergedEnvironmentConfig.default.servicePort;
}

// Create HTTP server.
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

server.on('error', (error: any) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

server.on('listening', () => {
  const addr: any = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  console.log(`Listening on ${bind}`);
});

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API Documentation',
      version: '1.0.0',
      description: 'API documentation for your Node.js application',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Replace with your server URL
        description: 'Development server',
      },
    ],
  },
  apis: ['**/*.ts'], // Specify the file patterns for your API routes
};

const specs = swaggerJsdoc(options);
wss.on('connection', (ws: WebSocket) => {
  const extWs = ws as ExtWebSocket;

  extWs.isAlive = true;

  ws.on('pong', () => {
    extWs.isAlive = true;
  });

  //connection is up, let's add a simple simple event
  ws.on('message', (msg: string) => {
    ws.send(createMessage(`You sent -> ${msg}`));
  });
  function createMessage(content: {}): string {
    return JSON.stringify(content);
  }

  setInterval(async () => {}, 2000);
  //send immediatly a feedback to the incoming connection
  setInterval(() => {
    wss.clients.forEach((ws) => {
      const extWs = ws as ExtWebSocket;
      if (!extWs.isAlive) return ws.terminate();

      extWs.isAlive = false;
      ws.ping(null, undefined);
    });
  }, 10000);
  ws.on('error', (err) => {
    console.warn(`Client disconnected - reason: ${err}`);
  });
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

//global middleware for logging API info
app.use((req, res, next) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    if (res.statusCode === 200) {
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${timeTaken}ms`);
    } else {
      logger.error(`${req.method} ${req.originalUrl} ${res.statusCode} - ${timeTaken}ms`);
    }
  });
  next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const host = req.get('host');
  const origin = req.get('origin');
  const baseUrlInRequest = `${req.protocol}://${req.get('host')}`;

  const { baseUrl, path } = req;
  const fullUrl = `${baseUrl}${path}`;
  console.log(
    `[IAM][REQUEST_INTERCEPTOR] baseUrlInRequest ${baseUrlInRequest} host ${host} origin ${origin} fullURL ${fullUrl} res ${res}`,
  );
  return next();
});

// Global exception handler for HTTP/HTTPS requests
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(`[IAM][REQUEST_INTERCEPTOR] req ${req}`);
  // Send response status based on custom error code
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  return next();
});
app.use(express.json({ limit: '50mb' }));
app.use(express.raw());
app.use(express.text());
app.use(
  express.urlencoded({
    limit: '50mb',
    extended: false,
  }),
);
app.disable('etag');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

app.use(jsonParser); // use it globally
app.use(
  cors({
    origin: '*',
  }),
);

(async () => {
  try {
    // Wait for the DB connection to setup and initialize the DB models

    // Resgister routes once the DB models are registered
    app.use('/api', routes);
    const routeDetails = getRoutes(app);
    console.log('Registered API paths are: \n', routeDetails);
    console.log('Registered API paths are: \n', mergedEnvironmentConfig);
    // Global exception handler for HTTP/HTTPS requests
    app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
      console.log('err.status==============>', err.status);
      console.log('err.status==============>', err.message);
      console.log('err.status==============>', err.stack);
      // Send response status based on custom error code
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }

      if (!err.status) {
        const { baseUrl, path, body, query, headers } = req;
        const fullUrl = `${baseUrl}${path}`;
        const debugInfo = {
          fullUrl,
          body,
          query,
          headers,
        };

        const emailBody = `
		Team,\n\n
		Here are the details of the exception:\n\n
		Request fullUrl: ${debugInfo.fullUrl}\n\n
		Request body : ${JSON.stringify(debugInfo.body)}\n\n
		Request query: ${JSON.stringify(debugInfo.query)}\n\n
		Request headers: ${JSON.stringify(debugInfo.headers)}\n\n
		Error message: ${err?.message}\n\n
		Error stacktrace: ${err?.stack}\n`;

        const emailSubject = err?.message ?? `Exception occurred at ${new Date()}`;

        const bindingParams = {
          emailRecipients: mergedEnvironmentConfig?.email?.exceptionEmailRecipients,
          subject: `EXCEPTION: IAM: Env ${mergedEnvironmentConfig.appEnvironment} : ${emailSubject}`,
          text: emailBody,
        };

        // Send an exception email to dev users
        // return sendNotificationEmail({ templateName: 'EXCEPTION_EMAIL', bindingParams })
        console.log(`bindingparams: ${bindingParams}`);
        return next();
      }

      return res.status(500).json({ error: 'Something went wrong. Please try again' });
    });
    // Listen on provided port, on all network interfaces.
    app.set('port', port);
    server.listen(port);
    runCronJob();
    Bootstrap();
  } catch (expressStartupError) {
    // logger.info('[server.js] Express startup failed. expressStartupError: ', {tagMetaData: {expressStartupError}});
  }
})();

module.exports = app;
