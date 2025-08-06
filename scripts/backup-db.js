const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', 'backups');
  const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log('🗄️  Creating database backup...');

  const command = `pg_dump "${process.env.DATABASE_URL}" > "${backupFile}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Backup failed:', error);
      return;
    }

    if (stderr) {
      console.error('⚠️  Backup warnings:', stderr);
    }

    console.log(`✅ Backup created successfully: ${backupFile}`);
    
    // Clean up old backups (keep only last 10)
    cleanupOldBackups(backupDir);
  });
}

function cleanupOldBackups(backupDir) {
  try {
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('backup-') && file.endsWith('.sql'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    // Keep only the 10 most recent backups
    const filesToDelete = files.slice(10);
    
    filesToDelete.forEach(file => {
      fs.unlinkSync(file.path);
      console.log(`🗑️  Deleted old backup: ${file.name}`);
    });

    if (filesToDelete.length > 0) {
      console.log(`🧹 Cleaned up ${filesToDelete.length} old backup(s)`);
    }
  } catch (error) {
    console.error('⚠️  Failed to cleanup old backups:', error);
  }
}

function restoreBackup(backupFile) {
  if (!fs.existsSync(backupFile)) {
    console.error('❌ Backup file not found:', backupFile);
    return;
  }

  console.log('🔄 Restoring database from backup...');
  console.log('⚠️  WARNING: This will overwrite the current database!');

  const command = `psql "${process.env.DATABASE_URL}" < "${backupFile}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Restore failed:', error);
      return;
    }

    if (stderr) {
      console.error('⚠️  Restore warnings:', stderr);
    }

    console.log('✅ Database restored successfully');
  });
}

// Command line interface
const command = process.argv[2];
const backupFile = process.argv[3];

switch (command) {
  case 'backup':
    createBackup();
    break;
  case 'restore':
    if (!backupFile) {
      console.error('❌ Please provide a backup file path');
      console.log('Usage: node backup-db.js restore <backup-file-path>');
      process.exit(1);
    }
    restoreBackup(backupFile);
    break;
  case 'list':
    const backupDir = path.join(__dirname, '..', 'backups');
    if (fs.existsSync(backupDir)) {
      const backups = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('backup-') && file.endsWith('.sql'))
        .sort()
        .reverse();
      
      console.log('📋 Available backups:');
      backups.forEach(backup => {
        const filePath = path.join(backupDir, backup);
        const stats = fs.statSync(filePath);
        console.log(`  ${backup} (${(stats.size / 1024 / 1024).toFixed(2)} MB) - ${stats.mtime.toISOString()}`);
      });
    } else {
      console.log('📋 No backups found');
    }
    break;
  default:
    console.log('Usage:');
    console.log('  node backup-db.js backup          - Create a new backup');
    console.log('  node backup-db.js restore <file>  - Restore from backup');
    console.log('  node backup-db.js list            - List available backups');
    break;
}

module.exports = { createBackup, restoreBackup };