import type EntityBlueprint from './EntityBlueprint';
import Entity from './Entity';
import {
  InitialQueryHandler,
  EntityQueryHandler,
  QueryHandler,
  ApiResult,
} from './queryHandlers';
import type EntitiesData from './EntitiesData';
import { MethodNotAllowedError, NotFoundError } from './errors';

export default class Instance {
  constructor(entitiesBlueprints: { [key: string]: EntityBlueprint }) {
    this.entitiesData = {
      entities: {},
      entityQueryHandlers: {},
    };

    for (const entityName in entitiesBlueprints) {
      const entity = new Entity(entityName, entitiesBlueprints[entityName]);

      this.entitiesData.entities[entityName] = entity;

      this.entitiesData.entityQueryHandlers[entityName] =
        new EntityQueryHandler(entity, this.entitiesData);
    }

    for (const entityName in entitiesBlueprints) {
      this.entitiesData.entities[entityName].initialize(
        this.entitiesData.entities
      );
    }

    this.initialQueryHandler = new InitialQueryHandler(this.entitiesData);
  }
  async processQuery(
    query: string[],
    httpMethod: string,
    bodyObject?: any
  ): Promise<ApiResult> {
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
    if (!allowedMethods.includes(httpMethod))
      throw new MethodNotAllowedError(
        `The Api doesn\'t accept ${httpMethod}. Please, use ${allowedMethods.join(
          ', '
        )}.`
      );

    let currentQueryHandler = this.initialQueryHandler;

    while (query.length > 0) {
      let handlerResult = await currentQueryHandler.handleQueryElement(
        query,
        httpMethod,
        bodyObject
      );
      if (handlerResult instanceof ApiResult) return handlerResult;
      currentQueryHandler = handlerResult;
    }

    throw new NotFoundError();
  }

  initialQueryHandler: QueryHandler;
  entitiesData: EntitiesData;
}
