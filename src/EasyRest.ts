import type Entity from './Entity';
import { createInternalEntity, validateEntity } from './entityUtils';
import {
  InitialQueryHandler,
  EntityQueryHandler,
  QueryHandler,
  ApiResult,
} from './queryHandlers';
import type EntitiesData from './EntitiesData';

export default class EasyRest {
  constructor(entities: Entity[]) {
    this.entitiesData = {
      entities: {},
      entityQueryHandlers: {},
    };

    const entitesNames: string[] = entities.map((value) => value.name);

    for (const entity of entities) {
      validateEntity(entity, entitesNames);
      const internalEntity = createInternalEntity(
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
