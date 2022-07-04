import { Schema } from 'jtd';

export default interface EntityMethod {
  func: (id: string, body: any) => Promise<any>;
  argumentsJtdSchema?: Schema;
  resultJtdSchema?: Schema;
}
