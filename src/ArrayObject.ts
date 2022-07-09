import EntitiesData from './EntitiesData';
import Entity from './Entity';
import { DataModifierArgs, Include } from './EntityBlueprint';
import { ArrayEntityMember } from './entityMembers';
import EntityObject from './EntityObject';
import { IndexIsNaNError, MemeberOrMethodNotFoundError } from './errors';

export default class ArrayObject {
  constructor(
    arrayEntityMemberName: string,
    ownerEntityObject: EntityObject,
    entitiesData: EntitiesData
  ) {
    this.entityMemberName = arrayEntityMemberName;
    this.ownerEntityObject = ownerEntityObject;
    if (!this.entityMember.elementEntityMember.isPrimitive) {
      this.elementEntity =
        entitiesData.entities[this.entityMember.elementEntityMember.typeName];
    }
  }
  async fetch(
    args: { elementInclude?: Include } & DataModifierArgs
  ): Promise<any[]> {
    return this.ownerEntityObject.fetchOneMember({
      memberName: this.entityMemberName,
      memberInclude: args.elementInclude,
      auth: args.auth,
    });
  }
  getIdByIndex(index: string, auth: any): string {
    let elementIndex: number = this.parseIndex(index);
    let arrayElementsIds: any;
    arrayElementsIds = this.fetch({ elementInclude: { id: true }, auth });
    if (arrayElementsIds[elementIndex] === undefined)
      throw new MemeberOrMethodNotFoundError(
        `${this.ownerEntityObject.entity.name}.${this.entityMemberName} array`,
        index
      );
    return arrayElementsIds[elementIndex].id;
  }
  parseIndex(index: string): number {
    const indexNumber = parseInt(index);
    if (indexNumber === NaN) throw new IndexIsNaNError(index);
    return indexNumber;
  }
  get entityMember() {
    return this.ownerEntityObject.entity.entityBlueprint.members[
      this.entityMemberName
    ] as ArrayEntityMember;
  }
  get elementEntityMember() {
    return this.entityMember.elementEntityMember;
  }
  entityMemberName: string;
  ownerEntityObject: EntityObject;
  elementEntity?: Entity;
}
