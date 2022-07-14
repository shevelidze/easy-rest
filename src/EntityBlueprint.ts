import { EntityMethodBlueprintsDict } from './EntityMethod';
import {
  ComplexEntityMemberBlueprint,
  PrimitiveEntityMember,
  ArrayEntityMemberBlueprint,
} from './entityMembers';
import { DataModifierArgs, WithId } from './dataModifier';
import { SchemaFormProperties } from 'jtd';

export interface Include {
  [key: string]: Include | boolean;
}

export interface Mutate {
  [key: string]: any;
}

export type CreatorArgs = { newObject: any } & DataModifierArgs;
export type Creator = (args: CreatorArgs) => Promise<void>;
export type FetcherArgs = {
  ids?: string[];
  include: Include;
} & DataModifierArgs;
export type Fetcher = (args: FetcherArgs) => Promise<any>;
export type MutatorArgs = {
  mutate: Mutate;
} & DataModifierArgs;
export type Mutator = (args: MutatorArgs & WithId) => Promise<void>;
export type Deleter = (args: DataModifierArgs & WithId) => Promise<void>;

export type EntityMember =
  | PrimitiveEntityMember
  | ComplexEntityMemberBlueprint
  | ArrayEntityMemberBlueprint;

export type EntityMembersDict = {
  [key: string]: EntityMember;
};

export default interface EntityBlueprint {
  methods?: EntityMethodBlueprintsDict;
  members?: EntityMembersDict;
  creator?: Creator;
  fetcher: Fetcher;
  mutator?: Mutator;
  deleter?: Deleter;
  creatorSchema?: SchemaFormProperties;
}

export type BlueprintsDict = { [key: string]: EntityBlueprint };
