import EasyRest from '../src';

describe('Entites validation', () => {
  test('throw an error to an entity with an id member', () => {
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
    ).toThrow('id member name is reserved.');
  });
  test('throw an error to an unknown entity type', () => {
    expect(() => {
      new EasyRest.Instance({
        entity1: {
          members: {},
          methods: {},
          fetcher: async () => null,
        },
        entity2: {
          members: {
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
          members: {},
          methods: {},
          fetcher: async () => null,
        },
        entity2: {
          members: {
            burgers: EasyRest.array(EasyRest.entity('cheeseburger')),
          },
          methods: {},
          fetcher: async () => null,
        },
      });
    }).toThrow('Failed to find entity with a name cheeseburger.');
  });
});
