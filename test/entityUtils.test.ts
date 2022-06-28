import {
  validateEntity,
  createInternalEntity,
  InternalEntity,
} from '../src/entityUtils';
import { InternalEntitesObject } from '../src/entityUtils';
import * as EasyRest from '../src';

describe('Entity utils', () => {
  const createEntity = (o?: any) => {
    const result: InternalEntity = {
      name: 'empty',
      fetcher: async () => {},
      idExistenceChecker: async () => true,
      methods: {},
      members: {},
      include: {},
      lightInclude: {},
    };
    if (o) {
      for (const key in o) {
        result[key] = o[key];
      }
    }
    return result;
  };
  const entity: EasyRest.Entity = createEntity({
    name: 'car',
    members: {
      manufacturer: EasyRest.entity('manufacturer'),
      engine: EasyRest.entity('engine'),
      fuel: EasyRest.entity('fuel_type').excludeFromLight(),
      cost: EasyRest.number().excludeFromLight(),
    },
  });

  test('validating', () => {
    expect(
      validateEntity.bind(null, entity, ['manufacturer', 'engine'])
    ).toThrow(new Error('Unknown entity name fuel_type.'));
    expect(
      validateEntity.bind(null, entity, ['manufacturer', 'fuel_type'])
    ).toThrow(new Error('Unknown entity name engine.'));
    expect(
      validateEntity(entity, ['manufacturer', 'engine', 'fuel_type'])
    ).toBeUndefined();
  });

  const entitesObject: InternalEntitesObject = {
    engine: createEntity({
      include: { product_number: true, name: true, id: true },
      lightInclude: { product_number: false, name: true, id: true },
    }),
    manufacturer: createEntity({
      include: { name: true, money_amount: true, id: true },
      lightInclude: { name: true, money_amount: false, id: true },
    }),
    fuel_type: createEntity({
      include: { id: true },
      lightInclude: { id: true },
    }),
  };

  test('internal entity creating', () => {
    expect(createInternalEntity(entity, entitesObject)).toStrictEqual({
      ...entity,
      include: {
        engine: entitesObject.engine.include,
        manufacturer: entitesObject.manufacturer.include,
        fuel: entitesObject.fuel_type.include,
        cost: true,
      },
      lightInclude: {
        engine: entitesObject.engine.lightInclude,
        manufacturer: entitesObject.manufacturer.lightInclude,
        fuel: false,
        cost: false,
      },
    });
  });
});
