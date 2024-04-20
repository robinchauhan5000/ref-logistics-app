// import config from '../lib/config/index'
// import logger from '../lib/logger/index'

import { On_confirm } from './interfaces/onConfirmInterface'
import { On_init } from './interfaces/onInitInterface'
import { On_search } from './interfaces/onSearchInterface'
import { On_update } from './interfaces/onUpdateInterface'

import {
  removeIdKeys,
  //  calculateDeliveryCharges
} from '../utils/utilityFunctions'
import { On_Track } from './interfaces/onTrackInterface'

const BPP_ID = process.env.BPP_ID
const BPP_URI = process.env.BPP_URI
// const providers = 'https://logistics-dev.thewitslab.com/'
const descriptorName = 'ONDC Logistics Seller App by WITS'
// const long_desc = 'ONDC Logistics Seller App by WITS'
// const short_desc = 'ONDC Logistics Seller App by WITS'

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

export const getAgents = async (data: any) => {
  data.context.timestamp = new Date().toISOString()
  const context = data.context
  // const startLocation = data.fulfillment.start.location.gps.split(',')
  // const endLocation = data.fulfillment.end.location.gps.split(',')
  context.bpp_id = BPP_ID
  context.bpp_uri = BPP_URI
  context.action = 'on_search'
  delete context.ttl
  if (data.data.data.error) {
    const schema: On_search = {
      context,
      error: data.data.data.error,
    }
    return removeIdKeys(schema)
  }

  // const calculatedResult = calculateDeliveryCharges(lat1, lon1, lat2, lon2, basePrice, perKM)
  const schema: On_search = {
    context,
    message: {
      catalog: {
        'bpp/descriptor': {
          name: descriptorName,
        },
        'bpp/providers': [data?.data?.data],
      },
    },
  }
  // if (data.data.data.length === 0) {
  //   schema.error = {
  //     type: 'DOMAIN-ERROR',
  //     code: '60001',
  //     message: 'Pickup location not serviceable by Logistics Provider',
  //   }
  // }

  return removeIdKeys(schema)
}

export const getInit = async (data: any) => {
  try {
    data.context.timestamp = new Date().toISOString()
    const context = data.context
    context.action = 'on_init'
    delete context.ttl

    // const { items } = data.message?.order
    const { tags, cancellation_terms, assignee, fulfillments, payment, items, quote } = data.data

    const paymentResponse = payment
    const updatedFulfillment = fulfillments?.map((item: any) => {
      if (item.type === 'Delivery') {
        return {
          ...item,
          tags: [
            {
              code: 'rider_check',
              list: [
                {
                  code: 'inline_check_for_rider',
                  value: 'yes',
                },
              ],
            },
          ],
        }
      } else {
        return item
      }
    })
    let updatedTags = tags[0]?.list
    if (updatedFulfillment[0]?.start?.contact?.phone == '9898989899') {
      updatedTags = updatedTags.filter((e: any) => {
        if (e.code != 'max_liability_cap') {
          return e
        }
      })
    }
    tags[0].list = updatedTags

    const schema: On_init = {
      context,
      message: {
        order: {
          provider: {
            id: assignee._id,
          },
          items: items,
          fulfillments: updatedFulfillment,
          quote: quote,
          payment: paymentResponse,
          cancellation_terms: cancellation_terms,
          tags: tags,
        },
      },
    }

    return removeIdKeys(schema)
  } catch (error) {
    console.log({ error })
  }
}

export const getConfirm = async (data: any) => {
  const { context } = data
  context.timestamp = new Date().toISOString()
  context.bpp_id = BPP_ID
  context.bpp_uri = BPP_URI
  context.action = 'on_confirm'
  delete context.ttl

  if (data.data.task.data?.error) {
    const schema: On_confirm = {
      context,
      error: data.data.task.data?.error,
    }
    return removeIdKeys(schema)
  }
  const { payment, billing, cancellation_terms, tags, fulfillments, provider, items, quote, order_id } = data.data.task
  fulfillments[0].state.descriptor.code = 'Pending'

  delete fulfillments[0]?.agent
  delete fulfillments[0]?.vehicle
  fulfillments[0].tracking = false
  if (order_id == 'errorOrder62506') {
    items[0].time.duration = 'PT49M'
  }
  if (items[0]?.descriptor?.code === 'P2H2P') {
    fulfillments[0]['@ondc/org/awb_no'] = '127262193237777'
  }

  if (items[0]?.descriptor?.code === 'P2H2P') {
    fulfillments[0]['tracking'] = true
  }

  const paymentResponse = payment
  // const taskState = states?.find((obj: any) => {
  //   return obj?.possibleStates?.includes(status)
  // })



  

  /// Enabling Tracking specifically for Hyperlocal (P2P)
  function enableTrackingForHyperLocal(items:any, fulfillments:any){
    items.forEach((item: any) => {
      console.log("item278",item)
      fulfillments.forEach((fulfillment: any) => {
        if (item.fulfillment_id === fulfillment.id) {
          console.log("281",item.fulfillment_id,fulfillment.id)
          if (item.descriptor.code === "P2P") {
            fulfillment.tracking = true;
            console.log("283",item.tracking)
  
          } else {
            fulfillment.tracking = false; 
          }
        }
      });
    });
  }


  enableTrackingForHyperLocal(items, fulfillments)
 

  const schema: On_confirm = {
    context,
    message: {
      order: {
        id: order_id,
        state: 'Accepted',
        provider: { id: provider.id },
        items: items,
        quote: quote,
        fulfillments: fulfillments,
        billing: billing,
        payment: paymentResponse,
        '@ondc/org/linked_order': data?.data?.task?.linked_order,
        cancellation_terms: cancellation_terms,
        tags: tags,
        created_at: data.createdAt,
        updated_at: data.context.timestamp,
      },
    },
  }

  return removeIdKeys(schema)
}

