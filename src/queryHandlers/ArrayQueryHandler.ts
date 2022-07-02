import ArrayObject from '../ArrayObject';
import type QueryHandler from './QueryHandler';
import { ApiResult } from './QueryHandler';
import EntitiesData from '../EntitiesData';
import { NotFoundError } from '../errors';
import EntityObjectQueryHandler from './EntityObjectQueryHandler';
import EntityObject from '../EntityObject';

export default class ArrayQueryHandler implements QueryHandler {
  constructor(arrayObject: ArrayObject, entitesData: EntitiesData) {
    arrayObject = arrayObject;
    entitesData = entitesData;
  }
  async handleQueryElement(query: string[], httpMethod: string, body: any) {
    query.shift();
    if (httpMethod === 'GET' && query.length === 0) {
      return new ApiResult(200, {
        value: this.arrayObject.fetch(),
      });
    } else if (
      httpMethod === 'GET' &&
      this.arrayObject.elementEntityMember.isPrimitive &&
      query.length === 1
    ) {
      const indexNumber = this.arrayObject.parseIndex(query[0]);
      return new ApiResult(200, this.arrayObject.fetch()[indexNumber]);
    } else if (
      !this.arrayObject.elementEntityMember.isPrimitive &&
      query.length > 0
    ) {
      return new EntityObjectQueryHandler(
        new EntityObject(
          this.arrayObject.getIdByIndex(query[0]),
          this.arrayObject.elementEntity
        ),
        this.entitiesData
      );
    } else if (
      httpMethod === 'PUT' &&
      this.arrayObject.elementEntityMember.isPrimitive &&
      query.length === 0
    ) {
      if (!this.arrayObject.entityMember.isVariable) {
      }
      const newArray = this.arrayObject.fetch();
      newArray.push(body.value);
      this.arrayObject.ownerEntityObject.mutate({
        [this.arrayObject.entityMemberName]: newArray,
      });
    } else if (
      httpMethod === 'DELETE' &&
      this.arrayObject.elementEntityMember.isPrimitive &&
      query.length === 1
    ) {
      const indexNumber = this.arrayObject.parseIndex(query[0]);
      const newArray = this.arrayObject.fetch();
      newArray.splice(indexNumber, 1);
      this.arrayObject.ownerEntityObject.mutate({
        [this.arrayObject.entityMemberName]: newArray,
      });
    }
    throw new NotFoundError();
  }

  arrayObject: ArrayObject;
  entitiesData: EntitiesData;
}
