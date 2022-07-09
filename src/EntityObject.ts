import Entity from './Entity';
import { DataModifierArgs, Include, MutatorArgs } from './EntityBlueprint';

export default class EntityObject {
  constructor(id: string, entity: Entity) {
    this.id = id;
    this.entity = entity;
  }
  async fetch(args: { include: Include } & DataModifierArgs) {
    return (await this.entity.fetch({ ids: [this.id], ...args }))?.[0];
  }
  async fetchOneMember(
    args: { memberName: string; memberInclude?: Include } & DataModifierArgs
  ) {
    if (this.entity.entityBlueprint.members[args.memberName] === undefined)
      throw new Error(
        `Entity ${this.entity.name} has no members with name ${args.memberName}.`
      );

    return (
      await this.fetch({
        auth: args.auth,
        include: {
          [args.memberName]:
            args.memberInclude || this.entity.include[args.memberName],
        },
      })
    )[args.memberName];
  }
  delete(args: DataModifierArgs) {
    return this.entity.delete({ id: this.id, ...args });
  }
  mutate(args: MutatorArgs) {
    return this.entity.mutate({ id: this.id, ...args });
  }

  entity: Entity;
  id: string;
}
