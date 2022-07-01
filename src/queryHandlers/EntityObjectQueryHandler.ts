import QueryHandler, { ApiResult } from './QueryHandler';
import { type InternalEntity } from '../entityUtils';
import {
  NoDeleterFunctionProvidedError,
  NoMutatorFunctionProvidedError,
  InvalidRequestPathError,
  MemeberOrMethodNotFoundError,
  MethodNotAllowedError,
} from '../errors';
import type EntitiesData from '../EntitiesData';
import type EntityObject from '../EntityObject';

export default class EntityObjectQueryHandler implements QueryHandler {
  constructor(entityObject: EntityObject, entitiesData: EntitiesData) {
    this.entityObject = entityObject;
    this.entitiesData = entitiesData;
  }
  async handleQueryElement(query: string[], httpMethod: string, body: any) {
    query.shift();
    if (httpMethod === 'GET' && query.length === 0)
      return {
        code: 200,
        body: this.entityObject.entity.fetcher({
          ids: [this.entityObject.id],
          include: this.entityObject.entity.include,
        }),
      };
    else if (httpMethod === 'POST' && query.length === 0) {
      if (this.entityObject.entity.mutator === undefined)
        throw new NoMutatorFunctionProvidedError(this.entityObject.entity.name);

      await this.entityObject.entity.mutator(this.entityObject.id, body);

      return new ApiResult();
    } else if (httpMethod === 'DELETE' && query.length === 0) {
      if (this.entityObject.entity.deleter === undefined)
        throw new NoDeleterFunctionProvidedError(this.entityObject.entity.name);

      await this.entityObject.entity.deleter(this.entityObject.id);

      return new ApiResult();
    } else {
      if (query.length === 0) throw new InvalidRequestPathError();

      if (query[0] in this.entityObject.entity.methods) {
        if (httpMethod !== 'POST')
          throw new MethodNotAllowedError(
            'For methods calling only POST requests are being accepted.'
          );

        return new ApiResult(
          200,
          this.entityObject.entity.methods[query[0]].func(
            this.entityObject.id,
            body
          )
        );
      } else if (query[0] in this.entityObject.entity.members) {
        const entityMemberName = query[0];
        const entityMember = this.entityObject.entity.members[entityMemberName];

        if (entityMember.isPrimitive) {
          if (query.length > 1) throw new InvalidRequestPathError();
          else if (httpMethod !== 'GET') throw new MethodNotAllowedError();

          return new ApiResult(
            200,
            this.entityObject.entity.fetcher({
              ids: [this.entityObject.id],
              include: { [entityMemberName]: true },
            })
          );
        } else {
          return new EntityObjectQueryHandler(
            {
              id: (
                await this.entityObject.entity.fetcher({
                  ids: [this.entityObject.id],
                  include: { [entityMemberName]: { id: true } },
                })
              )[entityMemberName].id,
              entity: this.entitiesData.entities[entityMember.typeName],
            },
            this.entitiesData
          );
        }
      }

      throw new MemeberOrMethodNotFoundError(
        this.entityObject.entity.name,
        query[0]
      );
    }
  }

  entityObject: EntityObject;
  entitiesData: EntitiesData;
}
