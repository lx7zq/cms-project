import 'dotenv/config';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../generated/prisma/client';

// สร้าง connection pool แทน single connection
// เพื่อป้องกัน deprecationWarning: Calling client.query() when client is already executing a query
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,              // จำนวน connection สูงสุดใน pool
  idleTimeoutMillis: 30000,   // ปิด connection ที่ idle เกิน 30 วินาที
  connectionTimeoutMillis: 5000, // timeout ถ้า connect ไม่ได้ภายใน 5 วินาที
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
