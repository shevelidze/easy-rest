import QueryHandler, { ApiResult } from './QueryHandler';
import {
  InvalidEntityIdError,
  NoCreatorFunctionProvidedError,
} from '../errors';
import EntityObjectQueryHandler from './EntityObjectQueryHandler';
import type EntitiesData from '../EntitiesData';
import InternalEntity from '../InternalEntity';
import EntityObject from '../EntityObject';

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
        await this.entity.fetch({ include: this.entity.lightInclude })
      );
    else if (httpMethod === 'PUT' && query.length === 0) {
      await this.entity.create(body);

      return new ApiResult(201);
    } else {
      return new EntityObjectQueryHandler(
        new EntityObject(query[0], this.entity),
        this.entitiesData
      );
    }
  }

  entity: InternalEntity;
  entitiesData: EntitiesData;
}
