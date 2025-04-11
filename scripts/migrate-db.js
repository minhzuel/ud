const { execSync } = require('child_process');

// This script is used to run database migrations in production
async function main() {
  try {
    console.log('Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    console.log('Running seed...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
    
    console.log('All database operations completed successfully');
  } catch (error) {
    console.error('Error running database operations:', error);
    process.exit(1);
  }
}

main(); 