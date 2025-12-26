# Cloud Functions v2: Patterns and Best Practices

## Introduction

Cloud Functions (2nd gen) is Google Cloud's next-generation serverless
functions platform built on Cloud Run. It provides better performance, more
control, and enhanced features compared to 1st generation functions.

This guide covers best practices, patterns, and optimization strategies for
Cloud Functions v2.

## What's New in v2

### Key Improvements

**Compared to v1:**
- Built on Cloud Run (better performance)
- Longer execution time (up to 60 minutes)
- More memory options (up to 32Gi)
- Better concurrency handling
- VPC connector support
- Cloud Build integration
- Eventarc integration

### When to Use v2

**Choose v2 when you need:**
- Longer execution times (> 9 minutes)
- More memory (> 8Gi)
- Better cold start performance
- VPC connectivity
- Event-driven architectures
- More control over execution environment

## Function Structure

### Basic Function

```javascript
// index.js
const functions = require('@google-cloud/functions-framework');

functions.http('helloWorld', (req, res) => {
  res.json({ message: 'Hello World!' });
});
```

```python
# main.py
import functions_framework

@functions_framework.http
def hello_world(request):
    return {'message': 'Hello World!'}
```

### Package Configuration

```json
// package.json
{
  "name": "my-function",
  "version": "1.0.0",
  "main": "index.js",
  "engines": {
    "node": "18"
  },
  "dependencies": {
    "@google-cloud/functions-framework": "^3.0.0"
  }
}
```

## Deployment

### Deploy HTTP Function

```bash
# Deploy function
gcloud functions deploy helloWorld \
  --gen2 \
  --runtime=nodejs18 \
  --region=us-central1 \
  --source=. \
  --entry-point=helloWorld \
  --trigger-http \
  --allow-unauthenticated
```

### Deploy Event-Driven Function

```bash
# Deploy with Pub/Sub trigger
gcloud functions deploy processMessage \
  --gen2 \
  --runtime=nodejs18 \
  --region=us-central1 \
  --source=. \
  --entry-point=processMessage \
  --trigger-topic=my-topic
```

### Deploy with Cloud Storage Trigger

```bash
# Deploy with storage trigger
gcloud functions deploy processFile \
  --gen2 \
  --runtime=nodejs18 \
  --region=us-central1 \
  --source=. \
  --entry-point=processFile \
  --trigger-bucket=my-bucket \
  --trigger-event-filters="type=google.storage.object.finalize"
```

## HTTP Functions

### Request Handling

```javascript
// Handle different HTTP methods
functions.http('apiHandler', (req, res) => {
  switch (req.method) {
    case 'GET':
      handleGet(req, res);
      break;
    case 'POST':
      handlePost(req, res);
      break;
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
});

function handleGet(req, res) {
  const { id } = req.query;
  res.json({ id, data: 'retrieved' });
}

function handlePost(req, res) {
  const { data } = req.body;
  // Process data
  res.json({ success: true });
}
```

### CORS Handling

```javascript
// Enable CORS
functions.http('apiHandler', (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Handle actual request
  res.json({ data: 'response' });
});
```

### Authentication

```bash
# Deploy with authentication required
gcloud functions deploy authenticatedFunction \
  --gen2 \
  --runtime=nodejs18 \
  --region=us-central1 \
  --source=. \
  --entry-point=authenticatedFunction \
  --trigger-http \
  --no-allow-unauthenticated
```

```javascript
// Verify authentication in function
functions.http('authenticatedFunction', (req, res) => {
  // Cloud Functions automatically validates identity token
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Process authenticated request
  res.json({ message: 'Authenticated request' });
});
```

## Event-Driven Functions

### Pub/Sub Trigger

```javascript
// Pub/Sub triggered function
functions.cloudEvent('processMessage', (cloudEvent) => {
  const message = JSON.parse(
    Buffer.from(cloudEvent.data.message.data, 'base64').toString()
  );
  
  console.log('Received message:', message);
  
  // Process message
  processMessage(message);
});

function processMessage(message) {
  // Your processing logic
}
```

```python
# Python Pub/Sub function
import functions_framework
import base64
import json

@functions_framework.cloud_event
def process_message(cloud_event):
    message_data = base64.b64decode(
        cloud_event.data["message"]["data"]
    ).decode('utf-8')
    message = json.loads(message_data)
    
    # Process message
    process_message_logic(message)
```

### Cloud Storage Trigger

