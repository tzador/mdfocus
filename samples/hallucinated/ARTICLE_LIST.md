# Article List - Best Practices & Patterns

## Google Cloud Platform

### Core Services
- `google-cloud/core-services-overview.md` - Overview of core GCP services and when to use them
- `google-cloud/iam-best-practices.md` - Identity and Access Management patterns and security best practices
- `google-cloud/resource-naming-conventions.md` - Naming conventions and organization strategies
- `google-cloud/cost-optimization.md` - Cost optimization strategies and monitoring

### Compute
- `google-cloud/compute/cloud-run-best-practices.md` - Cloud Run patterns for serverless containers
- `google-cloud/compute/cloud-functions-v2.md` - Cloud Functions v2 patterns and best practices
- `google-cloud/compute/compute-engine-optimization.md` - VM optimization and management

### Storage
- `google-cloud/storage/cloud-storage-patterns.md` - Cloud Storage bucket organization and access patterns
- `google-cloud/storage/bigquery-best-practices.md` - BigQuery query optimization and data modeling

### Networking
- `google-cloud/networking/vpc-design.md` - VPC design patterns and security
- `google-cloud/networking/load-balancing.md` - Load balancing strategies and configurations

## Bun

### Getting Started
- `bun/getting-started.md` - Introduction to Bun and its advantages
- `bun/installation-and-setup.md` - Installation, configuration, and environment setup

### Development Patterns
- `bun/package-management.md` - Bun's package manager and dependency handling
- `bun/built-in-apis.md` - Using Bun's built-in APIs (fetch, file system, etc.)
- `bun/performance-optimization.md` - Performance tips and optimization techniques
- `bun/typescript-integration.md` - TypeScript configuration and best practices with Bun

### Runtime Features
- `bun/runtime/web-apis.md` - Web API compatibility and usage patterns
- `bun/runtime/native-modules.md` - Working with native modules and FFI
- `bun/runtime/hot-reload.md` - Hot reload and development workflow

### Deployment
- `bun/deployment/containerization.md` - Containerizing Bun applications
- `bun/deployment/production-checklist.md` - Production deployment checklist

## Node.js

### Core Concepts
- `nodejs/event-loop-understanding.md` - Understanding the event loop and async patterns
- `nodejs/streams-and-buffers.md` - Working with streams and buffers efficiently
- `nodejs/error-handling-patterns.md` - Comprehensive error handling strategies
- `nodejs/memory-management.md` - Memory management and leak prevention

### Best Practices
- `nodejs/module-patterns.md` - Module organization and design patterns
- `nodejs/async-patterns.md` - Async/await, promises, and callback patterns
- `nodejs/security-best-practices.md` - Security considerations and vulnerabilities
- `nodejs/performance-tuning.md` - Performance optimization techniques

### Architecture
- `nodejs/architecture/microservices.md` - Microservices patterns with Node.js
- `nodejs/architecture/rest-api-design.md` - RESTful API design and implementation
- `nodejs/architecture/graphql-patterns.md` - GraphQL implementation patterns

## Firebase

### Core Concepts
- `firebase/overview.md` - Firebase ecosystem overview and service selection
- `firebase/authentication-patterns.md` - Authentication flows and security patterns
- `firebase/security-rules.md` - Security rules best practices

### Firestore
- `firebase/firestore/data-modeling.md` - Data modeling patterns and denormalization strategies
- `firebase/firestore/query-optimization.md` - Query optimization and indexing
- `firebase/firestore/real-time-patterns.md` - Real-time data synchronization patterns
- `firebase/firestore/batch-operations.md` - Batch writes and transaction patterns
- `firebase/firestore/pagination-strategies.md` - Pagination and data fetching strategies
- `firebase/firestore/offline-support.md` - Offline persistence and caching

