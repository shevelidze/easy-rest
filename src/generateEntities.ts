import { SchemaFormProperties, SchemaFormType, SchemaFormValues } from 'jtd';
import EasyRest from '.';
import Entity, { type EntitiesDict } from './Entity';
import type { BlueprintsDict, Include, EntityMember } from './EntityBlueprint';
import {
  ArrayEntityMemberBlueprint,
  ComplexEntityMemberBlueprint,
  PrimitiveEntityMember,
} from './entityMembers';

export default function generateEntities(blueprints: BlueprintsDict): EntitiesDict {
  const creatorSchemas: { [key: string]: SchemaFormProperties } = {};

  for (const entityBlueprint of Object.values(blueprints)) {
    if (entityBlueprint.members === undefined) continue;

    if (entityBlueprint.members.id !== undefined)
      throw new Error('id member name is reserved.');
    entityBlueprint.members.id = EasyRest.string();
  }

  function getInclude(
    blueprintKey: string,
    light: boolean,
    calls: string[] = []
  ) {
    calls.push(blueprintKey);

    const blueprint = blueprints[blueprintKey];
    const include = {};

    function getMemberArrayInclude(member: ArrayEntityMemberBlueprint) {
      if (member.elementEntityMember instanceof ArrayEntityMemberBlueprint)
        return getMemberArrayInclude(member.elementEntityMember);

      if (member.elementEntityMember instanceof ComplexEntityMemberBlueprint) {
        if (calls.includes(member.elementEntityMember.typeName)) return;
        return getInclude(
          member.elementEntityMember.typeName,
          member.isUsingLightElements || light,
          calls
        );
      }

      return !(member.elementEntityMember.isExcludedFromLight && light);
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
      } else if (member instanceof ArrayEntityMemberBlueprint) {
        const arrayInclude = getMemberArrayInclude(member);
        if (arrayInclude !== undefined) include[memberKey] = arrayInclude;
      } else include[memberKey] = true;
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
      if (!(blueprint.members[memberKey] instanceof PrimitiveEntityMember)) {
        validateMemberBlueprint(blueprint.members[memberKey]);
      }
    }
  }

  function getMutatorSchema(blueprintKey: string) {
    const schema: SchemaFormProperties = { optionalProperties: {} };

    function getMemberSchema(target: EntityMember) {
      if (target instanceof ArrayEntityMemberBlueprint) {
        const schema: SchemaFormValues = {
          values: getMemberSchema(target.elementEntityMember),
        };
        return schema;
      } else if (target instanceof ComplexEntityMemberBlueprint)
        return getCreatorSchema(target.typeName);
      else return target.schema;
    }

    const blueprint = blueprints[blueprintKey];

    for (const key in blueprint.members) {
      const member = blueprint.members[key];
      if (!member.isVariable) continue;
      schema.optionalProperties[key] = getMemberSchema(member);
    }

    return schema;
  }

  for (const key in blueprints) {
    result[key] = new Entity(
      key,
      blueprints[key],
      getCreatorSchema(key),
      getMutatorSchema(key),
      getInclude(key, false),
      getInclude(key, true)
    );
  }

  return result;
}
