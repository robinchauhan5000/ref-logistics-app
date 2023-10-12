import HttpRequest from '../utils/HttpRequest'
// import config from '../lib/config/index'
import {
  getAgents,
  getConfirm,
  getInit,
  getUpdate,
  getStatus,
  getCancel,
  getSupport,
  getIssue,
  getIssueStatus,
  getTrackOrder,
} from '../utils/schemaMapping'

import { getInitV2, getConfirmV2,getStatusV2 } from '../utils/schemaMappingV2'
import { getAgentsV2 } from '../utils/schemaMappingV2'

class LogisticsService {
  async search(searchRequest: any, _searchMessageId: any) {
    const headers = {}
    const serverUrl = process.env.LOGISTICS_SERVER_URL || ''
    const { category, fulfillment, payment, provider } = searchRequest.message.intent
    const searchParams = {
      transaction_id: searchRequest.context.transaction_id,
      category,
      linked_order: {
        items: [
          {
            category_id: searchRequest.message.intent['@ondc/org/payload_details'].category,
            price: searchRequest.message.intent['@ondc/org/payload_details'].price,
            dangerous_goods: searchRequest.message.intent['@ondc/org/payload_details'].dangerous_goods,
          },
        ],

        order: {
          weight: searchRequest.message.intent['@ondc/org/payload_details'].weight,
          dimensions: searchRequest.message.intent['@ondc/org/payload_details'].dimensions,
        },
        provider: provider,
      },
      fulfillments: [fulfillment],
      payment: {
        type: payment?.type,
        collection_amount: payment?.['@ondc/org/collection_amount']
      },
    }
    let apiEndpoint = '/api/v1/logistics/agent/search'
    if (searchRequest.context.core_version === '1.1.0') {
      apiEndpoint = `/api/v2/logistics/agent/search`
    }
    const httpRequest = new HttpRequest(
      serverUrl,
      apiEndpoint, //TODO: allow $like query
      'POST',
      searchParams,
      headers,
    )
    const result = await httpRequest.send()
    let agentData
    if (searchRequest.context.core_version === '1.1.0') {
      agentData = await getAgentsV2({
        data: result.data,
        context: searchRequest.context,
        fulfillment: fulfillment,
      })
    } else {
      agentData = await getAgents({
        data: result.data,
        context: searchRequest.context,
        fulfillment: fulfillment,
      })
    }
    return agentData
  }

  async init(initRequest: any) {
    try {
      const serverUrl = process.env.LOGISTICS_SERVER_URL || ''
      const headers = {}

      // const searchParams = confirmRequest.message.order
      const { provider, payment, billing, fulfillments, items } = initRequest.message.order
      let apiEndpoint = '/api/v1/logistics/task/init'
      if (initRequest.context.core_version === '1.1.0') {
        apiEndpoint = `/api/v2/logistics/task/init`
      }

      const httpRequest = new HttpRequest(
        serverUrl,
        apiEndpoint, //TODO: allow $like query
        'POST',
        {
          provider,
          billing,
          fulfillments,
          items,
          payment,
          transaction_id: initRequest.context.transaction_id,
          agentId: provider.id,
          is_confirmed: false,
        },
        headers,
      )
      const result: any = await httpRequest.send()
      let initData
      if (initRequest.context.core_version === '1.1.0') {
        initData = await getInitV2({
          data: result.data,
          context: initRequest.context,
          message: initRequest.message,
        })
      } else {
        initData = await getInit({
          data: result.data,
          context: initRequest.context,
          message: initRequest.message,
        })
      }
      return initData
    } catch (err) {
      return err
    }
  }

  async confirm(confirmRequest: any) {
    const serverUrl = process.env.LOGISTICS_SERVER_URL || ''
    const headers = {}

    const searchParams = confirmRequest.message.order
    let apiEndpoint = '/api/v1/logistics/task/confirm'
    if (confirmRequest.context.core_version === '1.1.0') {
      apiEndpoint = `/api/v2/logistics/task/confirm`
    }

    try {
      const httpRequest = new HttpRequest(
        serverUrl,
        apiEndpoint, //TODO: allow $like query
        'PUT',
        {
          ...searchParams,
          payment: {
            ...searchParams.payment,
          },

          linked_order: searchParams['@ondc/org/linked_order'],
          transaction_id: confirmRequest.context.transaction_id,
          bap_id: confirmRequest.context.bap_id,
          is_confirmed: true,
          orderConfirmedAt: Date.now(),
          status: 'Agent-assigned',
          context: JSON.stringify(confirmRequest?.context),
          order_id: searchParams.id,
        },
        headers,
      )
      const result = await httpRequest.send()
      const context = confirmRequest.context
      let confirmData
      if (confirmRequest.context.core_version === '1.1.0') {
        confirmData = await getConfirmV2({
          data: result.data,
          context: { ...context },
          message: confirmRequest.message,
          createdAt: confirmRequest.context.timestamp,
        })
      } else {
        confirmData = await getConfirm({
          data: result.data,
          context: { ...context },
          message: confirmRequest.message,
          createdAt: confirmRequest.context.timestamp,
        })
      }
      return confirmData
    } catch (err) {
      return err
    }
  }

