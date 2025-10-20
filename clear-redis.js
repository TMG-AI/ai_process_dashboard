// Quick script to clear ALL Redis data
// Run with: node clear-redis.js

const { Redis } = require('@upstash/redis');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.+)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const redis = new Redis({
  url: envVars.AI_KV_REST_API_URL,
  token: envVars.AI_KV_REST_API_TOKEN,
});

const TEMP_USER_ID = 'user_local_dev';

async function clearAllData() {
  try {
    console.log('🗑️  Clearing ALL Redis data...\n');

    const keys = [
      `user:${TEMP_USER_ID}:projects`,
      `user:${TEMP_USER_ID}:timelogs`,
      `user:${TEMP_USER_ID}:debuglogs`,
      `user:${TEMP_USER_ID}:learninglogs`,
      `user:${TEMP_USER_ID}:requests`,
    ];

    for (const key of keys) {
      console.log(`Deleting: ${key}`);
      await redis.del(key);
    }

    console.log('\n✅ All data cleared!');
    console.log('Analytics should now show all zeros.');
    console.log('Hard refresh your browser (Cmd+Shift+R) to see the changes.\n');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

clearAllData();
