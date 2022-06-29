import EntitiesData from '../src/EntitiesData';
import {
  InitialQueryHandler,
  EntityQueryHandler,
  EntityObjectQueryHandler,
  ApiResult,
} from '../src/queryHandlers';
import createEntity from './createEntity';
import * as EasyRest from '../src';
import { createInternalEntity } from '../src/entityUtils';

const entitiesData: EntitiesData = {
  entities: {
    company: createEntity({
      name: 'company',
      members: {
        id: EasyRest.number(),
        name: EasyRest.string().excludeFromLight(),
      },
    }),
    building: createEntity({
      name: 'building',
      members: {
        id: EasyRest.string(),
      },
    }),
    vehicle: createEntity({ name: 'vehicle' }),
  },
  entityQueryHandlers: {},
};

for (const key in entitiesData.entities) {
  entitiesData.entities[key] = createInternalEntity(
    entitiesData.entities[key],
    entitiesData.entities
  );
  entitiesData.entityQueryHandlers[key] = new EntityQueryHandler(
    entitiesData.entities[key],
    entitiesData
  );
}

const intialHandler = new InitialQueryHandler(entitiesData);

describe('Query handlers', () => {
  describe('Initial handler', () => {
    test('reject query without prefix', async () => {
      await expect(
        intialHandler.handleQueryElement(['companty', '123', 'building'])
      ).rejects.toBeInstanceOf(EasyRest.errors.EntitiesPrefixMissingError);
    });
    test('reject empty query', async () => {
      await expect(intialHandler.handleQueryElement([])).rejects.toBeInstanceOf(
        EasyRest.errors.InvalidRequestPathError
      );
    });
    test.each([
      [['entities', 'animal', '123', 'leg']],
      [['entities', 'flat', '123']],
    ])('reject query with a wrong entity. Query: %s', async (query) => {
      await expect(
        intialHandler.handleQueryElement(query)
      ).rejects.toBeInstanceOf(EasyRest.errors.InvalidEntityNameError);
    });
    test.each([
      [
        ['entities', 'company', '123', 'vehicle'],
        entitiesData.entityQueryHandlers.company,
      ],
      [
        ['entities', 'building', '42', 'rooms'],
        entitiesData.entityQueryHandlers.building,
      ],
      [['entities', 'vehicle', '1'], entitiesData.entityQueryHandlers.vehicle],
    ])('return a valid entity handler. Query: %s', async (query, handler) => {
      await expect(intialHandler.handleQueryElement(query)).resolves.toBe(
        handler
      );
    });
  });

  describe('Entity handler', () => {
    test('throw error on no creator provided', async () => {
      const entityHandler = new EntityQueryHandler(
        entitiesData.entities.company,
        entitiesData
      );
      await expect(
        entityHandler.handleQueryElement([], 'PUT', {})
      ).rejects.toBeInstanceOf(EasyRest.errors.NoCreatorFunctionProvidedError);
    });
    test('get all objects', async () => {
      const fetcherMock = jest.fn(async ({ ids, include }) => 'fetch result');
      entitiesData.entities.company.fetcher = fetcherMock;
      const entityHandler = new EntityQueryHandler(
        entitiesData.entities.company,
        entitiesData
      );
      await expect(
        entityHandler.handleQueryElement([], 'GET', {})
      ).resolves.toStrictEqual(new ApiResult(200, 'fetch result'));
      expect(fetcherMock.mock.lastCall[0]).toEqual({
        include: entitiesData.entities.company.lightInclude,
      });
    });

    test('create object', async () => {
      const creatorMock = jest.fn();
      entitiesData.entities.building.creator = creatorMock;
      const entityHandler = new EntityQueryHandler(
        entitiesData.entities.building,
        entitiesData
      );
      const creatorArg = { id: 'building1234' };
      await expect(entityHandler.handleQueryElement([], 'PUT', creatorArg));
      expect(creatorMock.mock.lastCall[0]).toBe(creatorArg);
    });
  });
  describe('Entity object handler', () => {
    test('throw error on no mutator provided', async () => {
      const entityObjectHandler = new EntityObjectQueryHandler(
        '123',
        entitiesData.entities.company,
        entitiesData
      );
      await expect(
        entityObjectHandler.handleQueryElement([], 'POST', {})
      ).rejects.toBeInstanceOf(EasyRest.errors.NoMutatorFunctionProvidedError);
    });
  });
});
