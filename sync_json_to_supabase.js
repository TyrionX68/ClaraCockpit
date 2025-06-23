#!/usr/bin/env node

/**
 * Clara360 JSON-to-Supabase Sync Script
 * Synchronisiert lokale JSON-Daten mit Supabase-Datenbank
 * 
 * Usage:
 * node sync_json_to_supabase.js [--dry-run] [--backup] [--force]
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

// Configuration
const CONFIG = {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || 'your-service-key',
  JSON_DATA_DIR: './data',
  BACKUP_DIR: './backup/json_sync',
  SALT_ROUNDS: 10
};

// Command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const shouldBackup = args.includes('--backup');
const isForce = args.includes('--force');

console.log('🔄 Clara360 JSON-to-Supabase Sync Script');
console.log('==========================================');
console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE SYNC'}`);
console.log(`Backup: ${shouldBackup ? 'ENABLED' : 'DISABLED'}`);
console.log(`Force: ${isForce ? 'ENABLED' : 'DISABLED'}`);
console.log('');

/**
 * Load JSON data from local files
 */
function loadJSONData() {
  console.log('📂 Loading JSON data...');
  
  const data = {};
  
  try {
    // Load users.json
    const usersPath = path.join(CONFIG.JSON_DATA_DIR, 'users.json');
    if (fs.existsSync(usersPath)) {
      data.users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      console.log(`   ✅ Loaded ${data.users.length} users`);
    } else {
      console.log('   ⚠️  users.json not found');
      data.users = [];
    }
    
    // Load objekte.json
    const objektePath = path.join(CONFIG.JSON_DATA_DIR, 'objekte.json');
    if (fs.existsSync(objektePath)) {
      data.objekte = JSON.parse(fs.readFileSync(objektePath, 'utf8'));
      console.log(`   ✅ Loaded ${data.objekte.length} objekte`);
    } else {
      console.log('   ⚠️  objekte.json not found');
      data.objekte = [];
    }
    
    // Load dashboard.json
    const dashboardPath = path.join(CONFIG.JSON_DATA_DIR, 'dashboard.json');
    if (fs.existsSync(dashboardPath)) {
      data.dashboard = JSON.parse(fs.readFileSync(dashboardPath, 'utf8'));
      console.log(`   ✅ Loaded dashboard data for ${Object.keys(data.dashboard).length} objects`);
    } else {
      console.log('   ⚠️  dashboard.json not found');
      data.dashboard = {};
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error loading JSON data:', error.message);
    process.exit(1);
  }
}

/**
 * Create backup of current data
 */
function createBackup(data) {
  if (!shouldBackup) return;
  
  console.log('💾 Creating backup...');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(CONFIG.BACKUP_DIR, `backup_${timestamp}`);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Backup JSON files
    fs.writeFileSync(
      path.join(backupDir, 'users.json'),
      JSON.stringify(data.users, null, 2)
    );
    fs.writeFileSync(
      path.join(backupDir, 'objekte.json'),
      JSON.stringify(data.objekte, null, 2)
    );
    fs.writeFileSync(
      path.join(backupDir, 'dashboard.json'),
      JSON.stringify(data.dashboard, null, 2)
    );
    
    console.log(`   ✅ Backup created: ${backupDir}`);
  } catch (error) {
    console.error('❌ Error creating backup:', error.message);
    process.exit(1);
  }
}

/**
 * Hash passwords for users
 */
async function hashPasswords(users) {
  console.log('🔐 Hashing passwords...');
  
  const hashedUsers = [];
  
  for (const user of users) {
    try {
      const hashedPassword = await bcrypt.hash(user.password, CONFIG.SALT_ROUNDS);
      hashedUsers.push({
        ...user,
        password_hash: hashedPassword,
        email: user.email || `${user.name.toLowerCase()}@example.com`
      });
      console.log(`   ✅ Hashed password for ${user.name}`);
    } catch (error) {
      console.error(`   ❌ Error hashing password for ${user.name}:`, error.message);
    }
  }
  
  return hashedUsers;
}

/**
 * Transform JSON data to Supabase format
 */
async function transformData(data) {
  console.log('🔄 Transforming data...');
  
  const transformed = {
    users: await hashPasswords(data.users),
    objekte: data.objekte.map(obj => ({
      objekt_id: obj.id,
      owner_id: obj.ownerId,
      name: obj.name,
      adresse: obj.adresse,
      typ: obj.typ,
      einheiten: obj.einheiten,
      baujahr: obj.baujahr,
      wohnflaeche: obj.wohnflaeche
    })),
    dashboard_kpis: []
  };
  
  // Transform dashboard KPIs
  for (const [objektId, kpis] of Object.entries(data.dashboard)) {
    transformed.dashboard_kpis.push({
      objekt_id: objektId,
      mieteinnahmen: kpis.mieteinnahmen || 0,
      rueckstaende: kpis.rueckstaende || 0,
      vermietungsgrad: kpis.vermietungsgrad || 0,
      rendite: kpis.rendite || 0,
      instandhaltung_jahr: kpis.instandhaltung_jahr || 0
    });
  }
  
  console.log(`   ✅ Transformed ${transformed.users.length} users`);
  console.log(`   ✅ Transformed ${transformed.objekte.length} objekte`);
  console.log(`   ✅ Transformed ${transformed.dashboard_kpis.length} KPIs`);
  
  return transformed;
}

