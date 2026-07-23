import 'dotenv/config';

import bcrypt from 'bcryptjs';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ============================================
// Permission list ตามฟีเจอร์ในสเปค (key แบบ resource.action)
// ============================================
const PERMISSIONS = [
  // User & Role management
  { key: "user.manage", description: "จัดการผู้ใช้งานทั้งหมด" },
  { key: "role.manage", description: "จัดการ Role และ Permission" },

  // Landing Page
  { key: "landing_page.view", description: "ดูรายการ Landing Page" },
  { key: "landing_page.create", description: "สร้าง Landing Page" },
  { key: "landing_page.edit", description: "แก้ไข Landing Page" },
  { key: "landing_page.delete", description: "ลบ Landing Page" },
  {
    key: "landing_page.publish",
    description: "Publish/Unpublish Landing Page",
  },

  // Blog
  { key: "blog.view", description: "ดูรายการ Blog" },
  { key: "blog.create", description: "สร้าง Blog Post" },
  { key: "blog.edit", description: "แก้ไข Blog Post" },
  { key: "blog.delete", description: "ลบ Blog Post" },
  { key: "blog.publish", description: "Publish/Unpublish Blog Post" },

  // Media & File
  { key: "media.manage", description: "จัดการไฟล์และรูปภาพ" },

  // Category & Tag
  { key: "category.manage", description: "จัดการ Category" },
  { key: "tag.manage", description: "จัดการ Tag" },

  // System
  { key: "settings.manage", description: "จัดการการตั้งค่าระบบ" },
  { key: "dashboard.view", description: "ดูข้อมูลใน Dashboard" },
  { key: "activity_log.view", description: "ดู Activity Log / Audit Log" },
  { key: "analytics.view", description: "ดู Analytics" },
  { key: "backup.manage", description: "Backup และ Restore" },
] as const;

// ============================================
// Role -> Permission mapping ตามข้อ 2 ในสเปค
// ============================================
const ROLE_PERMISSIONS: Record<string, string[]> = {
  "Super Admin": PERMISSIONS.map((p) => p.key), // ได้ทุก permission

  Admin: [
    "landing_page.view",
    "landing_page.create",
    "landing_page.edit",
    "landing_page.delete",
    "landing_page.publish",
    "blog.view",
    "blog.create",
    "blog.edit",
    "blog.delete",
    "blog.publish",
    "media.manage",
    "category.manage",
    "tag.manage",
    "dashboard.view",
    "analytics.view",
  ],

  Editor: [
    "landing_page.view",
    "landing_page.create",
    "landing_page.edit",
    "blog.view",
    "blog.create",
    "blog.edit",
    "media.manage",
    "dashboard.view",
    // ไม่มี publish, delete, user.manage ตามสเปค ("ไม่สามารถจัดการบัญชีผู้ใช้งาน")
  ],

  Viewer: [
    "landing_page.view",
    "blog.view",
    "dashboard.view",
    // ไม่มีสิทธิ์แก้ไขหรือลบข้อมูล
  ],
};

async function main() {
  console.log("🌱 Seeding permissions...");
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { description: perm.description },
      create: perm,
    });
  }

  console.log("🌱 Seeding roles...");
  for (const roleName of Object.keys(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    const permissionKeys = ROLE_PERMISSIONS[roleName];
    const permissions = await prisma.permission.findMany({
      where: { key: { in: permissionKeys } },
    });

    // ลบ mapping เก่าก่อนแล้วค่อยสร้างใหม่ ป้องกัน permission ค้างจาก seed รอบก่อน
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: permissions.map((p) => ({ roleId: role.id, permissionId: p.id })),
    });

    console.log(`  ✓ ${roleName}: ${permissions.length} permissions`);
  }

  console.log("🌱 Seeding Super Admin user...");
  const superAdminEmail =
    process.env.SEED_SUPER_ADMIN_EMAIL ?? "admin@example.com";
  const superAdminPassword =
    process.env.SEED_SUPER_ADMIN_PASSWORD ?? "ChangeMe123!";

  const passwordHash = await bcrypt.hash(superAdminPassword, 12);
  const superAdminRole = await prisma.role.findUniqueOrThrow({
    where: { name: "Super Admin" },
  });

  const user = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      email: superAdminEmail,
      passwordHash,
      name: "Super Admin",
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: superAdminRole.id } },
    update: {},
    create: { userId: user.id, roleId: superAdminRole.id },
  });

  console.log(`  ✓ Super Admin created: ${superAdminEmail}`);
  if (!process.env.SEED_SUPER_ADMIN_PASSWORD) {
    console.log(
      `  ⚠️  ใช้รหัสผ่าน default "${superAdminPassword}" — เปลี่ยนทันทีหลัง login ครั้งแรก`,
    );
  }

  console.log("✅ Seed เสร็จสมบูรณ์");
}

main()
  .catch((e) => {
    console.error("❌ Seed ล้มเหลว:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
