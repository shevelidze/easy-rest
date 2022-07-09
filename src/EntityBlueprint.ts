import EntityMethod from './EntityMethod';
import { type EntityMember } from './entityMembers';

export interface Include {
  [key: string]: Include | boolean;
}

export interface Mutate {
  [key: string]: any;
}

export type DataModifierArgs = { auth: any };
export type WithId = { id: string };

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

export default interface EntityBlueprint {
  methods: { [key: string]: EntityMethod };
  members: { [key: string]: EntityMember };
  creator?: Creator;
  fetcher: Fetcher;
  mutator?: Mutator;
  deleter?: Deleter;
}
