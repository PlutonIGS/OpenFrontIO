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

export class ResearchCenterExecution implements Execution {
  private active = true;
  private mg: Game;
  private researchCenter: Unit;

  constructor(
    private _owner: PlayerID,
    private tile: TileRef,
  ) {}

  init(mg: Game, ticks: number): void {
    if (!mg.hasPlayer(this._owner)) {
      console.warn(`ResearchCenterExecution: owner ${this._owner} not found`);
      this.active = false;
      return;
    }
    this.mg = mg;
  }

  tick(ticks: number): void {
    if (this.researchCenter == null) {
      const player = this.mg.player(this._owner);
      if (!player.canBuild(UnitType.ResearchCenter, this.tile)) {
        consolex.warn(
          `player ${player} cannot build research center at ${this.tile}`,
        );
        this.active = false;
        return;
      }
      this.researchCenter = player.buildUnit(
        UnitType.ResearchCenter,
        0,
        this.tile,
      );
    }

    if (!this.researchCenter.isActive()) {
      this.active = false;
      return;
    }

    // Generate gold based on current purse every 10 ticks
    if (ticks % 10 === 0) {
      const owner = this.researchCenter.owner();
      const currentGold = owner.gold();

      // Calculate bonus as 1.5% of current gold
      const bonusPercentage = 0.015; // 1.5%
      const bonus = Math.floor(currentGold * bonusPercentage);

      // Add bonus if there's any gold to generate
      if (bonus > 0) {
        owner.addGold(bonus);
      }
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
