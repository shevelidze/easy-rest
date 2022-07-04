import { Schema } from 'jtd';
import EasyRest from '../src';

describe('Entites validation', () => {
  test('check for an id member', () => {
    expect(
      () =>
        new EasyRest.Instance({
          entity_with_id: {
            members: {
              id: EasyRest.number(),
            },
            methods: {},
            fetcher: async () => null,
          },
        })
    ).toThrow('id member name is reserved.');
  });
  test('validate entity types', () => {
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
  test('validate method schemas', () => {
    expect(() => {
      new EasyRest.Instance({
        entity: {
          fetcher: async () => null,
          members: {},
          methods: {
            super_method: {
              func: async () => null,
              argumentsJtdSchema: {
                properties: {
                  name: { type: 'string' },
                  age: { type: 'uint32' },
                  phones: {
                    elements: { type: 'string' },
                  },
                },
              },
              resultJtdSchema: {
                properties: {
                  name: { type: 'string' },
                  age: { type: 'uint32' },
                  phones: {
                    elements: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      });
    }).not.toThrow(/.*/);

    expect(() => {
      new EasyRest.Instance({
        chin: {
          fetcher: async () => null,
          members: {},
          methods: {
            super_method: {
              func: async () => null,
              argumentsJtdSchema: {
                foo: 'bar',
              } as Schema,
            },
          },
        },
      });
    }).toThrow(
      /^Invalid arguments jtd schema of the method super_method of the entity chin.$/
    );

    expect(() => {
      new EasyRest.Instance({
        cha: {
          fetcher: async () => null,
          members: {},
          methods: {
            super_method: {
              func: async () => null,
              resultJtdSchema: {
                foo: 'bar',
              } as Schema,
            },
          },
        },
      });
    }).toThrow(
      /^Invalid result jtd schema of the method super_method of the entity cha.$/
    );
  });
});
