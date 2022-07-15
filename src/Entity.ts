import { SchemaFormProperties, isValidSchema, validate } from 'jtd';
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
  InvalidCreatorArguments,
  InvalidMutatorArguments,
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

function assignSchema(
  target: SchemaFormProperties,
  source: SchemaFormProperties
) {
  const { properties: sourceProperties, ...restSource } = source || {};
  Object.assign(target, restSource);
  if (sourceProperties !== undefined) {
    if (target.properties === undefined) target.properties = {};
    Object.assign(target.properties, sourceProperties);
  }
}

export default class Entity {
  constructor(
    name: string,
    entityBlueprint: EntityBlueprint,
    intialCreatorSchema: SchemaFormProperties,
    initialMutatorSchema: SchemaFormProperties,
    include: Include,
    lightInclude: Include
  ) {
    this.name = name;

    this.members = entityBlueprint.members || {};
    this.methods = generateMethods(entityBlueprint.methods || {});

    this.fetch = entityBlueprint.fetcher;
    this.create =
      entityBlueprint.creator !== undefined
        ? (args) => {
            if (validate(this.creatorSchema, args.newObject).length > 0)
              throw new InvalidCreatorArguments();

            return entityBlueprint.creator(args);
          }
        : async () => {
            throw new NoCreatorFunctionProvidedError(name);
          };
    this.delete =
      entityBlueprint.deleter ||
      (async () => {
        throw new NoDeleterFunctionProvidedError(name);
      });
    this.mutate =
      entityBlueprint.mutator !== undefined
        ? (args) => {
            if (validate(this.mutatorSchema, args.mutate).length > 0)
              throw new InvalidMutatorArguments();

            return entityBlueprint.mutator(args);
          }
        : async () => {
            throw new NoMutatorFunctionProvidedError(name);
          };

    this.include = include;
    this.lightInclude = lightInclude;

    this.creatorSchema = intialCreatorSchema;
    assignSchema(this.creatorSchema, entityBlueprint.creatorSchema);

    this.mutatorSchema = initialMutatorSchema;
    assignSchema(this.mutatorSchema, entityBlueprint.mutatorSchema);
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
