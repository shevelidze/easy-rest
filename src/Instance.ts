import type { BlueprintsDict } from './EntityBlueprint';
import {
  InitialQueryHandler,
  EntityQueryHandler,
  QueryHandler,
  ApiResult,
} from './queryHandlers';
import type EntitiesData from './EntitiesData';
import { MethodNotAllowedError, NotFoundError } from './errors';
import generateEntities from './generateEntities';

export default class Instance {
  constructor(entitiesBlueprints: BlueprintsDict) {
    this.entitiesData = {
      entities: generateEntities(entitiesBlueprints),
      entityQueryHandlers: {},
    };

    for (const entityKey in this.entitiesData.entities) {
      this.entitiesData.entityQueryHandlers[entityKey] = new EntityQueryHandler(
        this.entitiesData.entities[entityKey],
        this.entitiesData
      );
    }

    this.initialQueryHandler = new InitialQueryHandler(this.entitiesData);
  }
  async processQuery(
    query: string[],
    httpMethod: string,
    bodyObject?: any,
    authObject?: any
  ): Promise<ApiResult> {
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
    if (!allowedMethods.includes(httpMethod))
      throw new MethodNotAllowedError(
        `The Api doesn\'t accept ${httpMethod}. Please, use ${allowedMethods.join(
          ', '
        )}.`
      );

    let currentQueryHandler = this.initialQueryHandler;

    if (bodyObject === undefined) bodyObject = {};
    if (authObject === undefined) authObject = {};

    while (query.length > 0) {
      let handlerResult = await currentQueryHandler.handleQueryElement(
        query,
        httpMethod,
        bodyObject,
        authObject
      );
      if (handlerResult instanceof ApiResult) return handlerResult;
      currentQueryHandler = handlerResult;
    }

    throw new NotFoundError();
  }

  initialQueryHandler: QueryHandler;
  entitiesData: EntitiesData;
}
