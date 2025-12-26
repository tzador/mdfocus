# Cloud Run: Best Practices and Patterns

## Introduction

Cloud Run is a fully managed serverless platform that automatically scales
containerized applications. It provides a balance between flexibility (any
container) and simplicity (no infrastructure management).

This guide covers best practices, patterns, and optimization strategies for
building production-ready applications on Cloud Run.

## Core Concepts

### How Cloud Run Works

**Key characteristics:**

- Request-driven: Scales to zero when no traffic
- Container-based: Use any language/framework
- HTTP/HTTPS: Standard web protocols
- Automatic scaling: From 0 to N instances
- Pay-per-use: Only pay for request processing time

### Request Lifecycle

1. **Request arrives** → Cloud Run routes to available instance
2. **Cold start** (if needed) → Container starts, app initializes
3. **Request processing** → Application handles request
4. **Response sent** → Request completes
5. **Idle timeout** → Instance may be terminated after inactivity

## Container Best Practices

### Optimize Container Images

**Smaller images = faster cold starts = better user experience.**

```dockerfile
# Multi-stage build example
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .
USER nodejs
EXPOSE 8080
CMD ["node", "server.js"]
```

**Optimization strategies:**

- Use Alpine or distroless base images
- Multi-stage builds to reduce final image size
- Remove unnecessary files and dependencies
- Use .dockerignore to exclude build artifacts
- Target specific architectures (linux/amd64)

### Health Checks

**Implement proper health check endpoints.**

```javascript
// Express.js example
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Readiness check (dependencies ready)
app.get("/ready", async (req, res) => {
  try {
    await checkDatabase();
    await checkCache();
    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false, error: error.message });
  }
});
```

**Best practices:**

- Implement /health for liveness
- Implement /ready for readiness
- Keep checks lightweight and fast
- Don't include external dependencies in liveness
- Return appropriate HTTP status codes

### Port Configuration

**Cloud Run requires listening on the PORT environment variable.**

```javascript
// Node.js example
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
```

```python
# Python example
import os
from flask import Flask

app = Flask(__name__)
port = int(os.environ.get('PORT', 8080))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port)
```

**Important:**

- Always use PORT environment variable
- Listen on 0.0.0.0 (all interfaces)
- Don't hardcode port numbers
- Default to 8080 for local development

## Performance Optimization

### Cold Start Reduction

**Minimize cold start time for better user experience.**

```javascript
// Lazy load heavy dependencies
let heavyLibrary = null;

async function getHeavyLibrary() {
  if (!heavyLibrary) {
    heavyLibrary = await import("./heavy-library");
  }
  return heavyLibrary;
}

// Initialize connections outside request handler
const dbConnection = initializeDatabase();

exports.handleRequest = async (req, res) => {
  // Use pre-initialized connection
  const result = await dbConnection.query("SELECT * FROM users");
  res.json(result);
};
```

**Strategies:**

- Initialize expensive resources at module load
- Use connection pooling for databases
- Cache compiled templates and configurations
- Minimize startup dependencies
- Use global variables for reusable objects

### Concurrency Configuration

**Balance cost and latency with proper concurrency settings.**

```yaml
# cloud-run-service.yaml
apiVersion: serving.knative.dev/v1
kind: Service
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/cpu-throttling: "true"
        run.googleapis.com/execution-environment: gen2
    spec:
      containerConcurrency: 80 # Requests per instance
      timeoutSeconds: 300
      containers:
        - image: gcr.io/PROJECT/IMAGE
          resources:
            limits:
              cpu: "2"
              memory: "2Gi"
```

**Guidelines:**

- Higher concurrency = fewer instances = lower cost
- Monitor request latency with different settings
- Start with default (80) and adjust based on metrics
- CPU-bound workloads: lower concurrency
- I/O-bound workloads: higher concurrency

### CPU Throttling

**Enable CPU throttling for cost savings.**

```bash
# Enable CPU throttling
gcloud run services update SERVICE_NAME \
  --cpu-throttling \
  --region=us-central1
```

