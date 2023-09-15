import HttpRequest from '../utils/HttpRequest'
import logger from '../lib/logger'
import LogisticsService from './logistics.service'
import { ISearchRequest } from '../utils/interfaces/RequestInterface/SearchPayloadInterface'
import { On_search } from '../utils/interfaces/onSearchInterface'
import { IInitRequest } from '../utils/interfaces/RequestInterface/InitPayloadInterface'
import { On_init } from '../utils/interfaces/onInitInterface'
import { IConfirmRequest } from '../utils/interfaces/RequestInterface/ConfirmPayloadInterface'
import { On_confirm } from '../utils/interfaces/onConfirmInterface'
import { IUpdateRequest } from '../utils/interfaces/RequestInterface/UpdatePayloadInterface'
import { On_update } from '../utils/interfaces/onUpdateInterface'
import { IStatusRequest } from '../utils/interfaces/RequestInterface/StatusPayloadInterface'
import { ITrackRequest } from '../utils/interfaces/RequestInterface/TrackPayloadInterface'
import { IIssueRequest } from '../utils/interfaces/RequestInterface/IssuePayloadInterface'
import { IIssueStatusRequest } from '../utils/interfaces/RequestInterface/IssueStatusPayloadInterface'
import { ICancelRequest } from '../utils/interfaces/RequestInterface/CancelPayloadInterface'

const logisticsService = new LogisticsService()

class OndcService {
  async agentSearch(payload: ISearchRequest) {
    try {
      // const {criteria = {}, payment = {}} = req || {};
      const order = payload
      const selectMessageId = payload?.context?.message_id

      this.postSearchRequest(order, selectMessageId)
      return { status: 'ACK' }
    } catch (err) {
      logger.error('error', `[Ondc Service] search logistics payload `, err)
      throw err
    }
  }

  async postSearchRequest(searchRequest: ISearchRequest, selectMessageId: string): Promise<any> {
    try {
      this.buildSearchRequest(searchRequest, selectMessageId)
    } catch (err) {
      logger.error('error', `[Ondc Service] post http select response : `, err)
      return err
    }
  }

  async buildSearchRequest(searchRequest: ISearchRequest, searchMessageId: string): Promise<any> {
    try {
      const searchResponse = await logisticsService.search(searchRequest, searchMessageId)
      await this.postSearchResponse(searchResponse)
    } catch (e) {
      logger.error('error', `[Ondc Service] search logistics payload - build select request : param :`, e)
      return e
    }
  }
  async postSearchResponse(searchResponse: On_search) {
    try {
      logger.info(`POST search response : ${JSON.stringify(searchResponse, null, 2)}`)
      const protocolURL = process.env.PROTOCOL_BASE_URL || ''
      const headers = {}
      const httpRequest = new HttpRequest(protocolURL, `/protocol/v1/on_search`, 'POST', searchResponse, headers)
      const result = await httpRequest.send()
      return result.data
    } catch (e) {
      logger.error('error', `[Ondc Service] post http search response : `, e)
      return e
    }
  }
  //Init
  //Init
  async orderInit(payload: IInitRequest) {
    //TODO:  Init logic
    //TODO:  Init logic
    try {
      await this.postInitRequest(payload)
      // await this.postInitResponse(initResponse)
      return { status: 'ACK' }
    } catch (err) {
      return err
    }
  }

  async postInitRequest(initRequest: IInitRequest): Promise<any> {
    try {
      this.buildInitRequest(initRequest)
    } catch (err) {
      return err
    }
  }

  async buildInitRequest(initRequest: IInitRequest): Promise<any> {
    try {
      const initResponse = await logisticsService.init(initRequest)
      await this.postInitResponse(initResponse)
    } catch (err) {
      return err
    }
  }

  async postInitResponse(initResponse: On_init) {
    try {
      logger.info(`POST init response : ${JSON.stringify(initResponse, null, 2)}`)
      const protocolURL = process.env.PROTOCOL_BASE_URL || ''
      const headers = {}
      const httpRequest = new HttpRequest(protocolURL, `/protocol/v1/on_init`, 'POST', initResponse, headers)

      const result = await httpRequest.send()

      return result.data
    } catch (err: any) {
      logger.error('error', `[Ondc Service] post init request :`, { error: err.stack, message: err.message })
      return err
    }
  }

  //confirm

  async orderConfirm(payload: IConfirmRequest): Promise<any> {
    try {
      // TODO: Confirm logic
      await this.postConfirmRequest(payload)
      return { status: 'ACK' }
    } catch (err) {
      return err
    }
  }

  async postConfirmRequest(confirmRequest: IConfirmRequest): Promise<any> {
    try {
      // TODO: Confirm logic
      await this.buildConfirmRequest(confirmRequest)
    } catch (err) {
      return err
    }
  }