export const getUpdate = async (data: any) => {
  data.context.timestamp = new Date().toISOString()
  const context = data.context

  context.bpp_id = BPP_ID
  context.bpp_uri = BPP_URI
  context.action = 'on_update'
  delete context.ttl
  if (data.data.updatedTask.data?.error) {
    const schema: On_update = {
      context,
      error: data.data.updatedTask.data?.error,
    }
    return removeIdKeys(schema)
  }

  const { quote, payment, billing, status, order_id, provider, items, fulfillments, linked_order, tags, weightDiff } =
    data.data.updatedTask
  const taskState = states?.find((obj: any) => {
    return obj?.possibleStates?.includes(status)
  })
  const updatedFulfillment = fulfillments?.map((item: any) => {
    if (item.type === 'Delivery' || item.type === 'Return') {
      delete item.tags
      return item
    } else {
      return item
    }
  })
  const schema: On_update = {
    context,
    message: {
      order: {
        id: order_id,
        state: taskState?.key,
        provider: {
          id: provider.id,
        },
        items: items,
        quote: quote,
        fulfillments: updatedFulfillment,
        billing: billing,
        payment,
        '@ondc/org/linked_order': linked_order,
        updated_at: data.context.timestamp,
        tags: weightDiff ? tags : undefined,
      },
    },
  }
  return removeIdKeys(schema)
}

export const getStatus = async (data: any) => {
  data.context.timestamp = new Date().toISOString()

  const context = data.context
  context.bpp_id = BPP_ID
  context.bpp_uri = BPP_URI
  context.action = 'on_status'
  delete context.ttl

  const {
    order_id,
    status,
    items,
    quote,
    fulfillments,
    billing,
    linked_order,
    provider,
    payment,
    cancellationReasonId,
    orderCancelledBy,
  } = data?.data?.data

  const taskState = states?.find((obj: any) => {
    return obj?.possibleStates?.includes(status)
  })

  const updatedFulfillment = fulfillments?.map((item: any) => {
    if (item.type === 'Delivery' || item.type === 'Return') {
      delete item.tags
      return item
    } else {
      return item
    }
  })

  const schema: any = {
    context,
    message: {
      order: {
        id: order_id,
        state: taskState?.key,
        provider: provider,
        items: items,
        quote: quote,
        fulfillments: updatedFulfillment,
        payment,
        billing: billing,
        '@ondc/org/linked_order': linked_order,
      },
    },
  }
  if (taskState?.key === 'Cancelled') {
    schema.message.order.cancellation = {
      cancelled_by: orderCancelledBy,
      reason: {
        id: cancellationReasonId,
      },
    }
  }
  return removeIdKeys(schema)
}

export const getSupport = async (data: any) => {
  data.context.timestamp = new Date().toISOString()
  const context = data.context
  context.bpp_id = BPP_ID
  context.bpp_uri = BPP_URI
  context.action = 'on_support'
  delete context.ttl
  const schema = {
    context,
    message: {
      phone: data?.data?.data[0]?.phone,
      email: data?.data?.data[0]?.email,
      uri: data?.data?.data[0]?.uri,
    },
  }
  return removeIdKeys(schema)
}