**How it works:**

- CPU allocated only during request processing
- Idle time between requests: CPU throttled
- Reduces costs for low-traffic services
- May increase latency slightly

**When to use:**

- Low to moderate traffic
- I/O-bound workloads
- Cost-sensitive applications
- Non-real-time processing

### Memory Optimization

**Right-size memory allocation.**

```bash
# Set memory limits
gcloud run services update SERVICE_NAME \
  --memory=512Mi \
  --region=us-central1
```

**Best practices:**

- Start with 512Mi and monitor
- Increase if seeing OOM errors
- Use memory profiling tools
- Consider memory per concurrent request
- Monitor actual memory usage

## Security Best Practices

### Service Identity

**Use service accounts for authentication.**

```bash
# Create service account
gcloud iam service-accounts create cloud-run-sa \
  --display-name="Cloud Run Service Account"

# Grant permissions
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:cloud-run-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

# Deploy with service account
gcloud run deploy SERVICE_NAME \
  --service-account=cloud-run-sa@PROJECT_ID.iam.gserviceaccount.com \
  --region=us-central1
```

**Benefits:**

- No key management needed
- Automatic credential rotation
- Fine-grained permissions
- Audit trail

### Secrets Management

**Use Secret Manager for sensitive data.**

```javascript
// Access secrets at startup
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const client = new SecretManagerServiceClient();

let dbPassword = null;

async function getDbPassword() {
  if (!dbPassword) {
    const [version] = await client.accessSecretVersion({
      name: "projects/PROJECT_ID/secrets/DB_PASSWORD/versions/latest",
    });
    dbPassword = version.payload.data.toString();
  }
  return dbPassword;
}
```

```bash
# Grant secret access
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"
```

**Best practices:**

- Never commit secrets to code
- Use Secret Manager for all secrets
- Cache secrets in memory (not files)
- Rotate secrets regularly
- Use secret versions for rollback

### VPC Connector

**Connect to private resources securely.**

```bash
# Create VPC connector
gcloud compute networks vpc-access connectors create CONNECTOR_NAME \
  --region=us-central1 \
  --network=VPC_NETWORK \
  --range=10.8.0.0/28

# Deploy with VPC connector
gcloud run services update SERVICE_NAME \
  --vpc-connector=CONNECTOR_NAME \
  --vpc-egress=private-ranges-only \
  --region=us-central1
```

**Use cases:**

- Access Cloud SQL private IP
- Connect to on-premises resources
- Access other VPC resources
- Enhanced security isolation

### HTTPS Only

**Enforce HTTPS for all requests.**

```yaml
# Cloud Run automatically provides HTTPS
# But ensure your app handles it correctly
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/ingress: all  # Allow all traffic
        # or
        run.googleapis.com/ingress: internal  # Internal only
```

## Error Handling and Resilience

### Graceful Shutdown

**Handle termination signals properly.**

