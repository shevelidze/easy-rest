import { type Include } from './Entity';
import type Entity from './Entity';

export interface InternalEntity extends Entity {
  include: Include;
  lightInclude: Include;
}

export interface InternalEntitesObject {
  [key: string]: InternalEntity;
}

export function validateEntity(entity: Entity, entitiesNames: string[]) {
  for (const memberKey in entity.members) {
    const entityMember = entity.members[memberKey];

    if (
      entityMember.isPrimitive &&
      entityMember.typeName !== 'string' &&
      entityMember.typeName !== 'number'
    )
      throw new Error(`Unknown primitive type ${entityMember.typeName}.`);
    else if (
      !entityMember.isPrimitive &&
      !entitiesNames.includes(entityMember.typeName)
    )
      throw new Error(`Unknown entity name ${entityMember.typeName}.`);
  }
}

export function createInternalEntity(
  entity: Entity,
  entities: InternalEntitesObject
): InternalEntity {
  const result: InternalEntity = {
    ...entity,
    include: {},
    lightInclude: {},
  };

  for (const memberKey in entity.members) {
    const entityMember = entity.members[memberKey];

    if (entityMember.isPrimitive && entityMember.typeName)
      result.include[memberKey] = entityMember.isPrimitive
        ? true
        : entities[entityMember.typeName].include;

    result.lightInclude[memberKey] = entityMember.isExcludedFromLight
      ? false
      : entityMember.isPrimitive
      ? true
      : entities[entityMember.typeName].lightInclude;
  }

  return result;
}
