import { Schema } from 'jtd';
import { DataModifierArgs, WithId } from './dataModifier';

export interface EntityMethodArgs extends DataModifierArgs, WithId {
  body: any;
}

export type EntityMethodFunction = (args: EntityMethodArgs) => Promise<any>;

export interface EntityMethodBlueprint {
  func: EntityMethodFunction;
  argumentsJtdSchema?: Schema;
}

export default interface EntityMethod {
  func: EntityMethodFunction;
  argumentsJtdSchema: Schema;
}

export type EntityMethodBlueprintsDict = {
  [key: string]: EntityMethodBlueprint;
};
export type EntityMethodsDict = { [key: string]: EntityMethod };