```javascript
// Node.js graceful shutdown
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const gracefulShutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully`);

  server.close(() => {
    console.log("HTTP server closed");

    // Close database connections
    db.close(() => {
      console.log("Database connections closed");
      process.exit(0);
    });
  });

  // Force shutdown after timeout
  setTimeout(() => {
    console.error("Forced shutdown");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
```

**Best practices:**

- Listen for SIGTERM and SIGINT
- Stop accepting new requests
- Complete in-flight requests
- Close connections gracefully
- Set shutdown timeout

### Timeout Configuration

**Set appropriate timeouts.**

```bash
# Set request timeout
gcloud run services update SERVICE_NAME \
  --timeout=300s \
  --region=us-central1
```

**Guidelines:**

- Default: 300 seconds (5 minutes)
- API endpoints: 30-60 seconds
- Long-running tasks: Use Cloud Run Jobs
- Background processing: Separate service
- Monitor timeout errors

### Retry Logic

**Implement retry logic for external dependencies.**

```javascript
// Exponential backoff retry
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = Math.pow(2, i) * 1000; // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Usage
const result = await retryWithBackoff(async () => {
  return await externalApi.call();
});
```

## Monitoring and Observability

### Structured Logging

**Use structured logging for better observability.**

```javascript
// Use structured logging
const winston = require("winston");

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

// Log with context
logger.info("Request processed", {
  method: req.method,
  path: req.path,
  statusCode: res.statusCode,
  duration: Date.now() - startTime,
  userId: req.user?.id,
});
```

**Best practices:**

- Use JSON format for structured logs
- Include request context (trace ID, user ID)
- Log at appropriate levels (DEBUG, INFO, WARN, ERROR)
- Don't log sensitive information
- Use correlation IDs for request tracing

### Custom Metrics

**Export custom metrics for monitoring.**

```javascript
// Using OpenCensus/OpenTelemetry
const { globalStats, MeasureUnit, TagMap } = require("@opencensus/core");

const requestDuration = globalStats.createMeasureDouble(
  "request_duration",
  MeasureUnit.MS,
  "Request processing duration"
);

// Record metric
const tags = new TagMap();
tags.set({ key: "method", value: req.method });
globalStats.record(
  [
    {
      measure: requestDuration,
      value: Date.now() - startTime,
    },
  ],
  tags
);
```

### Error Tracking

**Track and alert on errors.**

```javascript
// Error tracking with context
app.use((err, req, res, next) => {
  // Log error with full context
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    request: {
      method: req.method,
      path: req.path,
      headers: req.headers,
      body: req.body,
    },
    user: req.user?.id,
  });

  // Send to error tracking service
  errorTracking.captureException(err, {
    tags: { environment: process.env.ENVIRONMENT },
    extra: { request: req },
  });

  res.status(500).json({ error: "Internal server error" });
});
```

## Deployment Patterns

### Blue-Green Deployment

**Zero-downtime deployments with traffic splitting.**

```bash
# Deploy new revision
gcloud run services update SERVICE_NAME \
  --image=gcr.io/PROJECT/IMAGE:NEW_TAG \
  --region=us-central1

# Split traffic between revisions
gcloud run services update-traffic SERVICE_NAME \
  --to-revisions=NEW_REVISION=10,OLD_REVISION=90 \
  --region=us-central1

# Gradually increase new revision
gcloud run services update-traffic SERVICE_NAME \
  --to-revisions=NEW_REVISION=50,OLD_REVISION=50 \
  --region=us-central1

# Complete cutover
gcloud run services update-traffic SERVICE_NAME \
  --to-latest \
  --region=us-central1
```

### Canary Deployments

**Gradual rollout with monitoring.**

```bash
# Deploy canary revision
gcloud run services update SERVICE_NAME \
  --image=gcr.io/PROJECT/IMAGE:CANARY \
  --tag=canary \
  --region=us-central1

# Route small percentage to canary
gcloud run services update-traffic SERVICE_NAME \
  --to-tags=canary=5,latest=95 \
  --region=us-central1

# Monitor metrics, then increase or rollback
```

### Environment Variables

**Manage configuration through environment variables.**

```bash
# Set environment variables
gcloud run services update SERVICE_NAME \
  --set-env-vars="DATABASE_URL=...,API_KEY=..." \
  --region=us-central1

# Or use .env.yaml file
gcloud run services update SERVICE_NAME \
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

## Cloud Run Jobs

**For batch processing and scheduled tasks.**

```bash
# Create Cloud Run job
gcloud run jobs create JOB_NAME \
  --image=gcr.io/PROJECT/IMAGE \
  --region=us-central1 \
  --max-retries=3 \
  --task-timeout=3600 \
  --memory=2Gi \
  --cpu=2

# Execute job
gcloud run jobs execute JOB_NAME \
  --region=us-central1

# Schedule with Cloud Scheduler
gcloud scheduler jobs create http JOB_SCHEDULER \
  --schedule="0 2 * * *" \
  --uri="https://us-central1-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/PROJECT_ID/jobs/JOB_NAME:run" \
  --http-method=POST \
  --oauth-service-account-email=SERVICE_ACCOUNT
```

**Use cases:**