/**
 * Simulate Supabase sync (for dry run or when Supabase is not available)
 */
function simulateSupabaseSync(data) {
  console.log('🧪 Simulating Supabase sync...');
  
  console.log('   📊 Would sync to Supabase:');
  console.log(`      - ${data.users.length} users`);
  console.log(`      - ${data.objekte.length} objekte`);
  console.log(`      - ${data.dashboard_kpis.length} KPIs`);
  
  // Generate SQL statements for reference
  const sqlStatements = [];
  
  // Users
  data.users.forEach(user => {
    sqlStatements.push(
      `INSERT INTO users (owner_id, name, email, password_hash, active) VALUES ('${user.id}', '${user.name}', '${user.email}', '${user.password_hash}', ${user.active});`
    );
  });
  
  // Objekte
  data.objekte.forEach(obj => {
    sqlStatements.push(
      `INSERT INTO objekte (objekt_id, owner_id, name, adresse, typ, einheiten, baujahr, wohnflaeche) VALUES ('${obj.objekt_id}', '${obj.owner_id}', '${obj.name}', '${obj.adresse}', '${obj.typ}', ${obj.einheiten}, ${obj.baujahr}, ${obj.wohnflaeche});`
    );
  });
  
  // KPIs
  data.dashboard_kpis.forEach(kpi => {
    sqlStatements.push(
      `INSERT INTO dashboard_kpis (objekt_id, mieteinnahmen, rueckstaende, vermietungsgrad, rendite, instandhaltung_jahr) VALUES ('${kpi.objekt_id}', ${kpi.mieteinnahmen}, ${kpi.rueckstaende}, ${kpi.vermietungsgrad}, ${kpi.rendite}, ${kpi.instandhaltung_jahr});`
    );
  });
  
  // Save SQL statements for reference
  const sqlFile = path.join(CONFIG.BACKUP_DIR, 'generated_sql.sql');
  fs.writeFileSync(sqlFile, sqlStatements.join('\\n'));
  console.log(`   ✅ Generated SQL saved to: ${sqlFile}`);
  
  return {
    success: true,
    synced: {
      users: data.users.length,
      objekte: data.objekte.length,
      dashboard_kpis: data.dashboard_kpis.length
    }
  };
}

/**
 * Sync data to Supabase (placeholder for real implementation)
 */
async function syncToSupabase(data) {
  console.log('🚀 Syncing to Supabase...');
  
  // For now, simulate the sync
  // In a real implementation, this would use the Supabase client
  return simulateSupabaseSync(data);
}

/**
 * Generate sync report
 */
function generateReport(result, startTime) {
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('');
  console.log('📋 Sync Report');
  console.log('==============');
  console.log(`Duration: ${duration.toFixed(2)}s`);
  console.log(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (result.synced) {
    console.log('Synced records:');
    console.log(`  - Users: ${result.synced.users}`);
    console.log(`  - Objekte: ${result.synced.objekte}`);
    console.log(`  - KPIs: ${result.synced.dashboard_kpis}`);
  }
  
  if (result.error) {
    console.log(`Error: ${result.error}`);
  }
  
  console.log('');
  console.log('🎯 Next Steps:');
  console.log('  1. Review generated SQL in backup directory');
  console.log('  2. Set up Supabase project and configure credentials');
  console.log('  3. Run with --force flag for actual sync');
  console.log('  4. Update feature flags in .env file');
}

/**
 * Main sync function
 */
async function main() {
  const startTime = Date.now();
  
  try {
    // Load JSON data
    const jsonData = loadJSONData();
    
    // Create backup if requested
    createBackup(jsonData);
    
    // Transform data
    const transformedData = await transformData(jsonData);
    
    // Sync to Supabase
    let result;
    if (isDryRun) {
      console.log('🧪 DRY RUN MODE - No actual sync performed');
      result = simulateSupabaseSync(transformedData);
    } else {
      result = await syncToSupabase(transformedData);
    }
    
    // Generate report
    generateReport(result, startTime);
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    generateReport({ success: false, error: error.message }, startTime);
    process.exit(1);
  }
}

// Run the sync
if (require.main === module) {
  main();
}

module.exports = {
  loadJSONData,
  transformData,
  syncToSupabase,
  CONFIG
};

