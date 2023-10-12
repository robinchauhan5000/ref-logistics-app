// import authenticationRouter from '../modules/authentication/routes/authentication.route'
// import userRouter from '../modules/authentication/routes/user.route'

// export default authenticationRouter

// import { Router } from 'express'
// import fs from 'fs'
// import path from 'path'

// const routes: Router = Router()

// const moduleDirectory = '../modules'
// // Replace with your actual module directory path
// console.log()
// // Recursive function to retrieve routes files from a directory
// function getRoutesFromDirectory(directory: string) {
//   // Read the directory contents
//   fs.readdirSync(directory).forEach((file) => {
//     const filePath = path.join(directory, file)

//     // Check if the current item is a directory
//     if (fs.statSync(filePath).isDirectory()) {
//       // Recursively call the function for subdirectories
//       getRoutesFromDirectory(filePath)
//     } else if (file.endsWith('.route.ts')) {
//       const route = require(filePath).default
//       routes.use(route)
//     }
//   })
// }

// // Call the recursive function with the module directory
// getRoutesFromDirectory(moduleDirectory)

// export default routes

import { Router } from 'express';
import authenticationRouter from '../modules/main/routes/authentication.route';
import userRouter from '../modules/main/routes/user.route';
import agentRouter from '../modules/main/routes/agent.route';
import taskRouter from '../modules/main/routes/task.route';
import taskStatusRouter from '../modules/main/routes/taskStatus.route';
import healthCheck from '../modules/main/routes/healthCheck.route';
import taskNotifications from '../modules/main/routes/notification.routes';
import applicationSetting from '../modules/main/routes/applicationSetting.route';
import issueRouter from '../modules/main/routes/issue.route';
import hubsRouter from '../modules/main/routes/hubs.routes';

const routes: Router = Router();

// Add your routes here
routes.use(healthCheck);
routes.use(authenticationRouter);
routes.use(userRouter);
routes.use(agentRouter);
routes.use(taskRouter);
routes.use(taskStatusRouter);
routes.use(taskNotifications);
routes.use(applicationSetting);
routes.use(issueRouter);
routes.use(hubsRouter);
export default routes;
