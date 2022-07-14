import { SchemaFormProperties, isValidSchema } from 'jtd';
import type {
  Fetcher,
  Mutator,
  Deleter,
  Creator,
  Include,
  EntityMembersDict,
} from './EntityBlueprint';
import type EntityBlueprint from './EntityBlueprint';
import { EntityMethodBlueprintsDict, EntityMethodsDict } from './EntityMethod';
import {
  NoCreatorFunctionProvidedError,
  NoMutatorFunctionProvidedError,
  NoDeleterFunctionProvidedError,
} from './errors';

function generateMethods(
  blueprints: EntityMethodBlueprintsDict
): EntityMethodsDict {
  const result: EntityMethodsDict = {};
  for (const key in blueprints) {
    const blueprint = blueprints[key];
    if (
      blueprint.argumentsJtdSchema !== undefined &&
      !isValidSchema(blueprint.argumentsJtdSchema)
    )
      throw new Error(`Invalid arguments JTD schema in the method ${key}.`);

    result[key] = {
      argumentsJtdSchema: blueprint.argumentsJtdSchema || {},
      func: blueprint.func,
    };
  }

  return result;
}

export default class Entity {
  constructor(
    name: string,
    entityBlueprint: EntityBlueprint,
    intialCreatorSchema: SchemaFormProperties,
    include: Include,
    lightInclude: Include
  ) {
    this.name = name;

    this.members = entityBlueprint.members || {};
    this.methods = generateMethods(entityBlueprint.methods || {});

    this.fetch = entityBlueprint.fetcher;
    this.create =
      entityBlueprint.creator ||
      (async () => {
        throw new NoCreatorFunctionProvidedError(name);
      });
    this.delete =
      entityBlueprint.deleter ||
      (async () => {
        throw new NoDeleterFunctionProvidedError(name);
      });
    this.mutate =
      entityBlueprint.mutator ||
      (async () => {
        throw new NoMutatorFunctionProvidedError(name);
      });

    this.include = include;
    this.lightInclude = lightInclude;

    this.creatorSchema = intialCreatorSchema;
    const {
      properties: userCreatorSchemaProperties,
      ...restUserCreatorSchema
    } = entityBlueprint.creatorSchema || {};
    Object.assign(this.creatorSchema, restUserCreatorSchema);
    Object.assign(this.creatorSchema.properties, userCreatorSchemaProperties);
  }

  name: string;

  include: Include;
  lightInclude: Include;

  fetch: Fetcher;
  create: Creator;
  mutate: Mutator;
  delete: Deleter;

  members: EntityMembersDict;
  methods: EntityMethodsDict;

  creatorSchema: SchemaFormProperties;
  mutatorSchema: SchemaFormProperties;
}

export interface EntitiesDict {
  [key: string]: Entity;
}
