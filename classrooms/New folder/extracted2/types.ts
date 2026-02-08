
export enum FilterStatus {
  ONLINE = 'ONLINE',
  OFFLINE_MANUAL = 'OFFLINE_MANUAL',
  OFFLINE_QUEUED = 'OFFLINE_QUEUED',
  BACKWASHING = 'BACKWASHING'
}

export interface Filter {
  id: number;
  status: FilterStatus;
  flow: number; // MGD
  headloss: number; // Feet
  turbidity: number; // NTU
  runtime: number; // Hours
  isBreakingThrough: boolean;
  breakthroughTime: number; // Progress in hours (0 to 0.5)
}

export interface LogEntry {
  id: string;
  simTime: number;
  message: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface PlantStats {
  targetFlow: number;
  actualFlow: number;
  avgTurbidity: number;
  activeCount: number;
  backwashQueueSize: number;
  currentBackwashingId: number | null;
  failureMessage: string | null;
}
