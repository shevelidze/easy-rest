import { EntityQueryHandler } from './queryHandlers';
import { EntitesObject } from './Entity';

export default interface EntitiesData {
  entities: EntitesObject;
  entityQueryHandlers: { [key: string]: EntityQueryHandler };
}
