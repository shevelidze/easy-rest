import QueryHandler from './QueryHandler';
import EntityQueryHandler from './EntityQueryHandler';
import {
  EntitiesPrefixMissingError,
  InvalidEntityNameError,
  InvalidRequestPathError,
} from '../errors';
import type EntitiesData from '../EntitiesData';

export default class InitialQueryHandler implements QueryHandler {
  constructor(entitiesData: EntitiesData) {
    this.entitiesData = entitiesData;
  }
  async handleQueryElement(query: string[]) {
    if (query.length < 2) throw new InvalidRequestPathError();
    if (query[0] !== 'entities') throw new EntitiesPrefixMissingError();
    query.shift();
    if (query[0] in this.entitiesData.entityQueryHandlers)
      return this.entitiesData.entityQueryHandlers[query[0]];
    throw new InvalidEntityNameError(query[0]);
  }

  entitiesData: EntitiesData;
}