### Cloud Functions
- `firebase/functions/function-structure.md` - Function organization and structure
- `firebase/functions/triggers-and-events.md` - Event-driven patterns with triggers
- `firebase/functions/error-handling.md` - Error handling and retry strategies
- `firebase/functions/performance-optimization.md` - Cold start reduction and optimization
- `firebase/functions/testing-strategies.md` - Testing Firebase Functions

### Integration Patterns
- `firebase/integration/rest-api-integration.md` - Integrating Firebase with REST APIs
- `firebase/integration/third-party-services.md` - Integrating with external services

## PostgreSQL

### Database Design
- `postgresql/schema-design.md` - Schema design patterns and normalization
- `postgresql/indexing-strategies.md` - Index design and optimization
- `postgresql/constraints-and-validations.md` - Constraints, validations, and data integrity

### Performance
- `postgresql/query-optimization.md` - Query optimization and EXPLAIN analysis
- `postgresql/connection-pooling.md` - Connection pooling patterns and configuration
- `postgresql/partitioning.md` - Table partitioning strategies
- `postgresql/vacuum-and-maintenance.md` - Database maintenance and VACUUM strategies

### Advanced Features
- `postgresql/transactions-and-isolation.md` - Transaction isolation levels and patterns
- `postgresql/json-and-jsonb.md` - Working with JSON/JSONB data types
- `postgresql/full-text-search.md` - Full-text search implementation
- `postgresql/extensions.md` - Useful PostgreSQL extensions

### Operations
- `postgresql/backup-and-restore.md` - Backup and restore strategies
- `postgresql/migration-strategies.md` - Database migration best practices
- `postgresql/monitoring.md` - Monitoring and alerting setup

## Drizzle ORM

### Getting Started
- `drizzle/getting-started.md` - Introduction to Drizzle ORM
- `drizzle/schema-definition.md` - Schema definition patterns and best practices

### Query Patterns
- `drizzle/query-builder.md` - Query builder patterns and complex queries
- `drizzle/relationships.md` - Handling relationships and joins
- `drizzle/transactions.md` - Transaction patterns with Drizzle
- `drizzle/migrations.md` - Migration management and versioning

### Advanced Usage
- `drizzle/type-safety.md` - Leveraging TypeScript for type safety
- `drizzle/performance-optimization.md` - Performance optimization with Drizzle
- `drizzle/postgresql-features.md` - Using PostgreSQL-specific features with Drizzle

### Integration
- `drizzle/integration/express-integration.md` - Integrating Drizzle with Express.js
- `drizzle/integration/fastify-integration.md` - Integrating Drizzle with Fastify
- `drizzle/integration/testing.md` - Testing strategies with Drizzle

## Integration Patterns

### Full Stack
- `integration/full-stack-architecture.md` - Full-stack architecture patterns
- `integration/api-design.md` - API design patterns across services
- `integration/authentication-flow.md` - End-to-end authentication flows

### Cloud Integration
- `integration/gcp-firebase-integration.md` - Integrating GCP services with Firebase
- `integration/serverless-patterns.md` - Serverless architecture patterns
- `integration/event-driven-architecture.md` - Event-driven patterns across services

### Database Integration
- `integration/postgresql-firebase.md` - Using PostgreSQL alongside Firebase
- `integration/multi-database-patterns.md` - Patterns for working with multiple databases

## DevOps & Deployment

### CI/CD
- `devops/ci-cd-pipelines.md` - CI/CD pipeline setup and best practices
- `devops/github-actions.md` - GitHub Actions workflows for Node.js/Bun projects

### Monitoring & Logging
- `devops/logging-strategies.md` - Logging patterns and structured logging
- `devops/monitoring-setup.md` - Application monitoring and observability
- `devops/error-tracking.md` - Error tracking and alerting

### Security
- `devops/secrets-management.md` - Secrets management and environment variables
- `devops/security-hardening.md` - Security hardening practices

---

**Total Articles: 70**

Each article will be comprehensive, covering best practices, common patterns, code examples, and real-world scenarios.
