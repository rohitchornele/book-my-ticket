import { boolean, pgTable, serial, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'


export const seats = pgTable('seats', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  userId: uuid('user_id'),
  isbooked: boolean('isbooked').default(false)
});

export const userTable = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),

    firstName: varchar('first_name', { length: 64 }).notNull(),
    lastName: varchar('last_name', { length: 64 }),

    email: varchar('email', { length: 322 }).notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),

    password: varchar('password', { length: 66 }),
    salt: text('salt'),

    role: varchar('role', {enum : ["customer", "cinema", "admin"]}).default("customer"),

    verificationToken: text('verification_token'),
    refreshToken: text('refresh_token'),
    resetPasswordToken: text('reset_password_token'),
    resetPasswordExpires: text('rest_password_expires'),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
})