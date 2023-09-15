/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
class Token {
  private payload: any;
  private exp: number;

  /**
   *
   * @param {*} payload token payload
   * @param {*} exp     token expiry
   */
  constructor(payload: any, exp: number) {
    this.payload = payload;
    this.exp = exp;
  }

  setPayload(payload: any): void {
    this.payload = payload;
  }

  getPayload(): any {
    return this.payload;
  }

  setExp(exp: number): void {
    this.exp = exp;
  }

  getExp(): number {
    return this.exp;
  }
}

export default Token;
