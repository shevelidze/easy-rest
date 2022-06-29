import EntitiesData from '../src/EntitiesData';
import {
  InitialQueryHandler,
  EntityQueryHandler,
  EntityObjectQueryHandler,
} from '../src/queryHandlers';
import createEntity from './createEntity';
import * as EasyRest from '../src';

const entitiesData: EntitiesData = {
  entities: {
    company: createEntity({ name: 'company' }),
    building: createEntity({ name: 'building' }),
    vehicle: createEntity({ name: 'vehicle' }),
  },
  entityQueryHandlers: {},
};

for (const key in entitiesData.entities) {
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

  describe('Entity handler', () => {});
});
