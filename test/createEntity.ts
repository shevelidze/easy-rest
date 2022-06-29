import { InternalEntity } from '../src/entityUtils';

export default function createEntity(o?: any) {
  const result: InternalEntity = {
    name: 'empty',
    fetcher: async ({ ids }) => `fetch for ids ${ids?.join(', ')}`,
    methods: {},
    members: {},
    include: {},
    lightInclude: {},
  };
  if (o) {
    for (const key in o) {
      result[key] = o[key];
    }
  }
  return result;
}
