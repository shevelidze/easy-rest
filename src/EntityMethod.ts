export default interface EntityMethod {
  func: (id: string) => any;
  argumentsJtdSchema?: any;
  resultJtdSchema?: any;
}
