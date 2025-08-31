const token = process.argv[2];
if (!token) {
  console.log('No token provided');
  process.exit(1);
}

try {
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.log('Invalid JWT token format');
    process.exit(1);
  }
  
  const payload = parts[1];
  // Add padding if needed
  const padded = payload + '='.repeat((4 - payload.length % 4) % 4);
  const decoded = Buffer.from(padded, 'base64').toString('utf8');
  console.log('JWT Payload:');
  console.log(JSON.stringify(JSON.parse(decoded), null, 2));
} catch (error) {
  console.log('Error decoding token:', error.message);
}
