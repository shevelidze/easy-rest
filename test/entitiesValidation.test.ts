import EasyRest from '../src';

describe('Entites validation', () => {
  test('throw an error to an entity with a wrong id type', () => {
    expect(
      () =>
        new EasyRest.Instance({
          entity_without_id: {
            members: {
              id: EasyRest.number(),
            },
            methods: {},
            fetcher: async () => null,
          },
        })
    ).toThrow('id key must be a string.');
  });
  test('throw an error to an unknown entity type', () => {
    expect(() => {
      new EasyRest.Instance({
        entity1: {
          members: {
            id: EasyRest.string(),
          },
          methods: {},
          fetcher: async () => null,
        },
        entity2: {
          members: {
            id: EasyRest.string(),
            hamburger: EasyRest.entity('hamburger'),
          },
          methods: {},
          fetcher: async () => null,
        },
      });
    }).toThrow('Failed to find entity with a name hamburger.');
    expect(() => {
      new EasyRest.Instance({
        entity1: {
          members: {
            id: EasyRest.string(),
          },
          methods: {},
          fetcher: async () => null,
        },
        entity2: {
          members: {
            id: EasyRest.string(),
            burgers: EasyRest.array(EasyRest.entity('cheeseburger')),
          },
          methods: {},
          fetcher: async () => null,
        },
      });
    }).toThrow('Failed to find entity with a name cheeseburger.');
  });
});
