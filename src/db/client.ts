import { Pool } from "pg";
import { env } from "../config/env";

export const db = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
});