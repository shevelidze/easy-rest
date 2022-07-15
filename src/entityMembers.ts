import { type SchemaFormType } from 'jtd';

class EntityMember {
  constructor(typeName: string) {
    this.typeName = typeName;
  }

  excludedFromLight(): EntityMember {
    this.isExcludedFromLight = true;
    return this;
  }

  requiredForCreation(): EntityMember {
    this.isRequiredForCreation = true;
    return this;
  }
  variable(): EntityMember {
    this.isVariable = true;
    return this;
  }

  isExcludedFromLight: boolean = false;
  isRequiredForCreation: boolean = false;
  isVariable: boolean = false;
  typeName: string;
}

export class PrimitiveEntityMember extends EntityMember {
  constructor(typeName, schema: SchemaFormType) {
    super(typeName);
    this.schema = schema;
  }
  schema: SchemaFormType;
}

export class ComplexEntityMemberBlueprint extends EntityMember {
  constructor(typeName: string) {
    super(typeName);
  }
}

export class ArrayEntityMemberBlueprint extends EntityMember {
  constructor(
    elementEntityMember:
      | PrimitiveEntityMember
      | ComplexEntityMemberBlueprint
      | ArrayEntityMemberBlueprint
  ) {
    super('array');
    this.elementEntityMember = elementEntityMember;
    this.isExcludedFromLight = elementEntityMember.isExcludedFromLight;
  }
  lightElements(): ArrayEntityMemberBlueprint {
    this.isUsingLightElements = true;
    return this;
  }
  elementEntityMember:
    | PrimitiveEntityMember
    | ComplexEntityMemberBlueprint
    | ArrayEntityMemberBlueprint;
  isUsingLightElements: boolean = false;
}

export function string(): PrimitiveEntityMember {
  return new PrimitiveEntityMember('string', { type: 'string' });
}

export function number(): PrimitiveEntityMember {
  return new PrimitiveEntityMember('number', { type: 'int32' });
}

export function boolean(): PrimitiveEntityMember {
  return new PrimitiveEntityMember('boolean', { type: 'boolean' });
}

export function array(
  elementEntityMember: EntityMember
): ArrayEntityMemberBlueprint {
  return new ArrayEntityMemberBlueprint(elementEntityMember);
}

export function entity(entityName: string): ComplexEntityMemberBlueprint {
  return new ComplexEntityMemberBlueprint(entityName);
}
