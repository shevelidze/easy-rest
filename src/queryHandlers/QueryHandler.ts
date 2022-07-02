export class ApiResult {
  constructor(code: number = 200, body?: any) {
    this.code = code;
    this.body = body;
  }
  code: number;
  body?: any;
}

export default interface QueryHandler {
  handleQueryElement: (
    query: string[],
    httpMethod: string,
    body?: any
  ) => Promise<QueryHandler | ApiResult>;
}
