import { uuid } from 'uuidv4';
import { removeIdKeys } from './utilityFunctions';
const BPP_ID = process.env.BPP_ID || '';
const BPP_URI = process.env.BPP_URI || '';

const states = [
  {
    key: 'Accepted',
    possibleStates: ['Created', 'Accepted', 'Pending'],
  },
  {
    key: 'In-progress',
    possibleStates: [
      'Searching-for-Agent',
      'Agent-assigned',
      'Order-picked-up',
      'Out-for-delivery',
      'Out-for-pickup',
      'Pickup-failed',
      'Pickup-rescheduled',
      'In-transit',
      'At-destination-hub',
      'Delivery-failed',
      'Delivery-rescheduled',
    ],
  },
  {
    key: 'Completed',
    possibleStates: ['Order-delivered', 'Completed'],
  },
  {
    key: 'Cancelled',
    possibleStates: ['Cancelled', 'RTO-Initiated', 'RTO-Delivered', 'RTO-Disposed', 'Customer-not-found'],
  },
]

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

  // async cancel(data: any) {
  //   try {
  //     console.log('cancel-------------->>>>>>>',JSON.stringify(data))
  //     const context = JSON.parse(data?.context||{});
  //     context.action = 'on_cancel';
  //     context.timestamp = new Date().toISOString();
  //     context.message_id = uuid();
  //     const taskData = data;
  //     console.log("data--------",data);
  //     console.log("taskData--------",taskData);
  //   const fulfillments=taskData?.fulfillments
  //     delete taskData?.fulfillments[1]?.tags;
  //     const payloadJSON = {
  //       context,
  //       message: {
  //         order: {
  //           id: taskData.order_id,
  //           state: 'Cancelled',
  //           fulfillments: [
  //             {
  //               id: fulfillments[0].id,
  //               type: fulfillments[0].type,
  //               state: {
  //                 descriptor: {
  //                   code: 'Cancelled'
  //                 },
  //               },
  //               tags:[{
  //                 "cancellation_reason_id":taskData.cancellationReasonId,
  //                 "AWB no":"1227262193237777"
  //               }]
  //             },
  //           ],
  //         },
  //       },
  //     };
  //     return removeIdKeys(payloadJSON);
  //   } catch (error: any) {
  //     console.log({ error });
  //     return {};
  //   }
  // }

  async cancel(data: any) {
    const context = JSON.parse(data.context)
    const created_at = data.confirmCreatedAt.toISOString()
    context.bpp_id = BPP_ID
    context.bpp_uri = BPP_URI
    context.action = 'on_cancel'
     context.timestamp = new Date().toISOString()
     context.message_id = uuid()

    delete context.ttl
  
    // if (data?.data?.error) {
    //   const schema: any = {
    //     context,
    //     error: data?.data?.error
    //   }
    //   return removeIdKeys(schema)
    // }
    const { order_id, status, items, quote, fulfillments, billing, linked_order, payment, provider, orderCancelledBy } = data
  
    const taskState = states?.find((obj: any) => {
      return obj?.possibleStates?.includes(status)
    })
    if (fulfillments.length > 1) {
      const schema = {
        context,
        message: {
          order: {
            id: order_id,
            state: 'Cancelled',
            cancellation: {
              cancelled_by: orderCancelledBy,
              reason: {
                id: data.cancellationReasonId,
              },
            },
            provider: provider,
            items: items,
            quote: quote,
            fulfillments: [
              {
                "@ondc/org/awb_no": items[0].descriptor.code ==="P2P"? undefined : "1227262193237777",
                id: fulfillments[0].id,
                type: fulfillments[0].type,
                state: {
                  descriptor: {
                    code: taskState?.key,
                  },
                },
                
                tracking: false,
                start: fulfillments[0].start,
                end: fulfillments[0].end,
                agent: fulfillments[0].agent,
                vehicle: fulfillments[0].vehicle,
                tags:fulfillments[0].tags
              },
              fulfillments[1],
            ],
            billing: billing,
            payment: payment,
            '@ondc/org/linked_order': linked_order,
            updated_at: context.timestamp,
            created_at:created_at
          },
        },
      }
      return removeIdKeys(schema)
    }
    const schema = {
      context,
      message: {
        order: {
          id: order_id,
          state: 'Cancelled',
          cancellation: {
            cancelled_by: orderCancelledBy,
            reason: {
              id: data.cancellationReasonId,
            },
          },
          provider: provider,
          items: items,
          quote: quote,
          fulfillments: [
            {
              "@ondc/org/awb_no": items[0].descriptor.code ==="P2P"? undefined : "1227262193237777",
              id: fulfillments[0].id,
              type: fulfillments[0].type,
              state: {
                descriptor: {
                  code: fulfillments[0].state?.descriptor?.code,
                },
              },
              
              tracking: false,
              start: fulfillments[0].start,
              end: fulfillments[0].end,
              agent: fulfillments[0].agent,
              vehicle: fulfillments[0].vehicle,
            },
          ],
          billing: billing,
          payment: payment,
          '@ondc/org/linked_order': linked_order,
          updated_at: context.timestamp,
          created_at:created_at 
        },
      },
    }
    return removeIdKeys(schema)
  }

}

export default ModifyPayload;
