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
    }).toThrow('Failed to find entity with name hamburger.');
    expect(() => {
      new EasyRest.Instance({
        entity1: {
          members: {
            a: EasyRest.entity('entity2'),
          },
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
    }).toThrow('Failed to find entity with name cheeseburger.');
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
            },
          },
        },
      });
    }).not.toThrow(/.*/);
  });
});
