/**
 * ============================================================================
 * OPTION 1: RELATIONAL SCHEMA DESIGN (PostgreSQL + Drizzle ORM)
 * Ideal for audits, strict constraints, and transactional consistency.
 * ============================================================================
 * 
 * Below is the schema configuration for Drizzle ORM:
 * 
 * ```typescript
 * import { pgTable, text, timestamp, integer, boolean, uniqueIndex } from 'drizzle-orm/pg-core';
 * import { sql } from 'drizzle-orm';
 * 
 * // 1. Users Table
 * export const users = pgTable('users', {
 *   id: text('id').primaryKey(),
 *   gameCode: text('game_code').notNull().unique(), // Unique 6-character game code
 *   createdAt: timestamp('created_at').defaultNow().notNull(),
 *   updatedAt: timestamp('updated_at').defaultNow().notNull(),
 * });
 * 
 * // 2. Unlocked Cromos (Stickers) Table
 * export const unlockedStickers = pgTable('unlocked_stickers', {
 *   id: text('id').primaryKey(), // unique record uuid
 *   userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
 *   stickerId: text('sticker_id').notNull(), // e.g., "ar-10", "br-7"
 *   country: text('country').notNull(), // stored denormalized for country completion calculations
 *   unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
 * }, (table) => {
 *   return {
 *     userStickerUnique: uniqueIndex('user_sticker_unique_idx').on(table.userId, table.stickerId),
 *   };
 * });
 * ```
 */

// Dynamic transactional scoring query implemented with raw SQL / Drizzle.
// Under this relational schema, we calculate score directly using a CTE:
//   - 1 point per sticker.
//   - 5 points per country completed (exactly 26 stickers for the country).
export const GET_LEADERBOARD_SQL_QUERY = `
  WITH user_sticker_counts AS (
    SELECT 
      user_id,
      COUNT(sticker_id) AS sticker_count
    FROM unlocked_stickers
    GROUP BY user_id
  ),
  user_completed_countries AS (
    SELECT 
      user_id,
      COUNT(country) AS completed_countries_count,
      ARRAY_AGG(country) AS completed_countries_list
    FROM (
      SELECT 
        user_id, 
        country
      FROM unlocked_stickers
      GROUP BY user_id, country
      HAVING COUNT(sticker_id) = 26 -- Exactly 26 stickers completes a country
    ) completed_subquery
    GROUP BY user_id
  )
  SELECT 
    u.id,
    u.game_code,
    COALESCE(sc.sticker_count, 0) AS unlocked_stickers_count,
    COALESCE(cc.completed_countries_count, 0) AS completed_countries_count,
    COALESCE(cc.completed_countries_list, '{}') AS completed_countries,
    -- Calculation rule: 1 point per sticker + 5 points bonus per completed country
    (COALESCE(sc.sticker_count, 0) * 1) + (COALESCE(cc.completed_countries_count, 0) * 5) AS total_score
  FROM users u
  LEFT JOIN user_sticker_counts sc ON u.id = sc.user_id
  LEFT JOIN user_completed_countries cc ON u.id = cc.user_id
  ORDER BY total_score DESC, u.created_at ASC;
`;


/**
 * ============================================================================
 * OPTION 2: NOSQL SCHEMA DESIGN (MongoDB + Mongoose)
 * Ideal for fast lookups, heavy read volume, and horizontal scaling.
 * ============================================================================
 * 
 * ```typescript
 * import mongoose, { Schema, Document } from 'mongoose';
 * 
 * export interface IUserDocument extends Document {
 *   id: string;               // Unique Auth0/Firebase ID
 *   gameCode: string;         // Unique game code
 *   unlockedStickers: string[]; // Set/Array of unlocked sticker IDs
 *   completedCountries: string[]; // List of completed countries cached
 *   unlockedStickersCount: number; // Pre-aggregated/cached count
 *   totalScore: number;       // Pre-aggregated/cached total score
 *   createdAt: Date;
 *   updatedAt: Date;
 * }
 * 
 * const UserSchema = new Schema<IUserDocument>({
 *   id: { type: String, required: true, unique: true, index: true },
 *   gameCode: { type: String, required: true, unique: true, index: true },
 *   unlockedStickers: [{ type: String, index: true }], // Indexed for quick lookups
 *   completedCountries: [{ type: String }],
 *   unlockedStickersCount: { type: Number, default: 0 },
 *   totalScore: { type: Number, default: 0 },
 * }, {
 *   timestamps: true
 * });
 * 
 * // To optimize real-time ranking queries, we keep a compound index on totalScore and createdAt
 * UserSchema.index({ totalScore: -1, createdAt: 1 });
 * 
 * // Atomic Trigger / Pre-save Hook for transactional consistency:
 * // Recalculate Completed Countries, unlockedStickersCount, and totalScore upon modified stickers list.
 * UserSchema.pre('save', async function(next) {
 *   if (this.isModified('unlockedStickers')) {
 *     this.unlockedStickersCount = this.unlockedStickers.length;
 *     // recalculate total scores
 *   }
 *   next();
 * });
 * 
 * export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
 * ```
 */


/**
 * ============================================================================
 * GLOBAL AUDITABLE RAFFLE ELIGIBILITY UTILITY
 * Determines eligibility prizes for the Top 3 Ranking players in real-time.
 * ============================================================================
 */
export function assignRaffleEligibility(rank: number): 'Auto Híbrido' | 'Final Champions League' | 'Teléfono Gama Alta' | 'Ninguno' {
  if (rank === 1) return 'Auto Híbrido';
  if (rank === 2) return 'Final Champions League';
  if (rank === 3) return 'Teléfono Gama Alta';
  return 'Ninguno';
}

