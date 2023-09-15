import InternalServerError from '../../../../lib/errors/internal-server-error.error';
import { NoRecordFoundError, BadRequestParameterError, DuplicateRecordFoundError } from '../../../../lib/errors/index';
import Task from '../../models/task.model';
import MESSAGES from '../../../../lib/utils/messages';
import TaskStatusService from './taskStatus.service';
import Agent from '../../models/agent.model';
import SearchDumpService from './searchDump.service';
import { formatedDate } from '../../../../lib/utils/utilityFunctions';

const taskService = new TaskStatusService();
const searchDumpService = new SearchDumpService();

const BPP_ID = process.env.BPP_ID;
class TaskService {
  async create(data: any) {
    try {
      const existingTask = await Task.findOne({ transaction_id: data?.transaction_id });
      if (existingTask) {
        throw new DuplicateRecordFoundError(MESSAGES.DUPLICATE_TRANSACTION_ID);
      }

      const task = new Task(data);
      const savedTask: any = await task.save();
      savedTask.trackingUrl = `${process.env.MAIN_SITE_URL}/order/status/${savedTask._id}`;

      const gps = data?.fulfillments[0]?.start?.location?.gps;
      const coordinates = gps.split(',');
      const startLat = coordinates[0];
      const startLong = coordinates[1];
      const query = {
        $and: [
          { isOnline: true },
          { isAvailable: true },
          {
            currentLocation: {
              $near: {
                $geometry: { type: 'Point', coordinates: [startLat, startLong] },
                $minDistance: 0,
                $maxDistance: 5000,
              },
            },
          },
        ],
      };

      let agents: any = await Agent.find(query)
        .populate({ path: 'userId', select: 'name enabled' })
        .select('userId')
        .limit(10);
      agents = agents.filter((agent: any) => agent.userId.enabled === 1);
      await savedTask.save();
      return { savedTask, agents };
    } catch (error: any) {
      if (error.status === 404 || error.status === 401 || error.status === 409) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async createTask(data: any) {
    try {
      const existingTask = await Task.findOne({ transaction_id: data?.transaction_id });
      if (existingTask) {
        throw new DuplicateRecordFoundError(MESSAGES.DUPLICATE_TRANSACTION_ID);
      }

      const task = new Task({
        ...data,
        assignee: data.agentId,
        'payment.collected_by': 'BPP',
        'payment.@ondc/org/collection_amount': '300',
        type: 'ON-FULFILLMENT',
      });
      task.trackingUrl = `${process.env.MAIN_SITE_URL}/order/status/${task._id}`;
      await task.save();
      // savedTask.trackingUrl = `${process.env.MAIN_SITE_URL}/order/status/${savedTask._id}`;
      // await savedTask.save();
      const newTask = await Task.findOne({ transaction_id: data?.transaction_id }).populate({
        path: 'assignee',
        select: 'vehicleDetails.vehicleNumber basePrice pricePerkilometer addressDetails',
        populate: { path: 'userId', select: 'name mobile email' },
      });
      return newTask;
    } catch (error: any) {
      if (error.status === 404 || error.status === 401 || error.status === 409) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async assignedTasks(parsedSkip: number, parsedLimit: number, searchString: string | undefined) {
    try {
      const queryObject = {
        status: { $nin: ['Pending', 'Searching-for-Agent'] },
        $or: [
          { task_id: { $regex: searchString, $options: 'i' } },
          { status: { $regex: searchString, $options: 'i' } },
        ],
      };
      const tasks = await Task.find(queryObject, {
        task_id: 1,
        status: 1,
        fulfillments: 1,
        items: 1,
        linked_order: 1,
        assignee: 1,
      })
        .populate({
          path: 'assignee',
          select: 'vehicleDetails.vehicleNumber',
          populate: { path: 'userId', select: 'name mobile email' },
        })
        .where({
          is_confirmed: true,
        })
        .sort({ createdAt: -1 })
        .skip(parsedSkip)
        .limit(parsedLimit);

      const taskCount = await Task.find(queryObject).count();

      return { tasks, taskCount };
    } catch (error: any) {
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async unassignedTasks(skip: number, limit: number, searchString: string | undefined) {
    try {
      const queryObject = {
        status: { $in: ['Searching-for-Agent'] },
        $or: [
          { task_id: { $regex: searchString, $options: 'i' } },
          { status: { $regex: searchString, $options: 'i' } },
        ],
      };
      const tasks: any = await Task.find(queryObject, {
        task_id: 1,
        status: 1,
        fulfillments: 1,
        items: 1,
        linked_order: 1,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      const taskCount = await Task.find(queryObject).count();
      return { tasks, taskCount };
    } catch (error: any) {
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getOne(id: string) {
    try {
      const task = await Task.findById(id).populate({
        path: 'assignee',
        select: 'vehicleDetails.vehicleNumber',
        populate: { path: 'userId', select: 'name mobile email' },
      });
      if (!task) {
        throw new NoRecordFoundError(MESSAGES.TASK_NOT_EXIST);
      }

      return task;
    } catch (error: any) {
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getTaskByTransId(id: string) {
    try {
      const task = await Task.findOne({ transaction_id: id });

      if (!task) {
        throw new NoRecordFoundError(MESSAGES.TASK_NOT_EXIST);
      }

      return task;
    } catch (error: any) {
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async assigneAgent(taskId: string, agentId: string, adminId: string): Promise<any> {
    try {
      let updatedTask;
      const agent = await Agent.findById(agentId);
      if (!agent?.isAvailable) {
        throw new BadRequestParameterError(MESSAGES.ALREADY_ASSIGNED);
      }

      const task: any = await Task.findById(taskId);
      if (!task) {
        throw new BadRequestParameterError(MESSAGES.TASK_NOT_EXIST);
      }

      const query = {
        _id: taskId,
      };

      const update = {
        $set: {
          assignee: agentId,
          status: 'Agent-assigned',
          assignedBy: adminId,
        },
        $unset: {
          agentOfflineTime: '',
        },
      };

      const options = {
        new: true,
      };
      if (task.status === 'Pending') {
        updatedTask = await Task.findOneAndUpdate(query, update, options);
      } else if (task.status === 'Searching-for-Agent') {
        const timeDifference = new Date().getTime() - task.agentOfflineTime;
        if (timeDifference > 300000) {
          throw new BadRequestParameterError(MESSAGES.REASSIGN_ERROR); // cancel Task as required
        }

        updatedTask = await Task.findOneAndUpdate(query, update, options);
      }

      await Agent.updateOne({ _id: agentId }, { $set: { isAvailable: false } });
      return updatedTask;
    } catch (error: any) {
      if (error.status === 404 || error.status === 401 || error.status === 400 || error.status === 409) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async updateStatus(taskId: string, status: string): Promise<any> {
    try {
      let updatedTask;
      const task: any = await Task.findById(taskId);
      if (!task) {
        throw new NoRecordFoundError(MESSAGES.TASK_NOT_EXIST);
      }

      if (status === 'Order-picked-up') {
        const updateFulfillments = {
          'fulfillments.0.start.time.timestamp': new Date().toISOString(),
          'fulfillments.0.state.descriptor.code': status,
          'fulfillments.0.tracking': true,
        };
        updatedTask = await Task.findOneAndUpdate(
          { _id: taskId },
          { $set: { ...updateFulfillments, status: status, orderPickedUpTime: Date.now(), trackStatus: 'active' } },
          { new: true },
        ).lean();
        return updatedTask;
      } else if (status === 'Order-delivered') {
        const orderDeliveredAt = new Date().toISOString();
        const updateFulfillments = {
          'fulfillments.0.end.time.timestamp': orderDeliveredAt,
          'fulfillments.0.state.descriptor.code': status,
          'fulfillments.0.tracking': false,
        };

        const updatePayment = {
          ...task.payment,
          status: 'PAID',
          time: {
            timestamp: orderDeliveredAt,
          },
        };

        updatedTask = await Task.findOneAndUpdate(
          { _id: taskId },
          {
            $set: {
              ...updateFulfillments,
              status: status,
              orderPickedUpTime: Date.now(),
              payment: updatePayment,
              trackStatus: 'inactive',
            },
          },

          { new: true },
        ).lean();
        return updatedTask;
      } else if (status === 'RTO-Delivered') {
        const updateFulfillments = {
          'fulfillments.1.end.time.timestamp': new Date().toISOString(),
          'fulfillments.1.state.descriptor.code': status,
          'fulfillments.0.tracking': false,
        };
        updatedTask = await Task.findOneAndUpdate(
          { _id: taskId },
          { $set: { ...updateFulfillments, status: status, orderPickedUpTime: Date.now(), trackStatus: 'inactive' } },

          { new: true },
        ).lean();
        return updatedTask;
      } else if (status === 'Customer-not-found') {
        const tags = task?.fulfillments[0]?.tags.filter((obj: any) => obj?.code === 'rto_action');
        const cancellationReasonId = '013';
        if (tags[0]?.list[0]?.value === 'no') {
          if (task?.assignee) {
            await Agent.findByIdAndUpdate(task?.assignee, { $set: { isAvailable: 'true' } });
          }

          updatedTask = await Task.findOneAndUpdate(
            { _id: taskId },
            {
              $set: {
                status: 'RTO-Disposed',
                orderCancelledBy: BPP_ID,
                'fulfillments.0.state.descriptor.code': 'Cancelled',
                cancellationReasonId: cancellationReasonId,
                trackStatus: 'inactive',
              },
              $unset: { assignee: '' },
            },
            { new: true },
          ).lean();

          return updatedTask;
        }
        const deliveryID = task.fulfillments.find((item: any) => item.type === 'Delivery').id;

        const get_RTO_ID: any = await searchDumpService.getSearchDump(deliveryID);

        const deliveryPrice = task.quote.price.value;

        const rtoPrice = ((parseFloat(deliveryPrice) * 30) / 100).toFixed(2);
        const rtoTax = ((parseFloat(rtoPrice) * 10) / 100).toFixed(2);

        const RTOPriceQuote = {
          '@ondc/org/item_id': 'rto',

          '@ondc/org/title_type': 'rto',
          price: {
            currency: 'INR',
            value: `${((parseFloat(deliveryPrice) * 30) / 100).toFixed(2)}`,
          },
        };
        const RTOTaxQuote = {
          '@ondc/org/item_id': 'rto',
          '@ondc/org/title_type': 'tax',
          price: {
            currency: 'INR',
            value: rtoTax,
          },
        };
        const newRTOItem = {
          id: 'rto',
          fulfillment_id: get_RTO_ID.rto,
          category_id: 'Immediate Delivery',
          descriptor: {
            code: 'P2P',
          },
          time: {
            label: 'TAT',
            duration: 'PT60M',
            timestamp: formatedDate(`${new Date().toISOString()}`),
          },
        };
        const newRTOFulfillment = {
          id: get_RTO_ID.rto,
          type: 'RTO',
          state: {
            descriptor: {
              code: 'RTO-Initiated',
            },
          },
          start: {
            time: {
              timestamp: new Date().toISOString(),
            },
          },
        };

        const totalPrice = (parseFloat(deliveryPrice) + parseFloat(rtoPrice + rtoTax)).toFixed(2);
        const rtoTags = [
          {
            code: 'rto_event',
            list: [
              { code: 'retry_count', value: '1' },
              { code: 'rto_id', value: get_RTO_ID.rto },
              { code: 'cancellation_reason_id', value: cancellationReasonId },
              { code: 'sub_reason_id', value: '004' },
              { code: 'cancelled_by', value: BPP_ID },
            ],
          },
        ];

        await Task.findOneAndUpdate(
          { _id: taskId },
          {
            $push: {
              items: newRTOItem,
              fulfillments: newRTOFulfillment,
              'quote.breakup': [RTOPriceQuote, RTOTaxQuote],
            },
          },
          { new: true },
        ).lean();
        //add tags in fulfillment
        updatedTask = await Task.findOneAndUpdate(
          { _id: taskId },
          {
            $set: {
              status: 'RTO-Initiated',
              orderCancelledBy: BPP_ID,
              cancellationReasonId: cancellationReasonId,
              'fulfillments.0.state.descriptor.code': 'Cancelled',

              'quote.price.value': `${totalPrice}`,
              'fulfillments.0.tags': rtoTags,
            },
          },
          { new: true },
        ).lean();
        return updatedTask;
      } else {
        updatedTask = await Task.findOneAndUpdate(
          { _id: taskId },
          { $set: { status: status, 'fulfillments.0.state.descriptor.code': status } },
          { new: true },
        ).lean();
        return updatedTask;
      }
    } catch (error) {
      console.log({ error });
      throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getTasks(agentId: string) {
    try {
      const tasks = await Task.find(
        { assignee: agentId },
        {
          task_id: 1,
          status: 1,
          'product.items': 1,
          fulfillments: 1,
          items: 1,
          createdAt: 1,
          updatedAt: 1,
          orderConfirmedAt: 1,
        },
      ).sort({ createdAt: -1 });
      return tasks;
    } catch (error: any) {
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async updateTask(updatedData: any): Promise<any> {
    try {
      const currentTime = Date.now();
      const readyToShipState: string = updatedData.fulfillments
        .find((fulfillment: any) => fulfillment.type === 'Delivery')
        .tags.find((tag: any) => tag.code === 'state').list[0].value;

      const agentDetails: any = await Agent.findOne({ _id: updatedData.provider.id })
        .select('userId vehicleDetails')
        .populate({
          path: 'userId',
          select: 'name mobile',
        });
      console.log({ agentDetails });
      if (readyToShipState === 'yes') {
        const updatedFulfillments = updatedData.fulfillments.map((fulfillment: any) => {
          if (fulfillment.type === 'Delivery') {
            fulfillment.start.time = {
              ...fulfillment.start.time,
              range: {
                start: new Date(currentTime).toISOString(),
                end: new Date(currentTime + 15 * 60 * 1000).toISOString(),
              },
            };
            fulfillment.end.time = {
              ...fulfillment.end.time,
              range: {
                start: new Date(currentTime + 45 * 60 * 1000).toISOString(),
                end: new Date(currentTime + 60 * 60 * 1000).toISOString(),
              },
            };
            fulfillment.state = { descriptor: { code: 'Agent-assigned' } };
            fulfillment.tracking = false;
            fulfillment.agent = {
              name: agentDetails.userId.name,
              mobile: agentDetails.userId.mobile,
            };
            fulfillment.vehicle = { registration: agentDetails?.vehicleDetails?.vehicleNumber };
            return fulfillment;
          } else {
            fulfillment;
          }
        });
        updatedData.fulfillments = updatedFulfillments;
      } else {
        updatedData.fulfillments[0].state = { descriptor: { code: 'Pending' } };
        updatedData.status = 'Pending';
        updatedData.payment = {
          ...updatedData.payment,
          'payment.status': 'NOT-PAID',
        };
      }
      const updatedTask = await Task.findOneAndUpdate(
        { transaction_id: updatedData.transaction_id },
        { $set: { ...updatedData } },
        { new: true },
      );
      return updatedTask;
    } catch (error: any) {
      console.log({ error });
      throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async cancelTask(data: any, userId: string): Promise<any> {
    try {
      const task: any = await Task.findById(data?.taskId, { _id: 0, createdAt: 0, updatedAt: 0 }).populate({
        path: 'assignee',
        select: 'userId',
      });
      if (!task) {
        throw new NoRecordFoundError(MESSAGES.TASK_NOT_EXIST);
      }

      if (task?.assignee?.userId !== userId) {
        throw new BadRequestParameterError(MESSAGES.CANCEL_TASK_ERROR);
      }

      if (data?.isRTO === true) {
        const clonedTask = new Task({ ...task._doc });
        await clonedTask.save();
        await Task.findOneAndUpdate(
          { _id: clonedTask._id },
          {
            $set: { status: 'RTO-Initiated' },
            $unset: { assignee: '' }, // Set assignee to an empty string to remove it
          },
        );
      }

      const updatedTask: any = await Task.findOneAndUpdate(
        { _id: data?.taskId },
        {
          $set: { status: task.status === 'Agent-assigned' ? 'Searching-for-Agent' : 'Cancelled' },
          $unset: { assignee: '' }, // Set assignee to an empty string to remove it
        },
        { new: true },
      );
      const taskStatusData = {
        taskId: data?.taskId,
        status: updatedTask.status,
        description: data?.description,
      };
      await taskService.create(taskStatusData); // update the task status in the task status collection
      return true;
    } catch (error: any) {
      if (error.status === 404 || error.status === 401 || error.status === 400 || error.status === 409) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async lockAgent(updatedData: any) {
    try {
      const updatedTask = await Task.findOneAndUpdate(
        { transaction_id: updatedData.transaction_id },
        {
          $set: {
            assignee: updatedData.agentId,
            is_confirmed: true,
          },
        },
        { new: true },
      );
      return updatedTask;
    } catch (error) {
      throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async reAssignAgent(taskId: string, agentId: string, adminId: string) {
    try {
      const task = await Task.findById(taskId); // check if the task exists
      if (!task) {
        throw new NoRecordFoundError(MESSAGES.TASK_NOT_EXIST);
      }

      const agent: any = await Agent.findById(task?.assignee); // find the agent assigned to the task
      const timeDifference = new Date().getTime() - agent?.offlineTime; // calculating the time difference betweeen current time and agent offline time
      if (timeDifference > 300000) {
        throw new BadRequestParameterError(MESSAGES.REASSIGN_ERROR); // cancel Task as required
      }

      await this.assigneAgent(taskId, agentId, adminId); // re-assign the task to the next agent
      return true;
    } catch (error: any) {
      if (error.status === 404 || error.status === 401 || error.status === 400 || error.status === 409) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }
  async getActiveTasks(query: any) {
    try {
      const tasks = await Task.find(query, {
        task_id: 1,
        status: 1,
        'product.items': 1,
        fulfillments: 1,
        items: 1,
        assignee: 1,
        orderConfirmedAt: 1,
        transaction_id: 1,
        createdAt: 1,
      }).sort({ createdAt: -1 });
      return tasks;
    } catch (error: any) {
      if (error.status === 404 || error.status === 401 || error.status === 400 || error.status === 409) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async cancel(transaction_id: string, cancellationReasonId: string) {
    try {
      const task: any = await Task.findOne({ transaction_id });
      if (task) {
        const chargeableStatus: any = [
          'Order-picked-up',
          'Out-for-delivery',
          'RTO-Initiated',
          'RTO-Delivered',
          'RTO-Disposed',
        ];
        if (chargeableStatus?.includes(task.status)) {
          //set cancellation charges
          task.cancellationAmount = 200;
        } else {
          //no cancellation charges
          task.cancellationAmount = 0;
        }
        task.orderCancelledBy = task.orderCancelledBy ? task.orderCancelledBy : task.bap_id;
        task.status = 'Cancelled';
        task.cancellationReasonId = cancellationReasonId;
        task.assignee = '';
      }

      await task.save();
      return task;
    } catch (error) {
      throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async agentTaskHistory({ agentId }: { agentId: string }) {
    try {
      const queryObject = {
        assignee: agentId,
        status: { $in: ['RTO-Delivered', 'RTO-Disposed', 'Order-delivered', 'Cancelled'] },
      };
      const tasks: any = await Task.find(queryObject, {
        task_id: 1,
        status: 1,
        fulfillments: 1,
        items: 1,
        linked_order: 1,
      }).sort({ createdAt: -1 });
      return tasks;
    } catch (error: any) {
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getTaskStatus(transaction_id: string, _order_id: string) {
    try {
      const task: any = await Task.findOne({ transaction_id }).populate({
        path: 'assignee',
        select: 'vehicleDetails.vehicleNumber basePrice pricePerkilometer addressDetails currentLocation',
        populate: { path: 'userId', select: 'name mobile email' },
      });
      return task;
    } catch (error: any) {
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async updateTaskProtocol(dataToUpdate: any) {
    try {
      const { context, order } = dataToUpdate;
      const currentTime = Date.now();
      const existingTask: any = await Task.findOne({ transaction_id: context.transaction_id });
      if (!existingTask) {
        throw new NoRecordFoundError(MESSAGES.TASK_NOT_EXIST);
      }
      const agentDetails: any = await Agent.findOne({ _id: existingTask.assignee })
        .select('userId vehicleDetails')
        .populate({
          path: 'userId',
          select: 'name mobile',
        });
      const readyToShipState = order?.fulfillments
        .find((fulfilment: any) => fulfilment.type === 'Delivery')
        .tags.find((tag: any) => tag.code === 'state').list[0].value;
      const fulfillments: any = existingTask.fulfillments;
      if (readyToShipState === 'yes') {
        const updatedFulfillments = fulfillments.map((fulfillment: any) => {
          if (fulfillment.type === 'Delivery') {
            fulfillment.start.time = {
              ...fulfillment.start.time,
              range: {
                start: new Date(currentTime).toISOString(),
                end: new Date(currentTime + 15 * 60 * 1000).toISOString(),
              },
            };
            fulfillment.end.time = {
              ...fulfillment.end.time,
              range: {
                start: new Date(currentTime + 45 * 60 * 1000).toISOString(),
                end: new Date(currentTime + 60 * 60 * 1000).toISOString(),
              },
            };

            fulfillment.state = { descriptor: { code: 'Agent-assigned' } };
            fulfillment.tracking = false;
            fulfillment.start.instructions = order?.fulfillments.find(
              (fulfilment: any) => fulfilment.type === 'Delivery',
            )?.start.instructions;
            fulfillment.agent = {
              name: agentDetails.userId.name,
              mobile: agentDetails.userId.mobile,
            };
            fulfillment.vehicle = { registration: agentDetails?.vehicleDetails?.vehicleNumber };
            fulfillment.tags = fulfillment.tags.map((tag: any) => {
              if (tag.code === 'state') {
                return {
                  ...tag,
                  list: tag.list.map((t: any) => {
                    return {
                      code: t.code,
                      value: 'yes',
                    };
                  }),
                };
              } else {
                return tag;
              }
            });
            return fulfillment;
          } else {
            return fulfillment;
          }
        });

        dataToUpdate.fulfillments = updatedFulfillments;
      }
      const updatedTask: any = await Task.findOneAndUpdate(
        { transaction_id: context.transaction_id },
        { $set: { fulfillments: dataToUpdate.fulfillments, status: 'Agent-assigned', 'payment.status': 'NOT-PAID' } },
        { new: true },
      );
      return updatedTask;
    } catch (error: any) {
      console.log({ error });
      if (error.status === 404 || error.status === 401) {
        throw error;
      } else {
        throw new InternalServerError(MESSAGES.INTERNAL_SERVER_ERROR);
      }
    }
  }
}

export default TaskService;
