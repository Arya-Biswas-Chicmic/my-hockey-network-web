import type { ManagedChild, SupervisionControl, SupervisionLog } from '@/interfaces/supervision';
import type { GuardianRequestItem } from '@/interfaces/relationship';

export class SupervisionStore {
  private static wards: ManagedChild[] = [];
  private static pendingRequests: GuardianRequestItem[] = [];
  private static controls: Record<string, SupervisionControl[]> = {};
  private static logs: Record<string, SupervisionLog[]> = {};

  static getWards(): ManagedChild[] {
    return this.wards;
  }

  static setWards(wards: ManagedChild[]): void {
    this.wards = wards;
  }

  static getPendingRequests(): GuardianRequestItem[] {
    return this.pendingRequests;
  }

  static setPendingRequests(requests: GuardianRequestItem[]): void {
    this.pendingRequests = requests;
  }

  static getControls(wardId: string): SupervisionControl[] {
    return this.controls[wardId] || [];
  }

  static setControls(wardId: string, controls: SupervisionControl[]): void {
    this.controls[wardId] = controls;
  }
}
