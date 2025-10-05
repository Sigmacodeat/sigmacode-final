import {
  pgTable,
  text,
  timestamp as pgTimestamp,
  boolean,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';

// Resource Type Enum
export const dacResourceType = pgEnum('dac_resource_type', [
  'dataset',
  'workflow',
  'agent',
  'document',
  'project',
  'folder',
]);

// Permission Enum
export const dacPermission = pgEnum('dac_permission', [
  'read',
  'write',
  'delete',
  'share',
  'admin',
]);

export const dacPermissions = pgTable(
  'dac_permissions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    resourceType: dacResourceType('resource_type').notNull(),
    resourceId: text('resource_id').notNull(),
    permission: dacPermission('permission').notNull(),
    active: boolean('active').default(true).notNull(),
    createdBy: text('created_by'),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    userIdIdx: index('dac_permissions_user_id_idx').on(t.userId),
    resourceTypeIdx: index('dac_permissions_resource_type_idx').on(t.resourceType),
    resourceIdIdx: index('dac_permissions_resource_id_idx').on(t.resourceId),
    activeIdx: index('dac_permissions_active_idx').on(t.active),
    compositeIdx: index('dac_permissions_composite_idx').on(
      t.userId,
      t.resourceType,
      t.resourceId,
      t.active,
    ),
  }),
);

// Export table as well for direct usage
export { dacPermissions as dacPermissionsTable };

// Types
// Export the enums with the same names as used in the DAC system
export { dacResourceType as DacResourceType };
export { dacPermission as DacPermission };

export type DacPermissionRecord = typeof dacPermissions.$inferSelect;
export type NewDacPermission = typeof dacPermissions.$inferInsert;
