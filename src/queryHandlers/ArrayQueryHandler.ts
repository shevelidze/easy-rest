import ArrayObject from '../ArrayObject';
import type QueryHandler from './QueryHandler';
import { ApiResult } from './QueryHandler';
import EntitiesData from '../EntitiesData';
import {
  NotFoundError,
  TryingToVariateNotVariableMemberError,
  MemeberOrMethodNotFoundError,
} from '../errors';
import EntityObjectQueryHandler from './EntityObjectQueryHandler';
import EntityObject from '../EntityObject';

export default class ArrayQueryHandler implements QueryHandler {
  constructor(arrayObject: ArrayObject, entitesData: EntitiesData) {
    arrayObject = arrayObject;
    entitesData = entitesData;
  }
  async handleQueryElement(
    query: string[],
    httpMethod: string,
    body: any,
    auth: any
  ) {
    query.shift();
    if (httpMethod === 'GET' && query.length === 0) {
      return new ApiResult(200, {
        value: await this.arrayObject.fetch({ auth }),
      });
    } else if (
      httpMethod === 'GET' &&
      this.arrayObject.elementEntityMember.isPrimitive &&
      query.length === 1
    ) {
      const indexNumber = this.arrayObject.parseIndex(query[0]);
      return new ApiResult(
        200,
        (await this.arrayObject.fetch({ auth }))[indexNumber]
      );
    } else if (
      !this.arrayObject.elementEntityMember.isPrimitive &&
      query.length > 0
    ) {
      return new EntityObjectQueryHandler(
        new EntityObject(
          this.arrayObject.getIdByIndex(query[0], auth),
          this.arrayObject.elementEntity
        ),
        this.entitiesData
      );
    } else if (
      (httpMethod === 'DELETE' || httpMethod === 'PUT') &&
      this.arrayObject.elementEntityMember.isPrimitive &&
      query.length === 1
    ) {
      if (!this.arrayObject.entityMember.isVariable)
        throw new TryingToVariateNotVariableMemberError(
          this.arrayObject.ownerEntityObject.entity.name,
          this.arrayObject.entityMemberName
        );

      const indexNumber = this.arrayObject.parseIndex(query[0]);
      const newArray = await this.arrayObject.fetch({ auth });

      if (httpMethod === 'DELETE') {
        const deletedElements = newArray.splice(indexNumber, 1);
        if (deletedElements.length === 0)
          throw new MemeberOrMethodNotFoundError(
            `${this.arrayObject.ownerEntityObject.entity.name}.${this.arrayObject.entityMemberName} array`,
            query[0]
          );

        await this.arrayObject.ownerEntityObject.mutate({
          auth,
          mutate: {
            [this.arrayObject.entityMemberName]: newArray,
          },
        });
      } else {
        newArray.push(body.value);
        await this.arrayObject.ownerEntityObject.mutate({
          auth,
          mutate: {
            [this.arrayObject.entityMemberName]: newArray,
          },
        });
      }

      return new ApiResult();
    }
    throw new NotFoundError();
  }

  arrayObject: ArrayObject;
  entitiesData: EntitiesData;
}