  async buildConfirmRequest(confirmRequest: IConfirmRequest): Promise<any> {
    try {
      const confirmResponse: On_confirm = await logisticsService.confirm(confirmRequest)
      this.postConfirmResponse(confirmResponse)
    } catch (error) {
      return error
    }
  }

  async postConfirmResponse(confirmResponse: On_confirm): Promise<any> {
    try {
      logger.info(`POST confirm response : ${JSON.stringify(confirmResponse, null, 2)}`)
      const headers = {}
      const protocolURL = process.env.PROTOCOL_BASE_URL || ''
      const httpRequest = new HttpRequest(protocolURL, `/protocol/v1/on_confirm`, 'POST', confirmResponse, headers)
      const result = await httpRequest.send()

      return result.data
    } catch (e) {
      return e
    }
  }

  async orderUpdate(payload: IUpdateRequest): Promise<any> {
    try {
      // TODO: Confirm logic
      await this.postUpdateRequest(payload)
      return { status: 'ACK' }
    } catch (err) {
      return err
    }
  }

  async postUpdateRequest(updateRequest: IUpdateRequest): Promise<any> {
    try {
      // TODO: Confirm logic
      await this.buildUpdateRequest(updateRequest)
    } catch (err) {
      return err
    }
  }

  async buildUpdateRequest(updateRequest: IUpdateRequest): Promise<any> {
    try {
      const updateResponse: On_update = await logisticsService.update(updateRequest)
      this.postUpdateResponse(updateResponse)
    } catch (error) {
      return error
    }
  }

  async postUpdateResponse(updateResponse: On_update): Promise<any> {
    try {
      logger.info(`POST update response : ${JSON.stringify(updateResponse, null, 2)}`)
      const headers = {}
      const protocolURL = process.env.PROTOCOL_BASE_URL || ''
      const httpRequest = new HttpRequest(protocolURL, `/protocol/v1/on_update`, 'POST', updateResponse, headers)
      const result = await httpRequest.send()

      return result.data
    } catch (e) {
      return e
    }
  }

  async orderStatus(payload: IStatusRequest): Promise<any> {
    try {
      // TODO: Confirm logic
      await this.postStatusRequest(payload)
      return { status: 'ACK' }
    } catch (err) {
      return err
    }
  }
  async postStatusRequest(statusRequest: IStatusRequest): Promise<any> {
    try {
      // TODO: Confirm logic
      await this.buildStatusRequest(statusRequest)
    } catch (err) {
      return err
    }
  }
  async buildStatusRequest(statusRequest: IStatusRequest): Promise<any> {
    try {
      const statusResponse = await logisticsService.status(statusRequest)
      this.postStatusResponse(statusResponse)
    } catch (error) {
      return error
    }
  }

  async postStatusResponse(statusResponse: any): Promise<any> {
    try {
      logger.info(`POST status response : ${JSON.stringify(statusResponse, null, 2)}`)
      const headers = {}
      const protocolURL = process.env.PROTOCOL_BASE_URL || ''
      const httpRequest = new HttpRequest(protocolURL, `/protocol/v1/on_status`, 'POST', statusResponse, headers)
      const result = await httpRequest.send()

      return result.data
    } catch (e) {
      return e
    }
  }

  async orderSupport(payload: any, _req: any) {
    try {
      await this.postSupportRequest(payload)
      return { status: 'ACK' }
    } catch (error) {
      return error
    }
  }
  async postSupportRequest(supportRequest: any): Promise<any> {
    try {
      await this.buildSupportRequest(supportRequest)
    } catch (error) {
      return error
    }
  }
  async buildSupportRequest(supportRequest: any) {
    try {
      const supportResponse = await logisticsService.support(supportRequest)
      this.postSupportResponse(supportResponse)
    } catch (error) {}
  }
  async postSupportResponse(supportResponse: any) {
    try {
      logger.info(`POST support response : ${JSON.stringify(supportResponse, null, 2)}`)
      const headers = {}
      const protocolURL = process.env.PROTOCOL_BASE_URL || ''
      const httpRequest = new HttpRequest(protocolURL, `/protocol/v1/on_support`, 'POST', supportResponse, headers)
      const result = await httpRequest.send()

      return result.data
    } catch (e) {
      return e
    }
  }