- Data processing pipelines
- Scheduled reports
- Batch imports/exports
- Cleanup tasks
- ETL operations

## Cost Optimization

### Minimize Cold Starts

**Keep instances warm for critical services.**

```bash
# Set minimum instances
gcloud run services update SERVICE_NAME \
  --min-instances=1 \
  --region=us-central1
```

**Trade-offs:**

- Eliminates cold starts
- Higher cost (always running)
- Use only for critical, low-traffic services

### Optimize Concurrency

**Balance cost and performance.**

```yaml
# Higher concurrency = fewer instances
containerConcurrency: 100 # More requests per instance
```

### Use CPU Throttling

**Save costs on low-traffic services.**

```bash
gcloud run services update SERVICE_NAME \
  --cpu-throttling \
  --region=us-central1
```

## Common Patterns

### Microservices Pattern

**Deploy independent services.**

```bash
# Service 1: User API
gcloud run deploy user-api \
  --image=gcr.io/PROJECT/user-api \
  --region=us-central1

# Service 2: Payment API
gcloud run deploy payment-api \
  --image=gcr.io/PROJECT/payment-api \
  --region=us-central1

# Service 3: Notification Service
gcloud run deploy notification-service \
  --image=gcr.io/PROJECT/notification-service \
  --region=us-central1
```

### API Gateway Pattern

**Use Cloud Endpoints or API Gateway.**

```yaml
# api-config.yaml
swagger: "2.0"
info:
  title: My API
  version: 1.0.0
paths:
  /api/v1/users:
    get:
      x-google-backend:
        address: https://user-api-xxx.run.app
      responses:
        200:
          description: Success
```

### Event-Driven Pattern

**Trigger from Pub/Sub events.**

```bash
# Deploy with Pub/Sub trigger
gcloud run deploy event-processor \
  --image=gcr.io/PROJECT/event-processor \
  --set-env-vars="PUBSUB_TOPIC=events" \
  --region=us-central1

# Create Pub/Sub push subscription
gcloud pubsub subscriptions create event-subscription \
  --topic=events \
  --push-endpoint=https://event-processor-xxx.run.app
```

## Troubleshooting

### Cold Start Issues

**Diagnose and fix cold start problems.**

```bash
# Check instance startup time
gcloud logging read "resource.type=cloud_run_revision" \
  --limit=50 \
  --format=json

# Monitor cold start metrics
gcloud monitoring time-series list \
  --filter='metric.type="run.googleapis.com/container/startup_latency"'
```

**Solutions:**

- Optimize container image size
- Reduce startup dependencies
- Use global initialization
- Consider min-instances for critical services

### Memory Issues

**Diagnose OOM errors.**

```bash
# Check memory usage
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR" \
  --limit=50

# Increase memory if needed
gcloud run services update SERVICE_NAME \
  --memory=1Gi \
  --region=us-central1
```

### Timeout Issues

**Handle long-running requests.**

```bash
# Increase timeout
gcloud run services update SERVICE_NAME \
  --timeout=600s \
  --region=us-central1

# Or use Cloud Run Jobs for long tasks
```

## Conclusion

Cloud Run best practices summary:

1. **Container optimization:** Small images, health checks, proper ports
2. **Performance:** Reduce cold starts, optimize concurrency
3. **Security:** Service accounts, Secret Manager, VPC connectors
4. **Resilience:** Graceful shutdown, timeouts, retry logic
5. **Observability:** Structured logging, metrics, error tracking
6. **Deployment:** Blue-green, canary, traffic splitting
7. **Cost:** Optimize concurrency, use CPU throttling
8. **Patterns:** Microservices, API gateway, event-driven

**Key takeaways:**

- Optimize for cold starts
- Use appropriate concurrency settings
- Implement proper health checks
- Handle errors and timeouts gracefully
- Monitor and log effectively
- Use Cloud Run Jobs for batch processing
- Secure with service accounts and Secret Manager

Remember: Cloud Run excels at request-driven workloads. For always-on or
long-running processes, consider Compute Engine or GKE.
