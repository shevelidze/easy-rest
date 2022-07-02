import Entity from './Entity';
import { Include } from './EntityBlueprint';

export default class EntityObject {
  constructor(id: string, entity: Entity) {
    this.id = id;
    this.entity = entity;
  }
  fetch(include: Include) {
    this.entity.fetch({ ids: [this.id], include });
  }
  fetchOneMember(memberName: string, memberInclude?: Include) {
    if (this.entity.entityBlueprint.members[memberName] === undefined)
      throw new Error(
        `Entity ${this.entity.name} has no members with name ${memberName}.`
      );

    return this.fetch({
      [memberName]: memberInclude || this.entity.include[memberName],
    })[memberName];
  }
  delete() {
    this.entity.delete(this.id);
  }
  mutate(mutate: any) {
    this.entity.mutate(this.id, mutate);
  }

  entity: Entity;
  id: string;
}