  async orderCancel(payload: ICancelRequest): Promise<any> {
    try {
      await this.postCancelRequest(payload)
      return { status: 'ACK' }
    } catch (error) {
      return error
    }
  }
  async postCancelRequest(cancelRequest: ICancelRequest): Promise<any> {
    try {
      await this.buildCancelRequest(cancelRequest)
    } catch (error) {
      return error
    }
  }
  async buildCancelRequest(cancelRequest: ICancelRequest): Promise<any> {
    try {
      const cancelResponse = await logisticsService.cancel(cancelRequest)
      this.postCancelResponse(cancelResponse)
    } catch (error) {
      return error
    }
  }
  async postCancelResponse(cancelResponse: any) {
    try {
      logger.info(`POST cancel response : ${JSON.stringify(cancelResponse, null, 2)}`)
      const headers = {}
      const protocolURL = process.env.PROTOCOL_BASE_URL || ''
      const httpRequest = new HttpRequest(protocolURL, `/protocol/v1/on_cancel`, 'POST', cancelResponse, headers)
      const result = await httpRequest.send()
      return result.data
    } catch (error) {
      return error
    }
  }

  async orderIssue(payload: IIssueRequest) {
    try {
      await this.postIssueRequest(payload)
      return { status: 'ACK' }
    } catch (error) {
      return error
    }
  }
  async postIssueRequest(issueRequest: IIssueRequest): Promise<any> {
    try {
      await this.buildIssueRequest(issueRequest)
    } catch (error) {
      return error
    }
  }
  async buildIssueRequest(issueRequest: IIssueRequest): Promise<any> {
    try {
      const status = issueRequest.message.issue.status
      const issueResponse = await logisticsService.issue(issueRequest)
      if (status === 'OPEN') {
        this.postIssueResponse(issueResponse)
      }
    } catch (error) {
      return error
    }
  }
  async postIssueResponse(issueResponse: any) {
    try {
      logger.info(`POST issue response : ${JSON.stringify(issueResponse, null, 2)}`)
      const headers = {}
      const protocolURL = process.env.PROTOCOL_BASE_URL || ''
      logger.info(`ProtocolURL : ${protocolURL} on_issue_response : ${JSON.stringify(issueResponse)} `)
      const httpRequest = new HttpRequest(protocolURL, `/protocol/v1/on_issue`, 'POST', issueResponse, headers)
      const result = await httpRequest.send()
      return result.data
    } catch (error) {
      return error
    }
  }

  async issueStatus(payload: IIssueStatusRequest) {
    try {
      await this.postIssueStatusRequest(payload)
      return { status: 'ACK' }
    } catch (error) {
      return error
    }
  }
  async postIssueStatusRequest(issueStatusRequest: IIssueStatusRequest): Promise<any> {
    try {
      this.buildIssueStatusRequest(issueStatusRequest)
    } catch (error) {
      return error
    }
  }
  async buildIssueStatusRequest(issueStatusRequest: IIssueStatusRequest): Promise<any> {
    try {
      const issueStatusResponse = await logisticsService.issueStatus(issueStatusRequest)
      this.postIssueStatusResponse(issueStatusResponse)
    } catch (error) {
      return error
    }
  }

  async postIssueStatusResponse(issueStatusResponse: any) {
    try {
      logger.info(`POST issueStatus response : ${JSON.stringify(issueStatusResponse, null, 2)}`)
      const headers = {}
      const protocolURL = process.env.PROTOCOL_BASE_URL || ''
      logger.info(`ProtocolURL : ${protocolURL} on_issue_status_response : ${JSON.stringify(issueStatusResponse)} `)
      const httpRequest = new HttpRequest(
        protocolURL,
        `/protocol/v1/on_issue_status`,
        'POST',
        issueStatusResponse,
        headers,
      )
      const result = await httpRequest.send()
      return result.data
    } catch (error) {
      return error
    }
  }

  async trackOrder(payload: ITrackRequest) {
    try {
      // console.log('trackOrder')
      await this.postTrackOrderRequest(payload)
      return { status: 'ACK' }
    } catch (error) {
      return error
    }
  }

  async postTrackOrderRequest(trackOrderRequest: ITrackRequest): Promise<any> {
    try {
      this.buildTrackOrderRequest(trackOrderRequest)
    } catch (error) {
      return error
    }
  }
  async buildTrackOrderRequest(trackOrderRequest: ITrackRequest): Promise<any> {
    try {
      const trackOrderResponse = await logisticsService.trackOrder(trackOrderRequest)
      this.postTrackOrderResponse(trackOrderResponse)
    } catch (error) {
      return error
    }
  }

  async postTrackOrderResponse(trackOrderResponse: any) {
    try {
      logger.info(`POST track response : ${JSON.stringify(trackOrderResponse, null, 2)}`)
      const headers = {}
      const protocolURL = process.env.PROTOCOL_BASE_URL || ''
      logger.info(`ProtocolURL : ${protocolURL} on_track_response : ${JSON.stringify(trackOrderResponse)} `)
      const httpRequest = new HttpRequest(protocolURL, `/protocol/v1/on_track`, 'POST', trackOrderResponse, headers)
      const result = await httpRequest.send()
      return result.data
    } catch (error) {
      return error
    }
  }
}

export default OndcService
