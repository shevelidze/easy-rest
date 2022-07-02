import { Mutate, type Include } from './EntityData';
import type Entity from './EntityData';
import {
  NoCreatorFunctionProvidedError,
  NoMutatorFunctionProvidedError,
  NoDeleterFunctionProvidedError,
} from './errors';
import { ArrayEntityMember, EntityMember } from './entityMembers';

export default class InternalEntity {
  constructor(entity: Entity, entities: EntitesObject) {
    this.entityData = entity;
    this.include = {};
    this.lightInclude = {};

    let isIdMemberProvided = false;

    for (const memberKey in entity.members) {
      const entityMember = entity.members[memberKey];

      this.validateEntityMember(entityMember, entities);

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
    if (this.entityData.creator === undefined)
      throw new NoCreatorFunctionProvidedError(this.entityData.name);

    return this.entityData.creator(newObject);
  }
  fetch(args: { ids?: string[]; include: Include }) {
    return this.fetch(args);
  }
  mutate(id: string, mutate: Mutate) {
    if (this.entityData.mutator === undefined)
      throw new NoMutatorFunctionProvidedError(this.entityData.name);

    return this.entityData.mutator(id, mutate);
  }
  delete(id: string) {
    if (this.entityData.deleter === undefined)
      throw new NoDeleterFunctionProvidedError(this.entityData.name);

    return this.entityData.deleter(id);
  }
  validateEntityMember(entityMember: EntityMember, entities: EntitesObject) {
    if (entityMember.typeName === 'array') {
      const arrayEntityMember = entityMember as ArrayEntityMember;
      this.validateEntityMember(
        arrayEntityMember.elementEntityMember,
        entities
      );
    } else if (
      !entityMember.isPrimitive &&
      entities[entityMember.typeName] === undefined
    )
      throw new Error(
        `Failed to find entity with a name ${entityMember.typeName}.`
      );
  }
  include: Include;
  lightInclude: Include;
  entityData: Entity;
}

export interface EntitesObject {
  [key: string]: InternalEntity;
}