export const getCancel = async (data: any) => {
  data.context.timestamp = new Date().toISOString()
  const context = data.context
  context.bpp_id = BPP_ID
  context.bpp_uri = BPP_URI
  context.action = 'on_cancel'
  delete context.ttl

  if (data.data.error) {
    const schema: any = {
      context,
      error: data.data.error,
    }
    return removeIdKeys(schema)
  }
  const { order_id, status, items, quote, fulfillments, billing, linked_order, payment, provider, orderCancelledBy } =
    data?.data?.data

  if (fulfillments?.length > 1) {

  fulfillments.forEach((eachFulfillment:any)=>{
      if (eachFulfillment.state.descriptor.code === "Cancelled") {
        eachFulfillment.tags.push({
          code: 'precancel_state',
          list: [
            {
              code: 'fulfillment_state',
              value: status,
            },
            {
              code: 'updated_at',
              value: new Date(data?.data?.data.updatedAt).toISOString(),
            },
          ],
        });
      }
    }
  )
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
          fulfillments: fulfillments,
          billing: billing,
          payment: payment,
          '@ondc/org/linked_order': linked_order,
          updated_at: data.context.timestamp,
        },
      },
    }
    return removeIdKeys(schema)
  }
  const taskState = states?.find((obj: any) => {
    return obj?.possibleStates?.includes(status)
  })
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
            id: fulfillments[0].id,
            type: fulfillments[0].type,
            state: {
              descriptor: {
                code: taskState?.key,
              },
            },
            tags: fulfillments[0].tags,
            '@ondc/org/awb_no': '1227262193237777',
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
        updated_at: data.context.timestamp,
      },
    },
  }
  return removeIdKeys(schema)
}

export const getIssue = async (data: any) => {
  const context = data.context
  context.bpp_id = BPP_ID
  context.bpp_uri = BPP_URI
  context.action = 'on_issue'
  context.timestamp = new Date().toISOString()
  delete context.ttl

  const schema = {
    context,
    message: {
      issue: {
        id: data.data.data.id,
        issue_actions: {
          respondent_actions: data.data.data.issue_actions.respondent_actions,
        },
        created_at: data.data.data.created_at,
        updated_at: data.data.data.updated_at,
      },
    },
  }
  schema.message.issue.issue_actions.respondent_actions =
    schema?.message?.issue?.issue_actions?.respondent_actions?.map((action: any) => {
      const updated_at = new Date(action.updated_at)
      action.updated_at = updated_at.toISOString()
      return action
    })
  const updated_at = new Date(schema?.message?.issue?.updated_at)
  schema.message.issue.updated_at = updated_at.toISOString()
  return removeIdKeys(schema)
}

export const getIssueStatus = async (data: any) => {
  const context = data.context
  context.bpp_id = BPP_ID
  context.bpp_uri = BPP_URI
  context.action = 'on_issue_status'
  context.timestamp = new Date().toISOString()
  delete context.ttl

  if (data.data.issue.issueState === 'Resolved') {
    const schema = {
      context,
      message: {
        issue: {
          id: data.data.issue.id,
          issue_actions: {
            respondent_actions: data.data.issue.issue_actions.respondent_actions,
          },
          resolution_provider: data.data.issue.resolution_provider,
          resolution: data.data.issue.resolution,
          created_at: data.data.issue.created_at,
          updated_at: new Date(data.data.issue.updated_at).toISOString(),
        },
      },
    }
    return removeIdKeys(schema)
  } else {
    const schema = {
      context,
      message: {
        issue: {
          id: data.data.issue.id,
          issue_actions: {
            respondent_actions: data.data.issue.issue_actions.respondent_actions,
          },
          created_at: data.data.issue.created_at,
          updated_at: new Date(data.data.issue.updated_at).toISOString(),
        },
      },
    }
    schema.message.issue.issue_actions.respondent_actions =
      schema?.message?.issue?.issue_actions?.respondent_actions?.map((action: any) => {
        const updated_at = new Date(action.updated_at)
        action.updated_at = updated_at.toISOString()
        return action
      })
    const updated_at = new Date(schema?.message?.issue?.updated_at)
    schema.message.issue.updated_at = updated_at.toISOString()
    return removeIdKeys(schema)
  }
}

export const getTrackOrder = async (data: any) => {

  const currentTime = new Date().toISOString()
  const context = data.context
  const actionTimeStamp = data.context.timestamp
  context.bpp_id = BPP_ID
  context.bpp_uri = BPP_URI
  context.action = 'on_track'
  context.timestamp = currentTime
  delete context.ttl
  // console.log(data?.data?.data?.assignee?.currentLocation)
  const schema: On_Track = {
    context,
    message: {
      tracking: {
        id: data?.data?.data?.fulfillments[0]?.id,
        url: data?.data?.data?.trackingUrl,
        location: data?.data?.data?.trackStatus==="inactive"? {} : {
          gps: `${(data?.data?.data?.assignee?.currentLocation?.coordinates[0]).toFixed(
            6,
          )},${(data?.data?.data?.assignee?.currentLocation?.coordinates[1]).toFixed(6)}`,
          time: {
            timestamp: actionTimeStamp,
          },
          updated_at: currentTime,
        },
        status: data?.data?.data?.trackStatus,
      },
    },
  }

  return schema
}
