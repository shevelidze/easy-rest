export default interface EntityMethod {
  func: (id: string, body: any) => any;
  argumentsJtdSchema?: any;
  resultJtdSchema?: any;
}
