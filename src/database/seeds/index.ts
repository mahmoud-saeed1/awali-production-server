import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from '../../config/env';
import { connectDatabase, disconnectDatabase } from '../../config/database';
import { logger } from '../../shared/utils/logger';
import { Role } from '../../modules/roles/role.model';
import { User } from '../../modules/users/user.model';
import { BuildingType } from '../../modules/building-types/building-type.model';
import { UnitType } from '../../modules/unit-types/unit-type.model';
import { Feature } from '../../modules/features/feature.model';
import { PERMISSION_MODULES } from '../../shared/constants/permissions';

// ─── Build full permissions object ────────────────────────────────
function buildPermissions(actions: { create: boolean; read: boolean; update: boolean; delete: boolean }) {
  const permissions: Record<string, { create: boolean; read: boolean; update: boolean; delete: boolean }> = {};
  for (const mod of PERMISSION_MODULES) {
    permissions[mod] = { ...actions };
  }
  return permissions;
}

// ─── Seed Roles ───────────────────────────────────────────────────
async function seedRoles(): Promise<void> {
  const existingCount = await Role.countDocuments();
  if (existingCount > 0) {
    logger.info('Roles already seeded, skipping...');
    return;
  }

  const roles = [
    {
      nameEn: 'Super Admin',
      nameAr: 'المدير العام',
      description: { en: 'Full system access', ar: 'صلاحيات كاملة للنظام' },
      permissions: buildPermissions({ create: true, read: true, update: true, delete: true }),
      isSystem: true,
      isActive: true,
    },
    {
      nameEn: 'Admin',
      nameAr: 'مدير',
      description: { en: 'Administrative access', ar: 'صلاحيات إدارية' },
      permissions: buildPermissions({ create: true, read: true, update: true, delete: true }),
      isSystem: false,
      isActive: true,
    },
    {
      nameEn: 'Sales Manager',
      nameAr: 'مدير المبيعات',
      description: { en: 'Sales team management', ar: 'إدارة فريق المبيعات' },
      permissions: {
        ...buildPermissions({ create: false, read: true, update: false, delete: false }),
        units: { create: false, read: true, update: true, delete: false },
        clients: { create: true, read: true, update: true, delete: false },
        deals: { create: true, read: true, update: true, delete: false },
        tasks: { create: true, read: true, update: true, delete: true },
        activities: { create: true, read: true, update: false, delete: false },
        communications: { create: true, read: true, update: true, delete: false },
        documents: { create: true, read: true, update: false, delete: false },
        analytics: { create: false, read: true, update: false, delete: false },
      },
      isSystem: false,
      isActive: true,
    },
    {
      nameEn: 'Sales Agent',
      nameAr: 'وكيل مبيعات',
      description: { en: 'Sales agent access', ar: 'صلاحيات وكيل المبيعات' },
      permissions: {
        ...buildPermissions({ create: false, read: false, update: false, delete: false }),
        units: { create: false, read: true, update: false, delete: false },
        clients: { create: true, read: true, update: true, delete: false },
        deals: { create: true, read: true, update: true, delete: false },
        tasks: { create: true, read: true, update: true, delete: false },
        activities: { create: true, read: true, update: false, delete: false },
        communications: { create: true, read: true, update: false, delete: false },
        building_types: { create: false, read: true, update: false, delete: false },
        unit_types: { create: false, read: true, update: false, delete: false },
        features: { create: false, read: true, update: false, delete: false },
      },
      isSystem: false,
      isActive: true,
    },
    {
      nameEn: 'Viewer',
      nameAr: 'مشاهد',
      description: { en: 'Read-only access', ar: 'صلاحيات القراءة فقط' },
      permissions: buildPermissions({ create: false, read: true, update: false, delete: false }),
      isSystem: false,
      isActive: true,
    },
  ];

  await Role.insertMany(roles);
  logger.info(`✅ Seeded ${roles.length} roles`);
}

// ─── Seed Super Admin User ────────────────────────────────────────
async function seedSuperAdmin(): Promise<void> {
  const existingAdmin = await User.findOne({ email: env.SUPER_ADMIN_EMAIL });
  if (existingAdmin) {
    logger.info('Super Admin user already exists, skipping...');
    return;
  }

  const superAdminRole = await Role.findOne({ isSystem: true });
  if (!superAdminRole) {
    logger.error('Super Admin role not found. Run role seeds first.');
    return;
  }

  const passwordHash = await bcrypt.hash(env.SUPER_ADMIN_PASSWORD, env.BCRYPT_ROUNDS);

  await User.create({
    email: env.SUPER_ADMIN_EMAIL,
    password: passwordHash,
    name: { en: env.SUPER_ADMIN_NAME_EN, ar: env.SUPER_ADMIN_NAME_AR },
    phone: '+966500000000',
    role: superAdminRole._id,
    isActive: true,
  });

  logger.info('✅ Super Admin user seeded');
}

// ─── Seed Building Types ──────────────────────────────────────────
async function seedBuildingTypes(): Promise<void> {
  const existingCount = await BuildingType.countDocuments();
  if (existingCount > 0) {
    logger.info('Building types already seeded, skipping...');
    return;
  }

  const buildingTypes = [
    { nameEn: 'Residential Tower', nameAr: 'برج سكني', icon: 'building', order: 1, isActive: true },
    { nameEn: 'Villa Compound', nameAr: 'مجمع فلل', icon: 'home', order: 2, isActive: true },
    { nameEn: 'Commercial Complex', nameAr: 'مجمع تجاري', icon: 'store', order: 3, isActive: true },
    { nameEn: 'Mixed Use', nameAr: 'متعدد الاستخدام', icon: 'layers', order: 4, isActive: true },
    { nameEn: 'Office Tower', nameAr: 'برج مكاتب', icon: 'briefcase', order: 5, isActive: true },
    { nameEn: 'Standalone Building', nameAr: 'مبنى مستقل', icon: 'building-2', order: 6, isActive: true },
  ];

  await BuildingType.insertMany(buildingTypes);
  logger.info(`✅ Seeded ${buildingTypes.length} building types`);
}

