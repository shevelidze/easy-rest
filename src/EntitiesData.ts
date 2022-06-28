import { EntityQueryHandler } from './queryHandlers';
import { InternalEntitesObject } from './entityUtils';

export default interface EntitiesData {
  entities: InternalEntitesObject;
  entityQueryHandlers: { [key: string]: EntityQueryHandler };
}
