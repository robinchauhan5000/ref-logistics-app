import TaskService from '../../modules/main/v1/services/task.service';
import AgentService from '../../modules/main/v1/services/agent.service';
// import TicketStatusService from '../../modules/authentication/v1/services/taskStatus.service';
// import IssueStatusService from '../../modules/authentication/v1/services/issueStatus.service';
import cron from 'node-cron';

const taskService = new TaskService();
const agentService = new AgentService();
// const ticketStatusService = new TicketStatusService();
// const issueStatusService = new IssueStatusService();

// import { tasks, Task } from './tasks';+

// const durationToSeconds = (duration: string) => {
//   const regex = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;
//   const match = duration.match(regex);

//   if (!match) {
//     throw new Error('Invalid ISO 8601 duration format');
//   }

//   const years = match[1] ? parseInt(match[1]) : 0;
//   const months = match[2] ? parseInt(match[2]) : 0;
//   const days = match[3] ? parseInt(match[3]) : 0;
//   const hours = match[4] ? parseInt(match[4]) : 0;
//   const minutes = match[5] ? parseInt(match[5]) : 0;
//   const seconds = match[6] ? parseFloat(match[6]) : 0;

//   const totalSeconds = years * 31536000 + months * 2592000 + days * 86400 + hours * 3600 + minutes * 60 + seconds;

//   return totalSeconds * 1000;
// };

// function millisecondsToMinutes(milliseconds: number) {
//   const seconds = Math.floor(milliseconds / 1000);
//   const minutes = Math.floor(seconds / 60);
//   return minutes;
// }

// const checkPickUpControl = async () => {
//   const query = { is_confirmed: true, status: 'Agent-assigned' };
//   const tasks = await taskService.getActiveTasks(query);
//   tasks.forEach(async (task: any) => {
//     const duration = durationToSeconds(task.fulfillments[0].start.time.duration);
//     const time = Date.now() - parseInt(task.orderConfirmedAt);
//     if (time > duration) {
//       await taskService.updateTask({
//         transaction_id: task.transaction_id,
//         status: 'Searching-for-Agent',
//         assignee: '',
//       });
//       await agentService.disableAgent(task.assignee);
//     }
//   });
// };

// const checkPackageDropControl = async () => {
//   // agentService.getAllDriver();
//   const query = { is_confirmed: true, status: { $in: ['Order-picked-up', 'Out-for-delivery'] } };
//   const tasks = await taskService.getActiveTasks(query);
//   tasks.forEach(async (task: any) => {
//     const duration = durationToSeconds(task.items[0].time.duration);
//     const time = Date.now() - parseInt(task.orderConfirmedAt);
//     if (time > duration) {
//       await ticketStatusService.create({
//         taskId: task._id,
//         status: 'Cancelled',
//         description: 'Package lost / Driver not reached the drop location in time.',
//       });
//       await taskService.updateTask({
//         transaction_id: task.transaction_id,
//         status: 'Cancelled',
//         assignee: '',
//       });
//       await agentService.disableAgent(task.assignee);
//     }
//   });
// };

// const checkIssueStatusControl = async () => {
//   try {
//     const twoHoursAgo = new Date();
//     twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
//     const query = {
//       status: 'Pending',
//       createdAt: { $gte: twoHoursAgo },
//     };
//     const issues = await issueStatusService.getIssue(query);
//     console.log({ issues });
//   } catch (error) {
//     console.log({ error });
//   }
// };

const removeDriverFromPendingTask = async () => {
  const query = { status: { $in: ['Pending'] } };
  const tasks = await taskService.getActiveTasks(query);
  tasks.forEach(async (task: any) => {
    const time = Date.now() - Date.parse(task?.createdAt);
    if (time > 15 * 60 * 1000) {
      const toUpdate = {
        isAvailable: true,
      };
      await agentService.updateAvailability(toUpdate, task.assignee);
      task.assignee = '';
      task.save();
    }
  });
};

export function runCronJob(): void {
  // Define the cron job
  cron.schedule('*/1 * * * *', async () => {
    console.log('Running cron job...');
    // checkPickUpControl();
    // checkPackageDropControl();
    // checkIssueStatusControl();
    removeDriverFromPendingTask();
  });
}
