import type Entity from './Entity';
import InternalEntity from './InternalEntity';
import {
  InitialQueryHandler,
  EntityQueryHandler,
  QueryHandler,
  ApiResult,
} from './queryHandlers';
import type EntitiesData from './EntitiesData';
import { MethodNotAllowedError } from './errors';

export default class EasyRest {
  constructor(entities: Entity[]) {
    this.entitiesData = {
      entities: {},
      entityQueryHandlers: {},
    };

    const entitesNames: string[] = entities.map((value) => value.name);

    for (const entity of entities) {
      const internalEntity = new InternalEntity(
        entity,
        this.entitiesData.entities
      );

      this.entitiesData.entities[entity.name] = internalEntity;

      this.entitiesData.entityQueryHandlers[entity.name] =
        new EntityQueryHandler(internalEntity, this.entitiesData);
    }

    this.intialQueryHandler = new InitialQueryHandler(this.entitiesData);
  }
  async processQuery(
    query: string[],
    httpMethod: string,
    bodyObject: any
  ): Promise<ApiResult> {
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
    if (!allowedMethods.includes(httpMethod))
      throw new MethodNotAllowedError(
        `The Api doesn\'t accept ${httpMethod}. Please, use ${allowedMethods.join(
          ', '
        )}.`
      );

    let currentQueryHandler = this.intialQueryHandler;

    while (query.length > 0) {
      let handlerResult = await currentQueryHandler.handleQueryElement(
        query,
        httpMethod,
        bodyObject
      );
      if (handlerResult instanceof ApiResult) return handlerResult;
      currentQueryHandler = handlerResult;
    }

    return new ApiResult();
  }
  addEntity(entity: Entity) {}

  intialQueryHandler: QueryHandler;
  entitiesData: EntitiesData;
}
