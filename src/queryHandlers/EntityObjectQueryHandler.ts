import QueryHandler, { ApiResult } from './QueryHandler';
import { type InternalEntity } from '../entityUtils';
import {
  NoDeleterFunctionProvidedError,
  NoMutatorFunctionProvidedError,
  InvalidRequestPathError,
  MemeberOrMethodNotFoundError,
} from '../errors';
import type EntitiesData from '../EntitiesData';

export default class EntityObjectQueryHandler implements QueryHandler {
  constructor(id: string, entity: InternalEntity, entitiesData: EntitiesData) {
    this.id = id;
    this.entity = entity;
    this.entitiesData = entitiesData;
  }
  async handleQueryElement(query: string[], httpMethod: string, body: any) {
    query.shift();
    if (httpMethod === 'GET' && query.length === 0)
      return {
        code: 200,
        body: this.entity.fetcher({
          ids: [this.id],
          include: this.entity.include,
        }),
      };
    else if (httpMethod === 'POST' && query.length === 0) {
      if (this.entity.mutator === undefined)
        throw new NoMutatorFunctionProvidedError(this.entity.name);

      await this.entity.mutator(this.id, body);

      return new ApiResult();
    } else if (httpMethod === 'DELETE' && query.length === 0) {
      if (this.entity.deleter === undefined)
        throw new NoDeleterFunctionProvidedError(this.entity.name);

      await this.entity.deleter(this.id);

      return new ApiResult();
    } else {
      if (query.length === 0) throw new InvalidRequestPathError();

      if (query[0] in this.entity.methods) {
        return new ApiResult(200, this.entity.methods[query[0]].func(body));
      } else if (query[0] in this.entity.members) {
        const entityMemberName = query[0];
        const entityMember = this.entity.members[entityMemberName];

        if (entityMember.isPrimitive) {
          return new ApiResult(
            200,
            this.entity.fetcher({
              ids: [this.id],
              include: { [entityMemberName]: true },
            })
          );
        } else {
          return new EntityObjectQueryHandler(
            (
              await this.entity.fetcher({
                ids: [this.id],
                include: { [entityMemberName]: { id: true } },
              })
            )[entityMemberName].id,
            this.entitiesData.entities[entityMember.typeName],
            this.entitiesData
          );
        }
      }

      throw new MemeberOrMethodNotFoundError(this.entity.name, query[0]);
    }
  }

  id: string;
  entity: InternalEntity;
  entitiesData: EntitiesData;
}
