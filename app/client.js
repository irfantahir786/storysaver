const { createClient } = require('redis');

async function main() {
  // Connect to Redis on localhost
  const client = createClient({
    socket: {
      host: '127.0.0.1',
      port: 6379
    }
    // If you have a password, add: password: 'yourpassword'
  });

  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  await client.quit();
}

main();
