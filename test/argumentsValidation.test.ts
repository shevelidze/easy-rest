import EasyRest from '../src';
import {
  InvalidCreatorArguments,
  InvalidMutatorArguments,
} from '../src/errors';

describe('Arguments validation', () => {
  test('creator args validation', async () => {
    const easyRest = new EasyRest.Instance({
      apple: {
        fetcher: async () => {},
        creator: async () => {},
        creatorSchema: {
          properties: {
            content: { type: 'string' },
          },
        },
      },
    });

    await easyRest.processQuery(['entities', 'apple'], 'PUT', {
      content: 'Hello',
    });

    await expect(
      easyRest.processQuery(['entities', 'apple'], 'PUT', {
        a: 'b',
        hello: 'bye',
      })
    ).rejects.toStrictEqual(new InvalidCreatorArguments());
  });
  test('mutator args validation', async () => {
    const easyRest = new EasyRest.Instance({
      pear: {
        fetcher: async () => {},
        mutator: async () => {},
        mutatorSchema: {
          properties: {
            hello: { enum: ['bye'] },
          },
        },
      },
    });

    await easyRest.processQuery(['entities', 'pear', '123'], 'POST', {
      hello: 'bye',
    });

    await expect(
      easyRest.processQuery(['entities', 'pear', '123'], 'POST', { a: 123 })
    ).rejects.toStrictEqual(new InvalidMutatorArguments());
  });
});
