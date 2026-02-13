export interface ILogEntry {
  id?: string;
  level: string;
  message: string;
  correlationId: string;
  metadata?: any;
  context?: any;
  type?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: string;
  error?: any;
  createdAt?: Date;
}
