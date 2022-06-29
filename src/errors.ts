export class EasyRestError extends Error {
  constructor(message: string, httpCode: number) {
    super(message);
    this.httpCode = httpCode;
  }

  httpCode: number;
}

export class InvalidEntityIdError extends EasyRestError {
  constructor(id: string, entityName: string) {
    super(`Failed to find object with ${id} of entity ${entityName}.`, 404);
  }
}

export class InvalidPutUsageError extends EasyRestError {
  constructor() {
    super("It's allowed to use PUT method only for creating new objects.", 405);
  }
}

export class EntitiesPrefixMissingError extends EasyRestError {
  constructor() {
    super(
      '"/entities/" prefix is missing. An each api request path must start with this prefix.',
      404
    );
  }
}

export class InvalidEntityNameError extends EasyRestError {
  constructor(entityName: string) {
    super(`Failed to find entity ${entityName}.`, 404);
  }
}

export class NoCreatorFunctionProvidedError extends EasyRestError {
  constructor(entityName: string) {
    super(
      `There is no creator function provided for the entity ${entityName}.`,
      404
    );
  }
}

export class NoMutatorFunctionProvidedError extends EasyRestError {
  constructor(entityName: string) {
    super(
      `There is no mutator function provided for the entity ${entityName}.`,
      404
    );
  }
}

export class NoDeleterFunctionProvidedError extends EasyRestError {
  constructor(entityName: string) {
    super(
      `There is no deleter function provided for the entity ${entityName}.`,
      404
    );
  }
}

export class InvalidRequestPathError extends EasyRestError {
  constructor() {
    super('Invalid request path.', 404);
  }
}

export class MemeberOrMethodNotFoundError extends EasyRestError {
  constructor(entityName: string, memberOrMethodName: string) {
    super(
      `Entity ${entityName} has not member or method member ${memberOrMethodName}.`,
      404
    );
  }
}

export class MethodNotAllowedError extends EasyRestError {
  constructor(message?: string) {
    super(message || 'Methods not allowed.', 405);
  }
}
