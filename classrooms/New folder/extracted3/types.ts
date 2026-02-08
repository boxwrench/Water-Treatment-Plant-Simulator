
export enum FilterState {
  ONLINE = 'ONLINE',
  OFFLINE_MANUAL = 'OFFLINE_MANUAL',
  OFFLINE_QUEUED = 'OFFLINE_QUEUED',
  BACKWASHING = 'BACKWASHING'
}

export interface Filter {
  id: number;
  state: FilterState;
  runtimeHrs: number;
  headlossFt: number;
  turbidityNtu: number;
  flowMgd: number;
  backwashProgress: number; // 0 to 1
  isBreakthrough: boolean;
}

export interface SimLog {
  timestamp: string;
  message: string;
  type: 'info' | 'warn' | 'error' | 'success';
}

export interface SimState {
  filters: Filter[];
  simTimeHrs: number;
  speed: number;
  isPaused: boolean;
  backwashQueue: number[];
  activeBackwashId: number | null;
  logs: SimLog[];
  isFailed: boolean;
  failureReason: string;
}

export const CONSTANTS = {
  TOTAL_FLOW_TARGET: 100,
  TOTAL_FILTERS: 10,
  MAX_HYDRAULIC_CAP: 20,
  BACKWASH_DURATION_HRS: 0.5,
  LIMIT_HEADLOSS: 10.0,
  LIMIT_TURBIDITY: 0.10,
  LIMIT_RUNTIME: 72,
  BASE_HEADLOSS_RATE: 0.125, // per hr at 10 MGD
  BREAKTHROUGH_THRESHOLD_MGD: 15,
  BREAKTHROUGH_THRESHOLD_HRS: 40,
  INITIAL_STAGGER_HRS: 6
};