```javascript
// Storage triggered function
functions.cloudEvent('processFile', (cloudEvent) => {
  const file = cloudEvent.data;
  const bucket = file.bucket;
  const name = file.name;
  
  console.log(`Processing file: gs://${bucket}/${name}`);
  
  // Process file
  processFile(bucket, name);
});
```

### Firestore Trigger

```javascript
// Firestore triggered function
functions.cloudEvent('onDocumentWrite', (cloudEvent) => {
  const document = cloudEvent.data.value;
  const documentId = document.name.split('/').pop();
  
  console.log('Document changed:', documentId);
  
  // Process document change
  processDocumentChange(document);
});
```

## Best Practices

### Cold Start Optimization

**Minimize cold start time.**

```javascript
// Initialize expensive resources at module load
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize once, reuse across invocations
const app = initializeApp();
const db = getFirestore(app);

// Cache connections
let dbConnection = null;

async function getDbConnection() {
  if (!dbConnection) {
    dbConnection = await createConnection();
  }
  return dbConnection;
}

functions.http('optimizedFunction', async (req, res) => {
  // Use pre-initialized resources
  const conn = await getDbConnection();
  const result = await conn.query('SELECT * FROM users');
  res.json(result);
});
```

**Strategies:**
- Initialize clients at module level
- Use connection pooling
- Cache compiled templates
- Lazy load heavy dependencies
- Minimize startup dependencies

### Error Handling

**Implement comprehensive error handling.**

```javascript
functions.http('robustFunction', async (req, res) => {
  try {
    // Main logic
    const result = await processRequest(req);
    res.json(result);
  } catch (error) {
    console.error('Error processing request:', error);
    
    // Log error details
    logger.error('Function error', {
      error: error.message,
      stack: error.stack,
      request: req.body
    });
    
    // Return appropriate error response
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});
```

### Retry Logic

**Implement retry for external calls.**

```javascript
async function retryOperation(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

functions.http('retryFunction', async (req, res) => {
  const result = await retryOperation(async () => {
    return await externalApi.call();
  });
  res.json(result);
});
```

### Timeout Management

**Handle long-running operations.**

```bash
# Set function timeout
gcloud functions deploy longRunningFunction \
  --gen2 \
  --runtime=nodejs18 \
  --timeout=540s \
  --region=us-central1
```

```javascript
// Use Promise.race for timeout
async function withTimeout(promise, timeoutMs) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), timeoutMs);
  });
  
  return Promise.race([promise, timeout]);
}

functions.http('timeoutFunction', async (req, res) => {
  try {
    const result = await withTimeout(
      longRunningOperation(),
      30000 // 30 seconds
    );
    res.json(result);
  } catch (error) {
    if (error.message === 'Timeout') {
      res.status(504).json({ error: 'Request timeout' });
    } else {
      throw error;
    }
  }
});
```

## Configuration

### Environment Variables

**Manage configuration through environment variables.**

```bash
# Set environment variables
gcloud functions deploy myFunction \
  --gen2 \
  --runtime=nodejs18 \
  --set-env-vars="DATABASE_URL=...,API_KEY=..." \
  --region=us-central1

# Or use .env.yaml
gcloud functions deploy myFunction \
  --gen2 \
  --runtime=nodejs18 \
  --env-vars-file=.env.yaml \
  --region=us-central1
```

```yaml
# .env.yaml
DATABASE_URL: "postgresql://..."
API_KEY: "secret-value"
LOG_LEVEL: "info"
ENVIRONMENT: "production"
```

### Secrets Management

**Use Secret Manager for sensitive data.**

```bash
# Grant secret access
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

# Access in function
```

```javascript
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

let cachedSecret = null;

async function getSecret(secretName) {
  if (!cachedSecret) {
    const [version] = await client.accessSecretVersion({
      name: `projects/PROJECT_ID/secrets/${secretName}/versions/latest`
    });
    cachedSecret = version.payload.data.toString();
  }
  return cachedSecret;
}

functions.http('secureFunction', async (req, res) => {
  const apiKey = await getSecret('API_KEY');
  // Use API key
  res.json({ success: true });
});
```

### Memory and CPU Configuration

**Right-size function resources.**

```bash
# Set memory and CPU
gcloud functions deploy myFunction \
  --gen2 \
  --runtime=nodejs18 \
  --memory=2Gi \
  --cpu=2 \
  --region=us-central1
```

**Guidelines:**
- Start with 256Mi and monitor
- Increase if seeing OOM errors
- CPU scales with memory (1 CPU per 1.8Gi)
- Monitor actual usage and adjust

## VPC Connectivity

### VPC Connector Setup

**Connect to private resources.**

```bash
# Create VPC connector
gcloud compute networks vpc-access connectors create CONNECTOR_NAME \
  --region=us-central1 \
  --network=VPC_NETWORK \
  --range=10.8.0.0/28

