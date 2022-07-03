import * as ta from './testAssets';
import EasyRest from '../src';

afterEach(ta.resetDicts);

describe('Rejections', () => {
  test('reject a wrong http method', async () => {
    await expect(
      ta.easyRest.processQuery(['entities', 'room'], 'PATCH', {})
    ).rejects.toBeInstanceOf(EasyRest.errors.MethodNotAllowedError);
  });
  test('reject a request without the entities prefix', async () => {
    await expect(
      ta.easyRest.processQuery(['room', '100'], 'GET', {})
    ).rejects.toBeInstanceOf(EasyRest.errors.EntitiesPrefixMissingError);
  });
  test('reject an empty request', async () => {
    await expect(
      ta.easyRest.processQuery([], 'GET', {})
    ).rejects.toBeInstanceOf(EasyRest.errors.NotFoundError);
  });
  test('reject a request to an unavailable id', async () => {
    await expect(
      ta.easyRest.processQuery(['entities', 'room', '1'], 'GET', {})
    ).rejects.toStrictEqual(
      new EasyRest.errors.InvalidEntityIdError('1', 'room')
    );
  });
});
