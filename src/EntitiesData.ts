import { EntityQueryHandler } from './queryHandlers';
import { EntitiesDict } from './Entity';

export default interface EntitiesData {
  entities: EntitiesDict;
  entityQueryHandlers: { [key: string]: EntityQueryHandler };
}
