import { isSchema, isValidSchema, Schema } from 'jtd';
import { type Mutate, type Include } from './EntityBlueprint';
import type EntityBlueprint from './EntityBlueprint';
import {
  NoCreatorFunctionProvidedError,
  NoMutatorFunctionProvidedError,
  NoDeleterFunctionProvidedError,
} from './errors';
import { ArrayEntityMember, EntityMember } from './entityMembers';
import EasyRest from '.';
import EntityMethod from './EntityMethod';

export default class Entity {
  constructor(name: string, entityBlueprint: EntityBlueprint) {
    this.entityBlueprint = entityBlueprint;
    this.name = name;
    this.include = {};
    this.lightInclude = {};
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
  validateJtdSchema(schema?: Schema) {
    return (
      schema === undefined || !(!isSchema(schema) || !isValidSchema(schema))
    );
  }
  validateEntityMethod(methodName: string, entityMethod: EntityMethod) {
    if (!this.validateJtdSchema(entityMethod.argumentsJtdSchema))
      throw new Error(
        `Invalid arguments jtd schema of the method ${methodName} of the entity ${this.name}.`
      );

    if (!this.validateJtdSchema(entityMethod.resultJtdSchema))
      throw new Error(
        `Invalid result jtd schema of the method ${methodName} of the entity ${this.name}.`
      );
  }
  initialize(entities: EntitesObject) {
    for (const methodName in this.entityBlueprint.methods) {
      this.validateEntityMethod(
        methodName,
        this.entityBlueprint.methods[methodName]
      );
    }

    if ('id' in this.entityBlueprint.members)
      throw new Error('id member name is reserved.');

    this.entityBlueprint.members.id = EasyRest.string();

    for (const memberKey in this.entityBlueprint.members) {
      let entityMember = this.entityBlueprint.members[memberKey];

      this.validateEntityMember(entityMember, entities);

      if (entityMember.typeName === 'array') {
        const arrayEntityMember = entityMember as ArrayEntityMember;

        this.include[memberKey] = arrayEntityMember.elementEntityMember
          .isPrimitive
          ? true
          : arrayEntityMember.isUsingLightElements
          ? entities[arrayEntityMember.elementEntityMember.typeName]
              .lightInclude
          : entities[arrayEntityMember.elementEntityMember.typeName].include;

        entityMember = arrayEntityMember.elementEntityMember;
      } else
        this.include[memberKey] = entityMember.isPrimitive
          ? true
          : entities[entityMember.typeName].include;

      this.lightInclude[memberKey] = entityMember.isExcludedFromLight
        ? false
        : entityMember.isPrimitive
        ? true
        : entities[entityMember.typeName].lightInclude;
    }
  }
  include: Include;
  lightInclude: Include;
  entityBlueprint: EntityBlueprint;
  name: string;
}

export interface EntitesObject {
  [key: string]: Entity;
}
