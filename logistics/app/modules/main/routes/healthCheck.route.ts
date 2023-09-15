import express, { Response, Request } from 'express';
const router = express.Router();
// const BASE_PATH = process.env.PWD;
// const DOC_PATH = '/app/public/doc';
router.get('/', (_req: Request, res: Response) => {


  const responseMessage = {
    status: true,
    message: 'The server is up and running. Keep up the great work, developers!',
    timestamp: new Date(),
    uptime: process.uptime(),
  };
  res.json(responseMessage);
});

// router.use('/doc', express.static(BASE_PATH + DOC_PATH));

// router.get('/doc', function (_req, res) {
//   res.sendFile(BASE_PATH + DOC_PATH + '/index.html');
// });

export default router;
