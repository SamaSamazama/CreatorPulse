import { neon, NeonDbError } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  const fs = await import('fs');
  const path = await import('path');
  const filePath = path.join(process.cwd(), 'drizzle', '0002_add_missing_features.sql');
  const content = fs.readFileSync(filePath, 'utf8');
  const statements = content.split(';').map(s => s.trim()).filter(Boolean);
  for (const statement of statements) {
    console.log('Executing:', statement.slice(0, 120));
    try {
      await sql.query(statement);
      console.log('OK');
    } catch (e: any) {
      if (e instanceof Error && /already exists/i.test(e.message)) {
        console.log('Skipped:', e.message);
      } else {
        throw e;
      }
    }
  }
  console.log('Migration applied');
}
main().catch((e) => { console.error(e); process.exit(1); });
