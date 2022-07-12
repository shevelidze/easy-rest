export class EntityMember {
  constructor(typeName: string, isPrimitive: boolean) {
    this.typeName = typeName;
    this.isPrimitive = isPrimitive;
  }

  excludeFromLight(): EntityMember {
    this.isExcludedFromLight = true;
    return this;
  }

  isExcludedFromLight: boolean = false;
  isVariable: boolean = false;
  typeName: string;
  isPrimitive: boolean;
}

export class PrimitiveEntityMember extends EntityMember {
  constructor(typeName: 'string' | 'number' | 'array' | 'boolean') {
    super(typeName, true);
  }
  allowVariation(): EntityMember {
    this.isVariable = true;
    return this;
  }
}

export class EntityEntityMember extends EntityMember {
  constructor(typeName: string) {
    super(typeName, false);
  }
}

export class ArrayEntityMember extends PrimitiveEntityMember {
  constructor(elementEntityMember: EntityMember) {
    super('array');
    this.elementEntityMember = elementEntityMember;
    this.isExcludedFromLight = elementEntityMember.isExcludedFromLight;
  }
  useLightElements(): ArrayEntityMember {
    this.isUsingLightElements = true;
    return this;
  }
  elementEntityMember: EntityMember;
  isUsingLightElements: boolean = false;
}

export function string(): PrimitiveEntityMember {
  return new PrimitiveEntityMember('string');
}

export function number(): PrimitiveEntityMember {
  return new PrimitiveEntityMember('number');
}

export function boolean(): PrimitiveEntityMember {
  return new PrimitiveEntityMember('number');
}

export function array(elementEntityMember: EntityMember): ArrayEntityMember {
  return new ArrayEntityMember(elementEntityMember);
}

export function entity(entityName: string): EntityEntityMember {
  return new EntityEntityMember(entityName);
}
