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
        this.entity.fetcher({ ids: [], include: this.entity.include })
      );
    else if (httpMethod === 'PUT' && query.length === 0) {
      if (this.entity.creator === undefined)
        throw new NoCreatorFunctionProvidedError(this.entity.name);

      await this.entity.creator(body);

      return new ApiResult(201);
    } else {
      if (!this.entity.idExistenceChecker(query[0]))
        throw new InvalidEntityIdError(query[0], this.entity.name);

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
