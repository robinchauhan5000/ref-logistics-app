import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Used to communicate with the server
 */
class HttpRequest {
  private url: string;
  private method: string;
  private data: any;
  private headers: any;
  private options?: AxiosRequestConfig;

  /**
   * @param url Resource URL
   * @param method HTTP method (GET | POST | PUT | PATCH | DELETE)
   * @param data HTTP request data (If applicable)
   * @param headers HTTP request headers
   * @param options Other parameters for Axios request configuration
   */
  constructor(url: string, method: string, data: any = {}, headers: any = {}, options?: AxiosRequestConfig) {
    this.url = url;
    this.method = method;
    this.data = data;
    this.headers = headers;
    this.options = options;
  }

  /**
   * Send an HTTP request to the server to write data to / read data from the server
   * axios library provides promise implementation to send a request to the server
   * Here we are using the axios library for requesting a resource
   */
  async send(): Promise<AxiosResponse<any>> {
    try {
      const config: AxiosRequestConfig = {
        url: this.url,
        method: this.method,
        headers: this.headers,
        timeout: 180000, // If the request takes longer than `timeout`, the request will be aborted.
        ...this.options,
      };

      if (this.method.toString().toLowerCase() !== 'get') {
        this.headers = { ...this.headers, 'Content-Type': 'application/json' };
        config.data = this.data;
      }

      const result = await axios(config);
      return result;
    } catch (err: any) {
      console.log('Error:', err);
      if (err.response) {
        // The client was given an error response (5xx, 4xx)
        console.log('Error response', err.response);
      } else if (err.request) {
        // The client never received a response, and the request was never left
        console.log('Error request', err.request);
      } else {
        // Anything else
        console.log('Error message', err.message);
      }

      throw err;
    }
  }
}

export default HttpRequest;
