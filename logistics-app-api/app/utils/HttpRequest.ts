import axios, { AxiosResponse } from 'axios'
import logger from '../lib/logger'

/**
 * Used to communicate with server
 */
class HttpRequest {
  baseUrl: string
  url: string
  method: string
  data: any
  headers: any
  options?: any

  /**
   * @param {*} baseUrl Base URL(domain url)
   * @param {*} url Resource URL
   * @param {*} method HTTP method(GET | POST | PUT | PATCH | DELETE)
   * @param {*} headers HTTP request headers
   * @param {*} data HTTP request data (If applicable)
   * @param {*} options other params
   */
  constructor(baseUrl: string, url: string, method: string = 'get', data: any = {}, headers: any = {}, options?: any) {
    this.baseUrl = baseUrl
    this.url = url
    this.method = method
    this.data = data
    this.headers = headers
    this.options = options
  }

  /**
   * Send http request to server to write data to / read data from server
   * axios library provides promise implementation to send request to server
   * Here we are using axios library for requesting a resource
   */
  async send(): Promise<AxiosResponse> {
    try {
      let result: AxiosResponse

      if (this.method.toLowerCase() === 'get') {
        const headers = { ...this.headers }
        result = await axios({
          baseURL: this.baseUrl,
          url: this.url,
          method: this.method,
          headers: headers,
          timeout: 180000, // If the request takes longer than `timeout`, the request will be aborted.
        })
      } else {
        const headers = { ...this.headers, 'Content-Type': 'application/json' }
        // Make server request using axios
        result = await axios({
          baseURL: this.baseUrl,
          url: this.url,
          method: this.method,
          headers: headers,
          timeout: 180000, // If the request takes longer than `timeout`, the request will be aborted.
          data: JSON.stringify(this.data),
        })
      }

      return result
    } catch (err: any) {
      logger.error(`error: ${err.message}`)

      if (err.response) {
        // The client was given an error response (5xx, 4xx)
        logger.error('Error response', err, '\n', err.response)
      } else if (err.request) {
        // The client never received a response, and the request was never left
        logger.error('Error request', err, '\n', err.request)
      } else {
        // Anything else
        logger.error('Error message', err, '\n', err.message)
      }

      throw err
    }
  }
}

export default HttpRequest
