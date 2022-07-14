import { SchemaFormProperties, SchemaFormType, SchemaFormValues } from 'jtd';
import EasyRest from '.';
import Entity, { type EntitiesDict } from './Entity';
import type { BlueprintsDict, Include, EntityMember } from './EntityBlueprint';
import {
  ArrayEntityMemberBlueprint,
  ComplexEntityMemberBlueprint,
  PrimitiveEntityMember,
} from './entityMembers';

export default function generateEntities(
  blueprints: BlueprintsDict
): EntitiesDict {
  const includes: { [key: string]: Include } = {};
  const lightIncludes: { [key: string]: Include } = {};
  const creatorSchemas: { [key: string]: SchemaFormProperties } = {};

  for (const entityBlueprint of Object.values(blueprints)) {
    if (entityBlueprint.members.id !== undefined)
      throw new Error('id member name is reserved.');
    entityBlueprint.members.id = EasyRest.string();
  }

  function getInclude(
    blueprintKey: string,
    light: boolean,
    calls: string[] = []
  ) {
    const internalIncludes = light ? lightIncludes : includes;
    if (internalIncludes[blueprintKey] !== undefined)
      return internalIncludes[blueprintKey];

    calls.push(blueprintKey);

    const blueprint = blueprints[blueprintKey];
    internalIncludes[blueprintKey] = {};
    const include = internalIncludes[blueprintKey];

    function getMemberArrayInclude(member: ArrayEntityMemberBlueprint) {
      return member.elementEntityMember instanceof ArrayEntityMemberBlueprint
        ? getMemberArrayInclude(member.elementEntityMember)
        : member.elementEntityMember instanceof ComplexEntityMemberBlueprint
        ? getInclude(
            member.elementEntityMember.typeName,
            member.isUsingLightElements || light
          )
        : !member.elementEntityMember.isExcludedFromLight;
    }

    for (const memberKey in blueprint.members) {
      const member = blueprint.members[memberKey];

      if (light && member.isExcludedFromLight) {
        include[memberKey] = false;
        continue;
      }

      if (member instanceof ComplexEntityMemberBlueprint) {
        if (calls.includes(member.typeName)) continue;
        include[memberKey] = getInclude(member.typeName, light, calls);
      } else if (member instanceof ArrayEntityMemberBlueprint)
        include[memberKey] = getMemberArrayInclude(member);
      else include[memberKey] = true;
    }

    calls.pop();
    return include;
  }

  function getCreatorSchema(blueprintKey: string, calls: string[] = []) {
    if (calls.includes(blueprintKey))
      throw new Error(
        `Loop in the entity: ${[...calls, blueprintKey].join('->')}.`
      );

    if (creatorSchemas[blueprintKey] !== undefined)
      return creatorSchemas[blueprintKey];

    calls.push(blueprintKey);

    const blueprint = blueprints[blueprintKey];
    creatorSchemas[blueprintKey] = { properties: {} };
    const schema = creatorSchemas[blueprintKey];

    function getMemberSchema(
      member: EntityMember
    ): SchemaFormType | SchemaFormProperties | SchemaFormValues {
      return member instanceof ComplexEntityMemberBlueprint
        ? getCreatorSchema(member.typeName, calls)
        : member instanceof ArrayEntityMemberBlueprint
        ? { values: getMemberSchema(member.elementEntityMember) }
        : member.schema;
    }

    for (const memberKey in blueprint.members) {
      const member = blueprint.members[memberKey];
      if (!member.isRequiredForCreation) continue;
      schema.properties[memberKey] = getMemberSchema(member);
    }

    calls.pop();
    return schema;
  }

  const result: EntitiesDict = {};

  function validateMemberBlueprint(
    target: ComplexEntityMemberBlueprint | ArrayEntityMemberBlueprint
  ) {
    if (
      target instanceof ComplexEntityMemberBlueprint &&
      blueprints[target.typeName] === undefined
    )
      throw new Error(`Failed to find entity with name ${target.typeName}.`);
    else if (
      target instanceof ArrayEntityMemberBlueprint &&
      !(target.elementEntityMember instanceof PrimitiveEntityMember)
    ) {
      validateMemberBlueprint(target.elementEntityMember);
    }
  }

  for (const key in blueprints) {
    const blueprint = blueprints[key];
    for (const memberKey in blueprint.members) {
      if (!(blueprint.members[memberKey] instanceof PrimitiveEntityMember))
        validateMemberBlueprint(blueprint.members[memberKey]);
    }

    result[key] = new Entity(
      key,
      blueprint,
      getCreatorSchema(key),
      getInclude(key, false),
      getInclude(key, true)
    );
  }

  return result;
}
