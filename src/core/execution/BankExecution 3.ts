import {
  Execution,
  Game,
  Player,
  Unit,
  PlayerID,
  UnitType,
} from "../game/Game";
import { TileRef } from "../game/GameMap";

interface Loan {
  amount: number;
  interest: number;
  dueDate: number;
  takenAt: number;
}

interface Investment {
  amount: number;
  lockPeriod: number;
  returnRate: number;
  investedAt: number;
}

export class BankExecution implements Execution {
  private active = true;
  private mg: Game;
  private bank: Unit;
  private loans: Map<PlayerID, Loan> = new Map();
  private investments: Map<PlayerID, Investment[]> = new Map();

  constructor(
    private _owner: PlayerID,
    private tile: TileRef,
  ) {}

  init(mg: Game, ticks: number): void {
    if (!mg.hasPlayer(this._owner)) {
      console.warn(`BankExecution: owner ${this._owner} not found`);
      this.active = false;
      return;
    }
    this.mg = mg;
  }

  tick(ticks: number): void {
    if (this.bank == null) {
      const player = this.mg.player(this._owner);
      if (!player) {
        this.active = false;
        return;
      }

      try {
        this.bank = player.buildUnit(UnitType.Bank, 0, this.tile);
        console.log("Bank built successfully:", this.bank);
      } catch (error) {
        console.error("Error building bank:", error);
        this.active = false;
        return;
      }
    }

    // Process loans every 100 ticks
    if (ticks % 100 === 0) {
      this.processLoans(ticks);
    }

    // Process investments every 50 ticks
    if (ticks % 50 === 0) {
      this.processInvestments(ticks);
    }

    // Process savings interest every 100 ticks
    if (ticks % 100 === 0) {
      this.processSavingsInterest();
    }
  }

  private processLoans(ticks: number) {
    // Implement loan processing logic
  }

  private processInvestments(ticks: number) {
    // Implement investment processing logic
  }

  private processSavingsInterest() {
    // Implement savings interest logic
  }

  // Banking Operations
  takeLoan(player: Player, amount: number, ticks: number): boolean {
    if (this.loans.has(player.id())) return false;

    const maxLoan = player.gold() * 1.5;
    if (amount > maxLoan) return false;

    const loan: Loan = {
      amount,
      interest: 0.05,
      dueDate: ticks + 1000,
      takenAt: ticks,
    };

    this.loans.set(player.id(), loan);
    player.addGold(amount);
    return true;
  }

  makeInvestment(
    player: Player,
    amount: number,
    period: number,
    ticks: number,
  ): boolean {
    if (player.gold() < amount) return false;

    const investment: Investment = {
      amount,
      lockPeriod: period,
      returnRate: this.calculateReturnRate(period),
      investedAt: ticks,
    };

    player.removeGold(amount);
    const playerInvestments = this.investments.get(player.id()) || [];
    playerInvestments.push(investment);
    this.investments.set(player.id(), playerInvestments);
    return true;
  }

  private calculateReturnRate(period: number): number {
    // 15-45% based on lock period (300-900 ticks)
    return 0.15 + (period - 300) * (0.3 / 600);
  }

  // Implementing required methods from Execution interface
  isActive(): boolean {
    return this.active;
  }

  activeDuringSpawnPhase(): boolean {
    return false;
  }

  owner(): Player {
    return this.bank ? this.bank.owner() : null;
  }
}
