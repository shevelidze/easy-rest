import EasyRest from '../../src';
import { SchemaFormProperties } from 'jtd';

describe('Instance constructor', () => {
  test('instance without members', () => {
    new EasyRest.Instance({
      entity: {
        fetcher: async () => {},
      },
    });
  }); 
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

  test('build correct include', () => {
    const easyRest1 = new EasyRest.Instance({
      user: {
        fetcher: async () => {},
        members: {
          first_name: EasyRest.string().excludedFromLight(),
          last_name: EasyRest.string().excludedFromLight(),
          email: EasyRest.string(),
          posts: EasyRest.entity('post').excludedFromLight(),
        },
      },
      post: {
        fetcher: async () => {},
        members: {
          content: EasyRest.string().excludedFromLight().requiredForCreation(),
          creation_timestamp: EasyRest.number().excludedFromLight(),
          likes: EasyRest.number().excludedFromLight(),
          views: EasyRest.number().excludedFromLight(),
          is_liked: EasyRest.boolean().variable().excludedFromLight(),
          user: EasyRest.entity('user').excludedFromLight(),
        },
      },
    });

    expect(easyRest1.entitiesData.entities.post.include).toStrictEqual({
      id: true,
      content: true,
      creation_timestamp: true,
      likes: true,
      views: true,
      is_liked: true,
      user: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
      },
    });

    const easyRest2 = new EasyRest.Instance({
      user: {
        fetcher: async () => {},
        members: {
          first_name: EasyRest.string().excludedFromLight(),
          last_name: EasyRest.string().excludedFromLight(),
          email: EasyRest.string(),
          posts: EasyRest.array(EasyRest.entity('post'))
            .lightElements()
            .excludedFromLight(),
        },
      },
      post: {
        fetcher: async () => {},
        members: {
          content: EasyRest.string().excludedFromLight().requiredForCreation(),
          creation_timestamp: EasyRest.number().excludedFromLight(),
          likes: EasyRest.number().excludedFromLight(),
          views: EasyRest.number().excludedFromLight(),
          is_liked: EasyRest.boolean().variable().excludedFromLight(),
          user: EasyRest.entity('user').excludedFromLight(),
        },
      },
    });

    expect(easyRest2.entitiesData.entities.post.include).toStrictEqual({
      id: true,
      content: true,
      creation_timestamp: true,
      likes: true,
      views: true,
      is_liked: true,
      user: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
      },
    });
  });
});
