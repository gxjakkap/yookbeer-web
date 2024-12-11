import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const db = drizzle(pool)

async function runMigrate() {
  console.log('⏳ Running migrations...')

  try {
    await migrate(db, { migrationsFolder: '@/../drizzle/migrations' })
    console.log('✅ Migrations completed')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed', error)
    process.exit(1)
  }
}

runMigrate()