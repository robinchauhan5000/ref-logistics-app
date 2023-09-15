import { uuid } from 'uuidv4';
import { removeIdKeys } from './utilityFunctions';
const BPP_ID = process.env.BPP_ID || '';

class ModifyPayload {
  async status(statusData: any) {
    const context = JSON.parse(statusData.context);
    context.action = 'status';
    context.message_id = uuid();
    context.timestamp = new Date().toISOString();
    return {
      context,
      message: {
        order_id: statusData.order_id,
      },
    };
  }

  async issueStatus(issueStatusData: any) {
    const context = JSON.parse(issueStatusData.context);
    context.action = 'issue_status';
    context.timestamp = new Date().toISOString();
    context.message_id = uuid();
    return {
      context,
      message: {
        issue_id: issueStatusData.id,
      },
    };
  }

  async cancel(data: any) {
    try {
      const context = JSON.parse(data.context);
      context.action = 'on_cancel';
      context.timestamp = new Date().toISOString();
      context.message_id = uuid();
      const taskData = data;

      delete taskData.fulfillments[1].tags;
      const payloadJSON = {
        context,
        message: {
          order: {
            id: taskData.order_id,
            state: 'Cancelled',
            cancellation: {
              cancelled_by: BPP_ID,
              reason: {
                id: taskData.cancellationReasonId,
              },
            },
            provider: {
              id: taskData.assignee,
            },
            items: taskData.items,
            fulfillments: taskData.fulfillments,
            quote: taskData.quote,
            billing: taskData.billing,
            payment: taskData.payment,
            '@ondc/org/linked_order': taskData.linked_order,
            created_at: new Date(parseInt(taskData.orderConfirmedAt)).toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
      };

      return removeIdKeys(payloadJSON);
    } catch (error: any) {
      console.log({ error });
      return {};
    }
  }
}

export default ModifyPayload;
