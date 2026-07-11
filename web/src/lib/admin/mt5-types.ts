// ====================================================================
//  MT5 Master Account Management — types
//  Mirrors the Prisma MT5Account model + REST contract (server/src/routes/mt5-accounts.ts)
// ====================================================================

export type MT5Server =
  | "METAQUOTES_DEMO"
  | "METAQUOTES_REAL"
  | "ICMARKETS_DEMO"
  | "ICMARKETS_REAL"
  | "PEPPERSTONE_DEMO"
  | "PEPPERSTONE_REAL"
  | "CUSTOM";

export interface MT5Account {
  id: string;
  label: string;
  login: string;
  server: MT5Server;
  serverName?: string;
  currency: string;
  leverage: number;
  balance: number;
  equity: number;
  isActive: boolean;     // the single trading account
  isMaster: boolean;     // the single copy-trading source
  isActiveConn: boolean; // bridge connected?
  createdBy?: string;
  lastConnectedAt?: string;
  lastError?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MT5AccountInput {
  label: string;
  login: string;
  server: MT5Server;
  serverName?: string;
  password: string;
  currency?: string;
  leverage?: number;
  makeActive?: boolean;
  makeMaster?: boolean;
}

// ---- Activity log (mirrors Prisma AuditLog) ----
export type LogAction =
  | "CREATE" | "UPDATE" | "DELETE"
  | "MT5_ACTION" | "LOGIN" | "LOGOUT"
  | "SETTINGS_CHANGE" | "FAILED_LOGIN" | "2FA_ENABLED" | "2FA_DISABLED";

export interface ActivityLog {
  id: string;
  adminId?: string;
  adminName?: string;
  action: LogAction;
  resource?: string;
  resourceId?: string;
  ipAddress?: string;
  details?: Record<string, unknown>;
  createdAt: string; // ISO
}

export const SERVER_LABELS: Record<MT5Server, string> = {
  METAQUOTES_DEMO: "MetaQuotes · Demo",
  METAQUOTES_REAL: "MetaQuotes · Real",
  ICMARKETS_DEMO: "IC Markets · Demo",
  ICMARKETS_REAL: "IC Markets · Real",
  PEPPERSTONE_DEMO: "Pepperstone · Demo",
  PEPPERSTONE_REAL: "Pepperstone · Real",
  CUSTOM: "Custom Server",
};
