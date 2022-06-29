import QueryHandler, { ApiResult } from './QueryHandler';
import {
  InvalidEntityIdError,
  NoCreatorFunctionProvidedError,
} from '../errors';
import EntityObjectQueryHandler from './EntityObjectQueryHandler';
import type EntitiesData from '../EntitiesData';
import { InternalEntity } from '../entityUtils';

export default class EntityQueryHandler implements QueryHandler {
  constructor(entity: InternalEntity, entitesData: EntitiesData) {
    this.entity = entity;
    this.entitiesData = entitesData;
  }

  async handleQueryElement(query: string[], httpMethod: string, body: any) {
    query.shift();
    if (httpMethod === 'GET' && query.length === 0)
      return new ApiResult(
        200,
        await this.entity.fetcher({ include: this.entity.lightInclude })
      );
    else if (httpMethod === 'PUT' && query.length === 0) {
      if (this.entity.creator === undefined)
        throw new NoCreatorFunctionProvidedError(this.entity.name);

      await this.entity.creator(body);

      return new ApiResult(201);
    } else {
      return new EntityObjectQueryHandler(
        query[0],
        this.entity,
        this.entitiesData
      );
    }
  }

  entity: InternalEntity;
  entitiesData: EntitiesData;
}
