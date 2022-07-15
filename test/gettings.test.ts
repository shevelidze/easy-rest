import * as ta from './testAssets';
import EasyRest from '../src';

afterEach(ta.resetDicts);

describe('Gettings', () => {
  beforeEach(() => {
    Object.assign(ta.students, {
      john: { age: 13, id: 'john', name: 'John Ripper' },
      elon: {
        age: 12,
        id: 'elon',
        name: 'Elon Mask',
      },
    });
    Object.assign(ta.classes, {
      '1a': {
        id: '1a',
        name: '1a class',
        students: [ta.students.john, ta.students.elon],
      },
    });
    Object.assign(ta.buildings, {
      '123': {
        id: '123',
        rooms: [],
        address: 'Holy Jesus st. 1',
      },
    });
    Object.assign(ta.schools, {
      '1': {
        id: '1',
        name: 'School #1',
        building: ta.buildings['123'],
        classes: [ta.classes['1a']],
      },
    });
  });
  test('get all objects of a one entity', async () => {
    await expect(
      ta.easyRest.processQuery(['entities', 'student'], 'GET', {})
    ).resolves.toStrictEqual(
      new EasyRest.ApiResult(200, [
        { id: 'john', name: 'John Ripper' },
        { id: 'elon', name: 'Elon Mask' },
      ])
    );
    await expect(
      ta.easyRest.processQuery(['entities', 'class'], 'GET', {})
    ).resolves.toStrictEqual(
      new EasyRest.ApiResult(200, [
        {
          id: '1a',
          name: '1a class',
          students: [
            { id: 'john', name: 'John Ripper' },
            { id: 'elon', name: 'Elon Mask' },
          ],
        },
      ])
    );
  });
  test('get one object', async () => {
    await expect(
      ta.easyRest.processQuery(['entities', 'class', '1a'], 'GET', {})
    ).resolves.toStrictEqual(
      new EasyRest.ApiResult(200, {
        id: '1a',
        name: '1a class',
        students: [
          { id: 'john', name: 'John Ripper' },
          { id: 'elon', name: 'Elon Mask' },
        ],
      })
    );
    await expect(
      ta.easyRest.processQuery(['entities', 'student', 'elon'], 'GET', {})
    ).resolves.toStrictEqual(new EasyRest.ApiResult(200, ta.students.elon));
  });
  test('get a preperty of a one object', async () => {
    await expect(
      ta.easyRest.processQuery(
        ['entities', 'student', 'elon', 'age'],
        'GET',
        {}
      )
    ).resolves.toStrictEqual(
      new EasyRest.ApiResult(200, { value: ta.students.elon.age })
    );
    await expect(
      ta.easyRest.processQuery(
        ['entities', 'student', 'elon', 'age'],
        'GET',
        {}
      )
    ).resolves.toStrictEqual(
      new EasyRest.ApiResult(200, { value: ta.students.elon.age })
    );
  });
});
