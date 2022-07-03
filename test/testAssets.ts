import EasyRest from '../src';

export interface Student {
  id: string;
  name: string;
  age: number;
}

export interface Room {
  id: string;
  number: number;
  area: number;
}

export interface Class {
  id: string;
  name: string;
  students: Student[];
}

export interface Building {
  id: string;
  rooms: Room[];
  address: string;
}

export interface Schoole {
  id: string;
  building: Building;
  name: string;
  classes: Class[];
}

export type Dict<T> = { [id: string]: T };

export const schools: Dict<Schoole> = {};
export const buildings: Dict<Building> = {};
export const classes: Dict<Class> = {};
export const rooms: Dict<Room> = {};
export const students: Dict<Student> = {};

export function resetDicts() {
  for (const dict of [schools, buildings, classes, rooms, students]) {
    for (const key in dict) delete dict[key];
  }
}

export function applyInclude(object: any, include: EasyRest.Include) {
  if (object instanceof Array)
    return object.map((element) => applyInclude(element, include));

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

export function createFetcher<T>(dict: Dict<T>, name: string) {
  return async ({
    ids,
    include,
  }: {
    ids?: string[];
    include: EasyRest.Include;
  }) => {
    console.log(JSON.stringify(include));
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

export const easyRest = new EasyRest.Instance({
  school: {
    members: {
      building: EasyRest.entity('building').excludeFromLight(),
      name: EasyRest.string().allowVariation(),
      classes: EasyRest.array(EasyRest.entity('class')),
    },
    fetcher: createFetcher(schools, 'school'),
    methods: {},
  },
  building: {
    members: {
      rooms: EasyRest.array(EasyRest.entity('room')).excludeFromLight(),
      address: EasyRest.string(),
    },
    fetcher: createFetcher(buildings, 'building'),
    methods: {},
  },
  class: {
    members: {
      students: EasyRest.array(EasyRest.entity('student'))
        .useLightElements()
        .allowVariation()
        .excludeFromLight(),
      name: EasyRest.string(),
    },
    fetcher: createFetcher(classes, 'class'),
    methods: {},
  },
  student: {
    members: {
      name: EasyRest.string(),
      age: EasyRest.number().excludeFromLight(),
    },
    fetcher: createFetcher(students, 'student'),
    methods: {},
  },
  room: {
    members: {
      number: EasyRest.number().allowVariation(),
      area: EasyRest.number(),
    },
    fetcher: createFetcher(rooms, 'room'),
    methods: {},
  },
});
