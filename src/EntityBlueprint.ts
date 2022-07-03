import EntityMethod from './EntityMethod';
import { type EntityMember } from './entityMembers';

export interface Include {
  [key: string]: Include | boolean;
}

export interface Mutate {
  [key: string]: any;
}

export type Creator = (newObejct: any) => Promise<void>;
export type Fetcher = (args: {
  ids?: string[];
  include: Include;
}) => Promise<any>;
export type Mutator = (id: string, mutate: Mutate) => Promise<void>;
export type Deleter = (id: string) => Promise<void>;

export default interface EntityBlurprint {
  methods: { [key: string]: EntityMethod };
  members: { [key: string]: EntityMember };
  creator?: Creator;
  fetcher: Fetcher;
  mutator?: Mutator;
  deleter?: Deleter;
}