# Deploy function with VPC connector
gcloud functions deploy myFunction \
  --gen2 \
  --runtime=nodejs18 \
  --vpc-connector=CONNECTOR_NAME \
  --egress-settings=private-ranges-only \
  --region=us-central1
```

**Use cases:**
- Access Cloud SQL private IP
- Connect to on-premises resources
- Access other VPC resources
- Enhanced security

## Monitoring and Logging

### Structured Logging

**Use structured logging for better observability.**

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

functions.http('loggedFunction', (req, res) => {
  logger.info('Function invoked', {
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  });
  
  res.json({ success: true });
});
```

### Custom Metrics

**Export custom metrics.**

```javascript
const { globalStats, MeasureUnit } = require('@opencensus/core');

const requestCount = globalStats.createMeasureInt64(
  'function_requests',
  MeasureUnit.UNIT,
  'Number of function requests'
);

functions.http('metricFunction', (req, res) => {
  globalStats.record([{
    measure: requestCount,
    value: 1
  }]);
  
  res.json({ success: true });
});
```

## Testing

### Local Testing

**Test functions locally before deployment.**

```bash
# Install Functions Framework
npm install -g @google-cloud/functions-framework

# Run function locally
functions-framework --target=helloWorld --port=8080
```

```javascript
// Test with curl
// curl http://localhost:8080
```

### Unit Testing

**Write unit tests for function logic.**

```javascript
// function.js
exports.helloWorld = (req, res) => {
  const name = req.query.name || 'World';
  res.json({ message: `Hello ${name}!` });
};

// function.test.js
const { helloWorld } = require('./function');

test('returns greeting with name', () => {
  const req = { query: { name: 'Test' } };
  const res = {
    json: jest.fn()
  };
  
  helloWorld(req, res);
  
  expect(res.json).toHaveBeenCalledWith({
    message: 'Hello Test!'
  });
});
```

## Common Patterns

### API Gateway Pattern

**Multiple functions behind API Gateway.**

```bash
# Deploy multiple functions
gcloud functions deploy users-api --gen2 --trigger-http
gcloud functions deploy orders-api --gen2 --trigger-http
gcloud functions deploy products-api --gen2 --trigger-http

# Route through API Gateway or Load Balancer
```

### Chained Functions

**Chain functions together.**

```javascript
// Function 1: Process input
functions.cloudEvent('processInput', async (cloudEvent) => {
  const result = await process(cloudEvent.data);
  
  // Publish to next topic
  await pubsub.topic('processed-data').publishMessage({
    json: result
  });
});

// Function 2: Handle processed data
functions.cloudEvent('handleProcessed', async (cloudEvent) => {
  const data = cloudEvent.data;
  await handle(data);
});
```

### Fan-Out Pattern

**Process multiple items in parallel.**

```javascript
functions.cloudEvent('fanOut', async (cloudEvent) => {
  const items = cloudEvent.data.items;
  
  // Process items in parallel
  const promises = items.map(item => processItem(item));
  await Promise.all(promises);
});
```

## Migration from v1

### Key Differences

**What changes when migrating:**

1. **Runtime:** Uses Cloud Run instead of Cloud Functions runtime
2. **Deployment:** `--gen2` flag required
3. **Triggers:** Eventarc for event-driven functions
4. **Timeout:** Up to 60 minutes (vs 9 minutes)
5. **Memory:** Up to 32Gi (vs 8Gi)
6. **Cold starts:** Generally faster

### Migration Steps

```bash
# Old v1 deployment
gcloud functions deploy myFunction \
  --runtime=nodejs14 \
  --trigger-http

# New v2 deployment
gcloud functions deploy myFunction \
  --gen2 \
  --runtime=nodejs18 \
  --trigger-http
```

**Code changes:**
- Update Functions Framework to v3+
- Update runtime to supported version
- Test thoroughly before production cutover

## Conclusion

Cloud Functions v2 best practices:

1. **Use v2 for:** Better performance, longer timeouts, more memory
2. **Optimize:** Cold starts, error handling, retry logic
3. **Configure:** Environment variables, secrets, VPC connectivity
4. **Monitor:** Structured logging, custom metrics
5. **Test:** Local testing, unit tests
6. **Patterns:** API gateway, chained functions, fan-out

**Key takeaways:**
- v2 provides significant improvements over v1
- Optimize for cold starts
- Use Secret Manager for sensitive data
- Implement proper error handling
- Monitor and log effectively
- Test locally before deployment

Remember: Cloud Functions v2 is built on Cloud Run, so many Cloud Run best
practices also apply to Functions v2.
