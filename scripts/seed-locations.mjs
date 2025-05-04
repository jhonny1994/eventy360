import fs from 'fs/promises';
import path from 'path';
import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedLocations() {
  const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL, // Ensure SUPABASE_DB_URL is in .env.local
  });

  const client = await pool.connect();
  console.log('Connected to database.');

  try {
    // Read wilayas.json
    const jsonPath = path.resolve(process.cwd(), 'wilayas.json');
    const jsonData = await fs.readFile(jsonPath, 'utf8');
    const wilayasData = JSON.parse(jsonData);
    console.log(`Read ${wilayasData.length} wilayas from wilayas.json.`);

    // Start transaction
    await client.query('BEGIN');
    console.log('Transaction started.');

    // Clear existing data (optional, but good for repeatable seeding)
    console.log('Clearing existing dairas and wilayas...');
    await client.query('TRUNCATE TABLE public.dairas CASCADE');
    await client.query('TRUNCATE TABLE public.wilayas CASCADE');

    let insertedWilayas = 0;
    let insertedDairas = 0;

    // Seed Wilayas
    console.log('Seeding wilayas...');
    for (const wilaya of wilayasData) {
      const wilayaId = parseInt(wilaya.code, 10); // Use code as INT ID as per corrected schema
      if (isNaN(wilayaId)) {
          console.warn(`Skipping wilaya with invalid code: ${wilaya.code}`);
          continue;
      }
      await client.query(
        'INSERT INTO public.wilayas (id, name_ar, name_other) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [wilayaId, wilaya.arabic_name, wilaya.name]
      );
      insertedWilayas++;

      // Seed Dairas for this Wilaya
      if (wilaya.dairas && Array.isArray(wilaya.dairas)) {
        for (const daira of wilaya.dairas) {
           const dairaId = parseInt(daira.code, 10); // Use code as INT ID
           if (isNaN(dairaId)) {
               console.warn(`Skipping daira with invalid code: ${daira.code} in wilaya ${wilayaId}`);
               continue;
           }
           await client.query(
            'INSERT INTO public.dairas (id, wilaya_id, name_ar, name_other) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
            [dairaId, wilayaId, daira.arabic_name, daira.name]
           );
           insertedDairas++;
        }
      }
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log('Transaction committed.');
    console.log(`Successfully seeded ${insertedWilayas} wilayas and ${insertedDairas} dairas.`);

  } catch (error) {
    // Rollback transaction in case of error
    await client.query('ROLLBACK');
    console.error('Error during seeding, transaction rolled back:', error);
    process.exitCode = 1; // Indicate failure
  } finally {
    // Release client connection
    client.release();
    await pool.end();
    console.log('Database connection closed.');
  }
}

seedLocations(); 