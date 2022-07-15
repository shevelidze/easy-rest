import EasyRest from '../../src';
import { SchemaFormProperties } from 'jtd';

describe('Instance constructor', () => {
  test('recognize a creation schema loop', () => {
    expect(() => {
      new EasyRest.Instance({
        post: {
          fetcher: async () => {},
          members: {
            name: EasyRest.string().requiredForCreation(),
            likes: EasyRest.array(
              EasyRest.entity('like')
            ).requiredForCreation(),
          },
        },
        like: {
          fetcher: async () => {},
          members: {
            post: EasyRest.entity('post').requiredForCreation(),
          },
        },
      });
    }).toThrow(/Loop in the entity: post->like->post\./);
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

  test('build correct creator and mutator schema', () => {
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
      machine: {
        fetcher: async () => {},
        members: {
          parts: EasyRest.array(EasyRest.entity('part')).requiredForCreation(),
        },
      },
      part: {
        fetcher: async () => {},
        members: {
          name: EasyRest.string().variable().requiredForCreation(),
          tag: EasyRest.entity('part_tag').variable(),
          tags: EasyRest.array(EasyRest.entity('part_tag')).variable(),
        },
      },
      part_tag: {
        fetcher: async () => {},
        members: {
          value: EasyRest.number().requiredForCreation(),
        },
      },
    });

    expect(
      instance.entitiesData.entities.part.mutatorSchema
    ).toStrictEqual<SchemaFormProperties>({
      optionalProperties: {
        name: {
          type: 'string',
        },
        tag: {
          properties: {
            value: {
              type: 'int32',
            },
          },
        },
        tags: {
          values: {
            properties: {
              value: {
                type: 'int32',
              },
            },
          },
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

    expect(
      instance.entitiesData.entities.machine.creatorSchema
    ).toStrictEqual<SchemaFormProperties>({
      properties: {
        parts: {
          values: {
            properties: {
              name: {
                type: 'string',
              },
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
