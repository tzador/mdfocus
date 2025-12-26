# Bun: Built-in APIs

## Introduction

Bun provides many built-in APIs that eliminate the need for external
dependencies. These native implementations are faster and more efficient than
their Node.js counterparts.

This guide covers Bun's built-in APIs including fetch, file system, and other
native features.

## Fetch API

### Basic Usage

**Native fetch (no need for node-fetch):**
```typescript
// Simple GET request
const response = await fetch('https://api.example.com/data');
const data = await response.json();
console.log(data);

// POST request
const response = await fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ key: 'value' }),
});
```

### Advanced Fetch

**Request options:**
```typescript
const response = await fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token',
  },
  body: JSON.stringify({ data: 'value' }),
  // Bun-specific options
  verbose: true, // Log request details
});
```

**Streaming responses:**
```typescript
const response = await fetch('https://example.com/large-file');
const reader = response.body?.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // Process chunk
  console.log(value);
}
```

## File System APIs

### Reading Files

**Synchronous read:**
```typescript
import { readFileSync } from 'fs';

const content = readFileSync('file.txt', 'utf-8');
console.log(content);
```

**Asynchronous read:**
```typescript
import { readFile } from 'fs/promises';

const content = await readFile('file.txt', 'utf-8');
console.log(content);
```

**Bun's native file API:**
```typescript
// Bun's faster file API
const file = Bun.file('file.txt');
const content = await file.text();
const json = await file.json(); // If JSON
const arrayBuffer = await file.arrayBuffer();
```

### Writing Files

**Synchronous write:**
```typescript
import { writeFileSync } from 'fs';

writeFileSync('output.txt', 'content');
```

**Asynchronous write:**
```typescript
import { writeFile } from 'fs/promises';

await writeFile('output.txt', 'content');
```

**Bun's native write:**
```typescript
await Bun.write('output.txt', 'content');
await Bun.write('output.json', JSON.stringify({ data: 'value' }));
```

### File Operations

**File info:**
```typescript
const file = Bun.file('file.txt');
console.log(file.size);
console.log(file.type);
console.log(file.lastModified);
```

**Directory operations:**
```typescript
import { readdir, mkdir, rmdir } from 'fs/promises';

// Read directory
const files = await readdir('./directory');

// Create directory
await mkdir('./new-directory', { recursive: true });

// Remove directory
await rmdir('./directory');
```

## Process APIs

### Environment Variables

**Access environment variables:**
```typescript
// Read environment variable
const apiKey = process.env.API_KEY;

// Set environment variable
process.env.NODE_ENV = 'production';

// All environment variables
console.log(process.env);
```

### Command Line Arguments

**Access CLI arguments:**
```typescript
// Get arguments
const args = process.argv.slice(2);
console.log(args);

// Example: bun script.ts arg1 arg2
// args = ['arg1', 'arg2']
```

### Exit Codes

**Exit process:**
```typescript
// Exit with code
process.exit(0); // Success
process.exit(1); // Error

// Or use Bun.exit
Bun.exit(0);
```

## Stream APIs

### Readable Streams

**Create readable stream:**
```typescript
import { Readable } from 'stream';

const stream = new Readable({
  read() {
    this.push('data');
    this.push(null); // End stream
  },
});
```

### Writable Streams

**Create writable stream:**
```typescript
import { Writable } from 'stream';

const stream = new Writable({
  write(chunk, encoding, callback) {
    console.log(chunk.toString());
    callback();
  },
});
```

### Transform Streams

**Create transform stream:**
```typescript
import { Transform } from 'stream';

const transform = new Transform({
  transform(chunk, encoding, callback) {
    const upper = chunk.toString().toUpperCase();
    callback(null, upper);
  },
});
```

## Crypto APIs

### Hashing

**Create hash:**
```typescript
import { createHash } from 'crypto';

const hash = createHash('sha256');
hash.update('data');
const digest = hash.digest('hex');
console.log(digest);
```

### Encryption

**Encrypt/decrypt:**
```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const algorithm = 'aes-256-cbc';
const key = randomBytes(32);
const iv = randomBytes(16);

// Encrypt
const cipher = createCipheriv(algorithm, key, iv);
let encrypted = cipher.update('data', 'utf8', 'hex');
encrypted += cipher.final('hex');

// Decrypt
const decipher = createDecipheriv(algorithm, key, iv);
let decrypted = decipher.update(encrypted, 'hex', 'utf8');
decrypted += decipher.final('utf8');
```

## HTTP Server

### Native Server

**Create HTTP server:**
```typescript
const server = Bun.serve({
  port: 3000,
  fetch(request) {
    return new Response('Hello from Bun!');
  },
});

console.log(`Server running at http://localhost:${server.port}`);
```

### Advanced Server

**Full server configuration:**
```typescript
const server = Bun.serve({
  port: 3000,
  hostname: '0.0.0.0',
  fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/') {
      return new Response('Home');
    }
    
    if (url.pathname === '/api') {
      return Response.json({ message: 'API response' });
    }
    
    return new Response('Not found', { status: 404 });
  },
  error(error) {
    return new Response('Error: ' + error.message, { status: 500 });
  },
});
```

### WebSocket Support

**WebSocket server:**
```typescript
const server = Bun.serve({
  port: 3000,
  fetch(request, server) {
    if (server.upgrade(request)) {
      return; // Upgrade to WebSocket
    }
    return new Response('HTTP server');
  },
  websocket: {
    message(ws, message) {
      ws.send(`Echo: ${message}`);
    },
    open(ws) {
      console.log('WebSocket opened');
    },
    close(ws) {
      console.log('WebSocket closed');
    },
  },
});
```

## Database APIs

### SQLite

**Built-in SQLite:**
```typescript
import { Database } from 'bun:sqlite';

const db = new Database('database.sqlite');

// Create table
db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)');

// Insert
db.run('INSERT INTO users (name) VALUES (?)', ['John']);

// Query
const users = db.query('SELECT * FROM users').all();
console.log(users);
```

## Testing APIs

### Test Runner

**Built-in test runner:**
```typescript
import { test, expect } from 'bun:test';

test('addition', () => {
  expect(1 + 1).toBe(2);
});

test('async operation', async () => {
  const response = await fetch('https://api.example.com');
  expect(response.ok).toBe(true);
});
```

## Utility APIs

### JSON

**JSON operations:**
```typescript
// Parse JSON
const data = JSON.parse('{"key": "value"}');

// Stringify JSON
const json = JSON.stringify({ key: 'value' });

// Bun's fast JSON
const parsed = Bun.JSON.parse(json);
const stringified = Bun.JSON.stringify(data);
```

### URL

**URL parsing:**
```typescript
const url = new URL('https://example.com/path?query=value');
console.log(url.hostname); // example.com
console.log(url.pathname); // /path
console.log(url.searchParams.get('query')); // value
```

## Best Practices

1. **Use native APIs:** Prefer Bun's native implementations
2. **Leverage speed:** Native APIs are faster
3. **Reduce dependencies:** Fewer packages to manage
4. **Type safety:** Use TypeScript for better DX
5. **Error handling:** Always handle errors properly

## Conclusion

Bun's built-in APIs provide:
- **Native fetch:** No need for node-fetch
- **Fast file I/O:** Optimized file operations
- **HTTP server:** Built-in web server
- **WebSocket support:** Native WebSocket server
- **SQLite:** Built-in database
- **Test runner:** Built-in testing

**Key takeaways:**
- Use native APIs when available
- Leverage performance benefits
- Reduce external dependencies
- Take advantage of Bun-specific features

Remember: Bun's built-in APIs are optimized for performance and eliminate the
need for many external dependencies.