// ─── Seed Unit Types ──────────────────────────────────────────────
async function seedUnitTypes(): Promise<void> {
  const existingCount = await UnitType.countDocuments();
  if (existingCount > 0) {
    logger.info('Unit types already seeded, skipping...');
    return;
  }

  const unitTypes = [
    { nameEn: 'Apartment', nameAr: 'شقة', icon: 'door', order: 1, isActive: true },
    { nameEn: 'Villa', nameAr: 'فيلا', icon: 'home', order: 2, isActive: true },
    { nameEn: 'Duplex', nameAr: 'دوبلكس', icon: 'layers', order: 3, isActive: true },
    { nameEn: 'Penthouse', nameAr: 'بنتهاوس', icon: 'crown', order: 4, isActive: true },
    { nameEn: 'Studio', nameAr: 'استوديو', icon: 'square', order: 5, isActive: true },
    { nameEn: 'Townhouse', nameAr: 'تاون هاوس', icon: 'house', order: 6, isActive: true },
    { nameEn: 'Office', nameAr: 'مكتب', icon: 'briefcase', order: 7, isActive: true },
    { nameEn: 'Shop', nameAr: 'محل تجاري', icon: 'store', order: 8, isActive: true },
    { nameEn: 'Warehouse', nameAr: 'مستودع', icon: 'package', order: 9, isActive: true },
    { nameEn: 'Land', nameAr: 'أرض', icon: 'map', order: 10, isActive: true },
  ];

  await UnitType.insertMany(unitTypes);
  logger.info(`✅ Seeded ${unitTypes.length} unit types`);
}

// ─── Seed Features ────────────────────────────────────────────────
async function seedFeatures(): Promise<void> {
  const existingCount = await Feature.countDocuments();
  if (existingCount > 0) {
    logger.info('Features already seeded, skipping...');
    return;
  }

  const features = [
    // Amenities
    { nameEn: 'Swimming Pool', nameAr: 'مسبح', category: 'amenity', icon: 'pool', order: 1, isActive: true },
    { nameEn: 'Gym', nameAr: 'صالة رياضية', category: 'amenity', icon: 'dumbbell', order: 2, isActive: true },
    { nameEn: 'Parking', nameAr: 'موقف سيارات', category: 'amenity', icon: 'car', order: 3, isActive: true },
    { nameEn: 'Garden', nameAr: 'حديقة', category: 'amenity', icon: 'tree', order: 4, isActive: true },
    { nameEn: 'Playground', nameAr: 'ملعب أطفال', category: 'amenity', icon: 'smile', order: 5, isActive: true },
    // Characteristics
    { nameEn: 'Central AC', nameAr: 'تكييف مركزي', category: 'characteristic', icon: 'thermometer', order: 6, isActive: true },
    { nameEn: 'Elevator', nameAr: 'مصعد', category: 'characteristic', icon: 'arrow-up', order: 7, isActive: true },
    { nameEn: 'Balcony', nameAr: 'شرفة', category: 'characteristic', icon: 'sun', order: 8, isActive: true },
    { nameEn: 'Smart Home', nameAr: 'منزل ذكي', category: 'characteristic', icon: 'cpu', order: 9, isActive: true },
    // Facilities
    { nameEn: 'Security', nameAr: 'أمن وحراسة', category: 'facility', icon: 'shield', order: 10, isActive: true },
    { nameEn: 'Concierge', nameAr: 'خدمة استقبال', category: 'facility', icon: 'bell', order: 11, isActive: true },
    { nameEn: 'Maintenance', nameAr: 'صيانة', category: 'facility', icon: 'wrench', order: 12, isActive: true },
    // Services
    { nameEn: 'Cleaning Service', nameAr: 'خدمة تنظيف', category: 'service', icon: 'sparkles', order: 13, isActive: true },
    { nameEn: 'Laundry', nameAr: 'مغسلة', category: 'service', icon: 'shirt', order: 14, isActive: true },
  ];

  await Feature.insertMany(features);
  logger.info(`✅ Seeded ${features.length} features`);
}

// ─── Auto-seed (called from server startup — DB already connected) ─────────
export async function runAutoSeed(): Promise<{
  superAdminEmail: string;
  superAdminPassword: string;
}> {
  await seedRoles();
  await seedSuperAdmin();
  await seedBuildingTypes();
  await seedUnitTypes();
  await seedFeatures();
  return {
    superAdminEmail: env.SUPER_ADMIN_EMAIL,
    superAdminPassword: env.SUPER_ADMIN_PASSWORD,
  };
}

// ─── Main Seed Runner ─────────────────────────────────────────────
async function runSeeds(): Promise<void> {
  try {
    logger.info('🌱 Starting database seeding...');
    await connectDatabase();

    await seedRoles();
    await seedSuperAdmin();
    await seedBuildingTypes();
    await seedUnitTypes();
    await seedFeatures();

    logger.info('🌱 All seeds completed successfully!');
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
}

runSeeds();
