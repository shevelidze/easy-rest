import { Mutate, type Include } from './EntityBlueprint';
import type EntityBlueprint from './EntityBlueprint';
import {
  NoCreatorFunctionProvidedError,
  NoMutatorFunctionProvidedError,
  NoDeleterFunctionProvidedError,
} from './errors';
import { ArrayEntityMember, EntityMember } from './entityMembers';

export default class Entity {
  constructor(
    name: string,
    entityBlueprint: EntityBlueprint,
    entities: EntitesObject,
    entitiesNames: Set<string>
  ) {
    this.entityBlueprint = entityBlueprint;
    this.name = name;
    this.include = {};
    this.lightInclude = {};

    let isIdMemberProvided = false;

    for (const memberKey in entityBlueprint.members) {
      const entityMember = entityBlueprint.members[memberKey];

      this.validateEntityMember(entityMember, entitiesNames);

      if (memberKey === 'id') {
        if (entityMember.typeName !== 'string')
          throw new Error('id key must be a string.');

        isIdMemberProvided = true;
      }

      this.include[memberKey] = entityMember.isPrimitive
        ? true
        : entities[entityMember.typeName].include;

      this.lightInclude[memberKey] = entityMember.isExcludedFromLight
        ? false
        : entityMember.isPrimitive
        ? true
        : entities[entityMember.typeName].lightInclude;
    }

    if (!isIdMemberProvided)
      throw new Error('Each entity must have an id member.');
  }
  create(newObject: any) {
    if (this.entityBlueprint.creator === undefined)
      throw new NoCreatorFunctionProvidedError(this.name);

    return this.entityBlueprint.creator(newObject);
  }
  fetch(args: { ids?: string[]; include: Include }) {
    return this.entityBlueprint.fetcher(args);
  }
  mutate(id: string, mutate: Mutate) {
    if (this.entityBlueprint.mutator === undefined)
      throw new NoMutatorFunctionProvidedError(this.name);

    return this.entityBlueprint.mutator(id, mutate);
  }
  delete(id: string) {
    if (this.entityBlueprint.deleter === undefined)
      throw new NoDeleterFunctionProvidedError(this.name);

    return this.entityBlueprint.deleter(id);
  }
  validateEntityMember(entityMember: EntityMember, entitiesNames: Set<string>) {
    if (entityMember.typeName === 'array') {
      const arrayEntityMember = entityMember as ArrayEntityMember;
      this.validateEntityMember(
        arrayEntityMember.elementEntityMember,
        entitiesNames
      );
    } else if (!entityMember.isPrimitive && !entitiesNames.has(entityMember.typeName))
      throw new Error(
        `Failed to find entity with a name ${entityMember.typeName}.`
      );
  }
  include: Include;
  lightInclude: Include;
  entityBlueprint: EntityBlueprint;
  name: string;
}

export interface EntitesObject {
  [key: string]: Entity;
}
