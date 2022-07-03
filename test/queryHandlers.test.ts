import {
  EntityQueryHandler,
  EntityObjectQueryHandler,
  ApiResult,
} from '../src/queryHandlers';
import EasyRest from '../src/';
import EntityObject from '../src/EntityObject';

const easyRest = new EasyRest.Instance({
  company: {
    members: {
      name: EasyRest.string().excludeFromLight(),
    },
    fetcher: async () => {},
    methods: {},
  },
  building: {
    members: {},
    fetcher: async () => {},
    methods: {},
  },
  vehicle: {
    members: {},
    fetcher: async () => {},
    methods: {},
  },
});

describe('Query handlers', () => {
  describe('Initial handler', () => {
    test('reject query without prefix', async () => {
      await expect(
        easyRest.initialQueryHandler.handleQueryElement(
          ['companty', '123', 'building'],
          'GET'
        )
      ).rejects.toBeInstanceOf(EasyRest.errors.EntitiesPrefixMissingError);
    });
    test('reject empty query', async () => {
      await expect(
        easyRest.initialQueryHandler.handleQueryElement([], 'GET')
      ).rejects.toBeInstanceOf(EasyRest.errors.InvalidRequestPathError);
    });
    test.each([
      [['entities', 'animal', '123', 'leg']],
      [['entities', 'flat', '123']],
    ])('reject query with a wrong entity. Query: %s', async (query) => {
      await expect(
        easyRest.initialQueryHandler.handleQueryElement(query, 'GET')
      ).rejects.toBeInstanceOf(EasyRest.errors.InvalidEntityNameError);
    });
    test.each([
      [
        ['entities', 'company', '123', 'vehicle'],
        easyRest.entitiesData.entityQueryHandlers.company,
      ],
      [
        ['entities', 'building', '42', 'rooms'],
        easyRest.entitiesData.entityQueryHandlers.building,
      ],
      [
        ['entities', 'vehicle', '1'],
        easyRest.entitiesData.entityQueryHandlers.vehicle,
      ],
    ])('return a valid entity handler. Query: %s', async (query, handler) => {
      await expect(
        easyRest.initialQueryHandler.handleQueryElement(query, 'GET')
      ).resolves.toBe(handler);
    });
  });

  describe('Entity handler', () => {
    test('throw error on no creator provided', async () => {
      const entityHandler = new EntityQueryHandler(
        easyRest.entitiesData.entities.company,
        easyRest.entitiesData
      );
      await expect(
        entityHandler.handleQueryElement([], 'PUT', {})
      ).rejects.toBeInstanceOf(EasyRest.errors.NoCreatorFunctionProvidedError);
    });
    test('get all objects', async () => {
      const fetcherMock = jest.fn(async ({ ids, include }) => 'fetch result');
      easyRest.entitiesData.entities.company.entityBlueprint.fetcher =
        fetcherMock;
      const entityHandler = new EntityQueryHandler(
        easyRest.entitiesData.entities.company,
        easyRest.entitiesData
      );
      await expect(
        entityHandler.handleQueryElement([], 'GET', {})
      ).resolves.toStrictEqual(new ApiResult(200, 'fetch result'));
      expect(fetcherMock.mock.lastCall[0]).toEqual({
        include: easyRest.entitiesData.entities.company.lightInclude,
      });
    });

    test('create object', async () => {
      const creatorMock = jest.fn();
      easyRest.entitiesData.entities.building.entityBlueprint.creator =
        creatorMock;
      const entityHandler = new EntityQueryHandler(
        easyRest.entitiesData.entities.building,
        easyRest.entitiesData
      );
      const creatorArg = { id: 'building1234' };
      await expect(entityHandler.handleQueryElement([], 'PUT', creatorArg));
      expect(creatorMock.mock.lastCall[0]).toBe(creatorArg);
    });
  });
  describe('Entity object handler', () => {
    test('throw error on no mutator provided', async () => {
      const entityObjectHandler = new EntityObjectQueryHandler(
        new EntityObject('123', easyRest.entitiesData.entities.company),
        easyRest.entitiesData
      );
      await expect(
        entityObjectHandler.handleQueryElement([], 'POST', {})
      ).rejects.toBeInstanceOf(EasyRest.errors.NoMutatorFunctionProvidedError);
    });
  });
});
