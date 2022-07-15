import EasyRest from '../../src';
import { SchemaFormProperties } from 'jtd';

describe('Instance constructor', () => {
  test('recognize a creation schema loop', () => {
    expect(() => {
      new EasyRest.Instance({
        user: {
          fetcher: async () => {},
          members: {
            name: EasyRest.string().requiredForCreation(),
            account: EasyRest.entity('account').requiredForCreation(),
          },
        },
        account: {
          fetcher: async () => {},
          members: {
            username: EasyRest.string().requiredForCreation(),
            user: EasyRest.entity('user').requiredForCreation(),
          },
        },
      });
    }).toThrow(/Loop in the entity: user->account->user\./);
  });

  test('build correct creator schema', () => {
    const instance = new EasyRest.Instance({
      user: {
        fetcher: async () => {},
        members: {
          name: EasyRest.string().requiredForCreation(),
          account: EasyRest.entity('account'),
        },
      },
      account: {
        fetcher: async () => {},
        members: {
          username: EasyRest.string().requiredForCreation(),
          user: EasyRest.entity('user').requiredForCreation(),
        },
      },
    });

    expect(instance.entitiesData.entities.user.creatorSchema).toStrictEqual({
      properties: {
        name: {
          type: 'string',
        },
      },
    });
    expect(instance.entitiesData.entities.account.creatorSchema).toStrictEqual({
      properties: {
        username: {
          type: 'string',
        },
        user: {
          properties: {
            name: {
              type: 'string',
            },
          },
        },
      },
    });
  });

  test('merge creator schema', () => {
    const instance = new EasyRest.Instance({
      train: {
        fetcher: async () => {},
        members: {
          name: EasyRest.string().requiredForCreation(),
        },
        creatorSchema: {
          additionalProperties: true,
          optionalProperties: {
            a: {
              type: 'string',
            },
          },
          properties: {
            model_id: {
              type: 'string',
            },
          },
        },
      },
    });

    expect(
      instance.entitiesData.entities.train.creatorSchema
    ).toStrictEqual<SchemaFormProperties>({
      additionalProperties: true,
      properties: {
        model_id: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
      },
      optionalProperties: {
        a: {
          type: 'string',
        },
      },
    });
  });
});
