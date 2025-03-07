import { consolex } from "../Consolex";
import {
  Execution,
  Game,
  Player,
  Unit,
  PlayerID,
  UnitType,
} from "../game/Game";
import { TileRef } from "../game/GameMap";

export class BarnExecution implements Execution {
  private active = true;
  private mg: Game;
  private barn: Unit;

  constructor(
    private _owner: PlayerID,
    private tile: TileRef,
  ) {}

  init(mg: Game, ticks: number): void {
    if (!mg.hasPlayer(this._owner)) {
      console.warn(`BarnExecution: owner ${this._owner} not found`);
      this.active = false;
      return;
    }
    this.mg = mg;
  }

  tick(ticks: number): void {
    if (this.barn == null) {
      const player = this.mg.player(this._owner);
      if (!player.canBuild(UnitType.Barn, this.tile)) {
        consolex.warn(`player ${player} cannot build barn at ${this.tile}`);
        this.active = false;
        return;
      }
      this.barn = player.buildUnit(UnitType.Barn, 0, this.tile);
    }

    if (!this.barn.isActive()) {
      this.active = false;
      return;
    }

    // Generate small amount of gold every 60 ticks
    if (ticks % 60 === 0) {
      const owner = this.barn.owner();
      // Small flat rate + tiny percentage of current gold
      const baseIncome = 1000; // 1k base income
      const percentageBonus = Math.floor(owner.gold() * 0.003); // 0.3% of current gold
      const bonus = baseIncome + percentageBonus;
      owner.addGold(bonus);
    }

    // Increase population capacity slightly
    if (ticks % 100 === 0) {
      // Every 100 ticks
      const owner = this.barn.owner();
      const popIncrease = 10000; // 10k population increase
      owner.addMaxPopulation(popIncrease);
    }
  }

  owner(): Player {
    return null;
  }

  isActive(): boolean {
    return this.active;
  }

  activeDuringSpawnPhase(): boolean {
    return false;
  }
}
