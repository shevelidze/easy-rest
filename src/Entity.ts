import EntityMethod from './EntityMethod';
import { type EntityMember } from './entityMembers';

export interface Include {
  [key: string]: Include | boolean;
}

export type IdExistenceChecker = (id: string) => Promise<boolean>;
export type Creator = (properties: { [key: string]: any }) => Promise<void>;
export type Fetcher = (args: {
  ids?: string[];
  include?: Include;
}) => Promise<any>;
export type Mutator = (
  id: string,
  mutate: { [key: string]: any }
) => Promise<void>;
export type Deleter = (id: string) => Promise<void>;

export default interface Entity {
  name: string;
  methods: { [key: string]: EntityMethod };
  members: { [key: string]: EntityMember };
  creator?: Creator;
  fetcher: Fetcher;
  mutator?: Mutator;
  deleter?: Deleter;
  idExistenceChecker: IdExistenceChecker;
}
