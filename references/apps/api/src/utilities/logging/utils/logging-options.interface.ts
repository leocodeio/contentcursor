export interface LoggingModuleOptions {
  database?: {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    schema?: string;
    ssl?: {
      rejectUnauthorized: boolean;
    };
  };
  entities?: any[];
  winston?: {
    console?: boolean;
    file?: {
      enabled: boolean;
      errorPath?: string;
      combinedPath?: string;
      maxSize?: string;
      maxFiles?: string;
    };
  };
}