  async update(updateRequest: any) {
    try {
      const serverUrl = process.env.LOGISTICS_SERVER_URL || ''
      const headers = {}
      const updatePayload = {
        context: updateRequest.context,
        order: updateRequest.message.order,
      }
      const httpRequest = new HttpRequest(
        serverUrl,
        `/api/v1/logistics/task/updateTask`, //TODO: allow $like query
        'POST',
        updatePayload,
        headers,
      )
      const result = await httpRequest.send()
      const context = updateRequest.context

      const updateData = await getUpdate({ data: result.data, context: { ...context } })
      return updateData
    } catch (error) {
      return error
    }
  }
  async status(statusRequest: any) {
    try {
      const serverUrl = process.env.LOGISTICS_SERVER_URL || ''
      const headers = {}
      const statusPayload = {
        transaction_id: statusRequest.context.transaction_id,
        orderId: statusRequest.message.order_id,
      }
      let apiEndpoint = '/api/v1/logistics/taskStatus'
      if (statusRequest.context.core_version === '1.1.0') {
        apiEndpoint = `/api/v2/logistics/taskStatus`
      }
      const httpRequest = new HttpRequest(
        serverUrl,
        apiEndpoint, //TODO: allow $like query
        'POST',
        statusPayload,
        headers,
      )
      const result = await httpRequest.send()
      const context = statusRequest.context
      let statusData
      if (statusRequest.context.core_version === '1.1.0') {
        statusData = await getStatusV2({ data: result.data, context: { ...context } })
      } else {
        statusData = await getStatus({ data: result.data, context: { ...context } })
      }
      return statusData
    } catch (error) {
      return error
    }
  }

  async support(supportRequest: any) {
    try {
      const serverUrl = process.env.LOGISTICS_SERVER_URL || ''
      const headers = {}
      // const updatePayload = {}

      const httpRequest = new HttpRequest(
        serverUrl,
        `/api/v1/logistics/support`, //TODO: allow $like query
        'GET',
        {},
        headers,
      )
      const result = await httpRequest.send()
      const statusData = await getSupport({ data: result.data, context: supportRequest.context })
      return statusData
    } catch (error) {
      return error
    }
  }

  async cancel(cancelRequest: any) {
    try {
      const serverUrl = process.env.LOGISTICS_SERVER_URL || ''
      const headers = {}
      const cancelPayload = {
        transaction_id: cancelRequest.context.transaction_id,
        cancellationReasonId: cancelRequest.message.cancellation_reason_id,
      }
      const httpRequest = new HttpRequest(serverUrl, `/api/v1/logistics/cancel`, 'POST', cancelPayload, headers)
      const result = await httpRequest.send()
      const context = cancelRequest.context
      const cancelData = await getCancel({
        data: result.data,
        context: { ...context },
        cancellationReasonId: cancelRequest.message.cancellation_reason_id,
      })
      return cancelData
    } catch (error) {
      return error
    }
  }

  async issue(issueRequest: any) {
    const serverUrl = process.env.LOGISTICS_SERVER_URL || ''
    const headers = {}
    const issuePayload = issueRequest.message.issue
    const transaction_id = issueRequest.context.transaction_id
    const context = JSON.stringify(issueRequest.context)
    const httpRequest = new HttpRequest(
      serverUrl,
      `/api/v1/logistics/issue`,
      'POST',
      { ...issuePayload, transaction_id, context },
      headers,
    )
    const result = await httpRequest.send()
    const issueData = await getIssue({ data: result.data, context: issueRequest.context })
    return issueData
  }

  async issueStatus(issueStatusRequest: any): Promise<any> {
    try {
      const serverUrl = process.env.LOGISTICS_SERVER_URL || ''
      const headers = {}
      const issuePayload = issueStatusRequest.message
      const httpRequest = new HttpRequest(serverUrl, `/api/v1/logistics/issueStatus`, 'POST', issuePayload, headers)
      const result = await httpRequest.send()
      const context = issueStatusRequest.context
      const issueStatusData = await getIssueStatus({ data: result.data, context: { ...context } })
      return issueStatusData
    } catch (error) {
      return error
    }
  }

  async trackOrder(trackOrderRequest: any): Promise<any> {
    try {
      const serverUrl = process.env.LOGISTICS_SERVER_URL || ''
      const headers = {}
      const trackOrderPayload = {
        transaction_id: trackOrderRequest.context.transaction_id,
        order_id: trackOrderRequest.message.order_id,
      }
      const httpRequest = new HttpRequest(serverUrl, `/api/v1/logistics/trackOrder`, 'POST', trackOrderPayload, headers)
      const result = await httpRequest.send()
      const context = trackOrderRequest.context
      const trackOrderData = await getTrackOrder({ data: result.data, context: { ...context } })
      return trackOrderData
    } catch (error) {
      return error
    }
  }
}

export default LogisticsService
