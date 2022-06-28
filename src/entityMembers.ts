export class EntityMember {
  constructor(typeName: string, isPrimitive: boolean) {
    this.typeName = typeName;
    this.isPrimitive = isPrimitive;
  }

  excludeFromLight(): EntityMember {
    this.isExcludedFromLight = true;
    return this;
  }
  allowVariation(): EntityMember {
    this.isVariable = true;
    return this;
  }

  isExcludedFromLight: boolean = false;
  isVariable: boolean = false;
  typeName: string;
  isPrimitive: boolean;
}

export function string(): EntityMember {
  return new EntityMember('string', true);
}

export function number(): EntityMember {
  return new EntityMember('number', true);
}

export function array(): EntityMember {
  return new EntityMember('array', false);
}

export function entity(entityName: string) {
  return new EntityMember(entityName, false);
}
