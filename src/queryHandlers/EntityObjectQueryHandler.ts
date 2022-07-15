import { validate } from 'jtd';
import QueryHandler, { ApiResult } from './QueryHandler';
import {
  InvalidMethodArguments,
  InvalidRequestPathError,
  MemeberOrMethodNotFoundError,
  MethodNotAllowedError,
  TryingToVariateNotVariableMemberError,
} from '../errors';
import type EntitiesData from '../EntitiesData';
import EntityObject from '../EntityObject';
import ArrayQueryHandler from './ArrayQueryHandler';
import ArrayObject from '../ArrayObject';
import {
  ArrayEntityMemberBlueprint,
  PrimitiveEntityMember,
} from '../entityMembers';

export default class EntityObjectQueryHandler implements QueryHandler {
  constructor(entityObject: EntityObject, entitiesData: EntitiesData) {
    this.entityObject = entityObject;
    this.entitiesData = entitiesData;
  }
  async handleQueryElement(
    query: string[],
    httpMethod: string,
    body: any,
    auth: any
  ) {
    query.shift();
    if (httpMethod === 'GET' && query.length === 0)
      return new ApiResult(
        200,
        await this.entityObject.fetch({
          include: this.entityObject.entity.include,
          auth,
        })
      );
    else if (httpMethod === 'POST' && query.length === 0) {
      return new ApiResult(
        200,
        await this.entityObject.mutate({ auth, mutate: body })
      );
    } else if (httpMethod === 'DELETE' && query.length === 0) {
      return new ApiResult(200, await this.entityObject.delete({ auth }));
    } else {
      if (query.length === 0) throw new InvalidRequestPathError();

      if (query[0] in this.entityObject.entity.methods) {
        if (httpMethod !== 'POST')
          throw new MethodNotAllowedError(
            'For methods calling only POST requests are being accepted.'
          );

        const method = this.entityObject.entity.methods[query[0]];

        if (
          method.argumentsJtdSchema !== undefined &&
          validate(method.argumentsJtdSchema, body).length > 0
        )
          throw new InvalidMethodArguments();

        const methodResult = await method.func({
          id: this.entityObject.id,
          body,
          auth,
        });

        return new ApiResult(200, methodResult);
      } else if (query[0] in this.entityObject.entity.members) {
        const entityMemberName = query[0];
        const entityMember = this.entityObject.entity.members[entityMemberName];

        if (entityMember instanceof ArrayEntityMemberBlueprint) {
          return new ArrayQueryHandler(
            new ArrayObject(
              entityMemberName,
              this.entityObject,
              this.entitiesData
            ),
            this.entitiesData
          );
        } else if (entityMember instanceof PrimitiveEntityMember) {
          if (query.length > 1) throw new InvalidRequestPathError();
          else if (httpMethod === 'GET') {
            return new ApiResult(200, {
              value: await this.entityObject.fetchOneMember({
                memberName: entityMemberName,
                auth,
              }),
            });
          } else if (httpMethod === 'POST') {
            if (!entityMember.isVariable)
              throw new TryingToVariateNotVariableMemberError(
                this.entityObject.entity.name,
                entityMemberName
              );

            await this.entityObject.mutate({
              mutate: body,
              auth,
            });
            return new ApiResult();
          }

          throw new MethodNotAllowedError();
        } else {
          return new EntityObjectQueryHandler(
            new EntityObject(
              (
                await this.entityObject.fetch({
                  include: {
                    [entityMemberName]: { id: true },
                  },
                  auth,
                })
              )[entityMemberName].id,
              this.entitiesData.entities[entityMember.typeName]
            ),
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
