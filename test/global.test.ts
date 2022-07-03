import EasyRest from '../src';

interface Student {
  id: string;
  name: string;
  age: number;
}

interface Room {
  id: string;
  number: number;
  area: number;
}

interface Class {
  id: string;
  name: string;
  students: Student[];
}

interface Building {
  id: string;
  rooms: Room[];
  address: string;
}

interface Schole {
  id: string;
  building: Building;
  name: string;
  classes: Class[];
}

type Dict<T> = { [id: string]: T };

const schools: Dict<Schole> = {};
const buildings: Dict<Building> = {};
const classes: Dict<Class> = {};
const rooms: Dict<Room> = {};
const students: Dict<Student> = {};

function resetDicts() {
  for (const dict of [schools, buildings, classes, rooms, students]) {
    for (const key in dict) delete dict[key];
  }
}

function applyInclude(object: any, include: EasyRest.Include) {
  const result: any = {};
  for (const memberName in include) {
    if (typeof include[memberName] === 'boolean' && include[memberName]) {
      result[memberName] = object[memberName];
    } else if (include[memberName] !== false)
      result[memberName] = applyInclude(
        object[memberName],
        include[memberName] as EasyRest.Include
      );
  }

  return result;
}

function createFetcher<T>(dict: Dict<T>, name: string) {
  return async ({
    ids,
    include,
  }: {
    ids?: string[];
    include: EasyRest.Include;
  }) => {
    const result: T[] = [];
    if (ids) {
      for (const id of ids) {
        const element = dict[id];
        if (element === undefined)
          throw new EasyRest.errors.InvalidEntityIdError(id, name);

        result.push(applyInclude(element, include));
      }
    } else {
      for (const element of Object.values(dict))
        result.push(applyInclude(element, include));
    }

    return result;
  };
}

const easyRest = new EasyRest.Instance({
  school: {
    members: {
      id: EasyRest.string(),
      building: EasyRest.entity('building').excludeFromLight(),
      name: EasyRest.string().allowVariation(),
      classes: EasyRest.array(EasyRest.entity('class')),
    },
    fetcher: createFetcher(schools, 'school'),
    methods: {},
  },
  building: {
    members: {
      id: EasyRest.string(),
      rooms: EasyRest.array(EasyRest.entity('room')).excludeFromLight(),
      address: EasyRest.string(),
    },
    fetcher: createFetcher(buildings, 'building'),
    methods: {},
  },
  class: {
    members: {
      id: EasyRest.string(),
      students: EasyRest.array(EasyRest.entity('student')).allowVariation(),
      name: EasyRest.string(),
    },
    fetcher: createFetcher(classes, 'class'),
    methods: {},
  },
  student: {
    members: {
      id: EasyRest.string(),
      name: EasyRest.string(),
      age: EasyRest.number().excludeFromLight(),
    },
    fetcher: createFetcher(students, 'student'),
    methods: {},
  },
  room: {
    members: {
      id: EasyRest.string(),
      number: EasyRest.number().allowVariation(),
      area: EasyRest.number(),
    },
    fetcher: createFetcher(rooms, 'room'),
    methods: {},
  },
});

describe('Global tests', () => {
  afterEach(resetDicts);
  test('reject a wrong http method', async () => {
    await expect(
      easyRest.processQuery(['entities', 'room'], 'PATCH', {})
    ).rejects.toBeInstanceOf(EasyRest.errors.MethodNotAllowedError);
  });
  test('reject request without the entities prefix', async () => {
    await expect(
      easyRest.processQuery(['room', '100'], 'GET', {})
    ).rejects.toBeInstanceOf(EasyRest.errors.EntitiesPrefixMissingError);
  });
  test('reject empty request', async () => {
    await expect(easyRest.processQuery([], 'GET', {})).rejects.toBeInstanceOf(
      EasyRest.errors.NotFoundError
    );
  });
  test('reject request to an unavailable id', async () => {
    await expect(
      easyRest.processQuery(['entities', 'room', '1'], 'GET', {})
    ).rejects.toStrictEqual(
      new EasyRest.errors.InvalidEntityIdError('1', 'room')
    );
  });
  test('get all object of one entity', async () => {
    Object.assign(students, {
      john: { age: 13, id: 'john', name: 'John Ripper' },
      elon: {
        age: 12,
        id: 'elon',
        name: 'Elon Mask',
      },
    });
    Object.assign(classes, {
      '1a': {
        id: '1a',
        name: '1a class',
        students: [students.john, students.elon],
      },
    });
    await expect(
      easyRest.processQuery(['entities', 'student'], 'GET', {})
    ).resolves.toStrictEqual(
      new EasyRest.ApiResult(200, [
        { id: 'john', name: 'John Ripper' },
        { id: 'elon', name: 'Elon Mask' },
      ])
    );
    await expect(
      easyRest.processQuery(['entities', 'class'], 'GET', {})
    ).resolves.toStrictEqual(
      new EasyRest.ApiResult(200, [
        {
          id: '1a',
          name: '1a class',
          students: [students.john, students.elon],
        },
      ])
    );
  });
});
