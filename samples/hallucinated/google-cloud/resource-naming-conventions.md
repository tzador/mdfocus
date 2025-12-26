# Google Cloud: Resource Naming Conventions and Organization Strategies

## Introduction

Consistent naming conventions and proper resource organization are critical for managing complex cloud infrastructures. Well-organized resources improve discoverability, reduce operational overhead, enable automation, and facilitate compliance and cost management.

This guide provides comprehensive naming conventions and organization strategies for Google Cloud Platform resources.

## Core Principles

### 1. Consistency
- Use the same naming pattern across all resources
- Document conventions and enforce them through policies
- Make exceptions only when necessary and document them

### 2. Clarity
- Names should be self-documenting
- Avoid abbreviations unless universally understood
- Include context (environment, purpose, region)

### 3. Automation-Friendly
- Use predictable patterns for scripting
- Avoid special characters that require escaping
- Support programmatic resource discovery

### 4. Compliance
- Meet GCP resource naming requirements
- Consider length limitations
- Support tagging and labeling strategies

## General Naming Rules

### GCP Resource Constraints

**Common limitations:**
- **Projects:** 6-30 characters, lowercase letters, numbers, hyphens
- **Buckets:** 3-63 characters, lowercase, numbers, hyphens, dots
- **Compute Instances:** 1-63 characters, lowercase, numbers, hyphens
- **Service Accounts:** 6-30 characters, lowercase, numbers, hyphens
- **VPCs:** 1-63 characters, lowercase, numbers, hyphens

**Characters to avoid:**
- Uppercase letters (not supported in many resources)
- Underscores (use hyphens instead)
- Special characters (except hyphens and dots where allowed)
- Spaces

## Naming Convention Template

### Standard Format

```
{environment}-{service}-{component}-{instance}-{region}
```

**Components:**
- **environment:** dev, staging, prod, test
- **service:** Application or service name (short, clear)
- **component:** Resource type or function
- **instance:** Optional instance number or identifier
- **region:** Optional region code (us-central1, europe-west1)

### Examples

```
# Compute Instance
prod-api-backend-01-us-central1

# Cloud Storage Bucket
dev-app-uploads-us

# Cloud SQL Instance
staging-db-primary-us-central1

# VPC Network
prod-shared-vpc-us

# Service Account
prod-api-service-account
```

## Resource-Specific Conventions

### Projects

**Format:** `{org}-{environment}-{service}-{purpose}`

```yaml
# Examples
acme-prod-api-backend
acme-dev-data-pipeline
acme-staging-monitoring
acme-shared-networking
acme-prod-security-audit
```

**Best practices:**
- Include organization prefix for multi-org setups
- Use "shared" for common infrastructure
- Keep project IDs short (remember 30 char limit)
- Use purpose suffix for clarity

**Project naming structure:**
```
Organization
├── Shared Infrastructure
│   ├── acme-shared-networking
│   ├── acme-shared-security
│   └── acme-shared-monitoring
├── Production
│   ├── acme-prod-api
│   ├── acme-prod-frontend
│   └── acme-prod-data
├── Staging
│   ├── acme-staging-api
│   └── acme-staging-frontend
└── Development
    ├── acme-dev-api
    └── acme-dev-frontend
```

### Compute Resources

#### Compute Engine Instances

**Format:** `{env}-{service}-{role}-{instance}-{zone}`

```yaml
# Examples
prod-api-web-01-us-central1-a
prod-api-web-02-us-central1-b
prod-api-worker-01-us-central1-a
dev-api-web-01-us-central1-a
```

**Role indicators:**
- `web`: Web servers
- `api`: API servers
- `worker`: Background workers
- `db`: Database servers (if not managed)
- `cache`: Caching servers
- `lb`: Load balancers

#### Cloud Run Services

**Format:** `{env}-{service}-{component}`

```yaml
# Examples
prod-api-user-service
prod-api-payment-service
dev-api-notification-service
staging-api-analytics-service
```

#### Cloud Functions

**Format:** `{env}-{service}-{function-name}`

```yaml
# Examples
prod-api-process-payment
prod-api-send-notification
dev-api-validate-input
staging-api-generate-report
```

### Storage Resources

#### Cloud Storage Buckets

**Format:** `{org}-{env}-{service}-{purpose}-{region}`

```yaml
# Examples
acme-prod-app-uploads-us
acme-prod-app-backups-us
acme-dev-app-temp-us
acme-prod-data-warehouse-us
acme-staging-app-logs-us
```

**Bucket purposes:**
- `uploads`: User-uploaded content
- `backups`: Backup storage
- `logs`: Application logs
- `temp`: Temporary files
- `static`: Static website assets
- `data`: Data processing storage

**Note:** Bucket names must be globally unique!

#### Cloud SQL Instances

**Format:** `{env}-{service}-{role}-{instance}`

```yaml
# Examples
prod-api-primary-db
prod-api-replica-db-01
staging-api-primary-db
dev-api-primary-db
```

**Roles:**
- `primary`: Primary database
- `replica`: Read replica
- `backup`: Backup instance
- `test`: Test database

### Networking Resources

#### VPC Networks

**Format:** `{env}-{purpose}-vpc-{region}`

```yaml
# Examples
prod-shared-vpc-us-central1
prod-app-vpc-us-central1
dev-shared-vpc-us-central1
staging-app-vpc-europe-west1
```

#### Subnets

**Format:** `{env}-{purpose}-subnet-{zone}`

```yaml
# Examples
prod-app-subnet-us-central1-a
prod-app-subnet-us-central1-b
prod-db-subnet-us-central1-a
dev-app-subnet-us-central1-a
```

**Subnet purposes:**
- `app`: Application servers
- `db`: Database servers
- `dmz`: Demilitarized zone
- `mgmt`: Management network

#### Firewall Rules

**Format:** `{env}-{direction}-{purpose}-{priority}`

```yaml
# Examples
prod-allow-http-ingress-1000
prod-allow-ssh-ingress-1001
prod-allow-db-egress-2000
dev-deny-all-egress-9999
```

**Components:**
- `direction`: ingress or egress
- `purpose`: What the rule allows/denies
- `priority`: Rule priority (lower = higher priority)

### Identity and Access Management

#### Service Accounts

**Format:** `{env}-{service}-{purpose}-sa`

```yaml
# Examples
prod-api-backend-sa
prod-api-worker-sa
dev-api-test-sa
prod-data-pipeline-sa
```

**Purposes:**
- `backend`: Backend services
- `worker`: Background workers
- `pipeline`: Data pipelines
- `monitoring`: Monitoring services
- `cicd`: CI/CD pipelines

#### IAM Custom Roles

**Format:** `{org}.{service}.{purpose}.{action}`

```yaml
# Examples
acme.api.deploy.role
acme.data.read.role
acme.storage.write.role
```

### Database Resources

#### Firestore Collections

**Format:** `{entity}_{plural}` (snake_case)

```yaml
# Examples
user_profiles
order_items
product_catalog
payment_transactions
```

#### BigQuery Datasets

**Format:** `{env}_{service}_{purpose}`

```yaml
# Examples
prod_analytics_events
prod_analytics_user_behavior
staging_analytics_test
dev_analytics_development
```

#### BigQuery Tables

**Format:** `{entity}_{granularity}`

```yaml
# Examples
user_events_daily
sales_transactions_hourly
page_views_realtime
```

### Monitoring and Logging

#### Log Sinks

**Format:** `{env}-{service}-{destination}-sink`

```yaml
# Examples
prod-api-bigquery-sink
prod-api-pubsub-sink
dev-api-storage-sink
```

#### Alert Policies

**Format:** `{env}-{service}-{metric}-{threshold}`

```yaml
# Examples
prod-api-cpu-high-80
prod-api-error-rate-high-5pct
prod-db-connection-pool-exhausted
```

### Pub/Sub Resources

#### Topics

**Format:** `{env}-{service}-{event-type}`

```yaml
# Examples
prod-api-user-created
prod-api-payment-processed
dev-api-order-updated
staging-api-notification-sent
```

#### Subscriptions

**Format:** `{env}-{service}-{consumer}-{topic}`

```yaml
# Examples
prod-api-email-service-user-created
prod-api-analytics-service-payment-processed
dev-api-test-consumer-user-created
```

## Organization Strategies

### 1. Folder Hierarchy

**Recommended structure:**

```
Organization
├── Production
│   ├── Applications
│   │   ├── API Services
│   │   ├── Frontend Services
│   │   └── Background Workers
│   ├── Data & Analytics
│   ├── Infrastructure
│   └── Security & Compliance
├── Staging
│   └── (mirror production structure)
├── Development
│   └── (mirror production structure)
└── Shared
    ├── Networking
    ├── Security
    ├── Monitoring
    └── CI/CD
```

### 2. Project Organization

**Single-project vs. Multi-project:**

**Single-project approach:**
- ✅ Simpler to start
- ✅ Easier resource sharing
- ❌ Harder to isolate environments
- ❌ Limited IAM granularity

**Multi-project approach (recommended):**
- ✅ Better isolation
- ✅ Granular IAM control
- ✅ Easier cost tracking
- ✅ Compliance and security
- ❌ More complex setup

**Project separation strategies:**

```yaml
# By Environment (Recommended)
projects:
  - acme-prod-api
  - acme-staging-api
  - acme-dev-api

# By Service
projects:
  - acme-api-backend
  - acme-api-frontend
  - acme-api-worker

# By Team
projects:
  - acme-team-a
  - acme-team-b
  - acme-team-c

# Hybrid (Best for large orgs)
projects:
  - acme-prod-api-backend
  - acme-prod-api-frontend
  - acme-staging-api-backend
  - acme-dev-api-backend
```

### 3. Labeling Strategy

**Labels provide additional metadata:**

```yaml
# Standard label set
labels:
  environment: prod|staging|dev
  service: api|frontend|worker
  team: backend|frontend|data
  cost-center: engineering|marketing|sales
  owner: team@example.com
  managed-by: terraform|manual|gcp-console
  created-date: 2024-01-15
```

**Label naming:**
- Use lowercase
- Use hyphens, not underscores
- Keep values short but descriptive
- Use consistent values across resources

**Example resource with labels:**

```yaml
# Compute Instance
name: prod-api-web-01-us-central1-a
labels:
  environment: prod
  service: api
  component: web
  team: backend
  cost-center: engineering
  managed-by: terraform
```

### 4. Tagging for Cost Management

**Cost allocation tags:**

```yaml
# Cost-related labels
labels:
  cost-center: engineering-backend
  project-code: PROJ-12345
  budget-alert: team-backend-alerts
  billing-owner: backend-team@example.com
```

## Environment Naming

### Standard Environments

```yaml
environments:
  - dev: Development
  - test: Testing
  - staging: Pre-production
  - prod: Production
  - sandbox: Experimental
  - shared: Shared infrastructure
```

### Environment Abbreviations

```yaml
# Short forms (when space is limited)
environments:
  d: dev
  t: test
  s: staging
  p: prod
  sb: sandbox
  sh: shared
```

## Region and Zone Naming

### Region Codes

```yaml
# Standard format: {location}-{direction}-{number}
regions:
  - us-central1: Iowa
  - us-east1: South Carolina
  - us-east4: Northern Virginia
  - us-west1: Oregon
  - us-west2: Los Angeles
  - us-west3: Salt Lake City
  - us-west4: Las Vegas
  - europe-west1: Belgium
  - europe-west2: London
  - europe-west3: Frankfurt
  - asia-east1: Taiwan
  - asia-southeast1: Singapore
```

### Zone Codes

```yaml
# Format: {region}-{zone}
zones:
  - us-central1-a
  - us-central1-b
  - us-central1-c
  - us-central1-f
```

## Automation and Infrastructure as Code

### Terraform Naming

```hcl
# Use variables for consistency
variable "environment" {
  type = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "service" {
  type = string
}

# Resource naming
resource "google_compute_instance" "web" {
  name = "${var.environment}-${var.service}-web-${count.index + 1}-${var.zone}"
  # ...
}
```

### Deployment Manager

```yaml
# Use properties for naming
resources:
- name: compute-instance
  type: compute.v1.instance
  properties:
    name: '$(env.env)-$(env.service)-web-01-$(env.zone)'
```

## Naming Convention Checklist

### Before Creating Resources

- [ ] Check GCP naming constraints
- [ ] Verify name uniqueness (especially for buckets)
- [ ] Follow organization's naming standard
- [ ] Include environment prefix
- [ ] Include service/component identifier
- [ ] Add region/zone if applicable
- [ ] Use hyphens, not underscores
- [ ] Use lowercase only
- [ ] Keep within length limits
- [ ] Make it self-documenting

### Documentation

**Maintain a naming convention document:**

```markdown
# Organization Naming Conventions

## Format
{environment}-{service}-{component}-{instance}-{region}

## Examples
- prod-api-web-01-us-central1-a
- dev-app-uploads-us
- staging-db-primary-us-central1

## Exceptions
- Legacy resources: [list]
- Special cases: [document]
```

## Common Anti-Patterns

### ❌ Avoid These

```yaml
# Too generic
name: server-1
name: database
name: bucket

# Inconsistent
name: prod-api-01
name: production-api-server-1
name: PROD_API_01

# Too long
name: production-api-backend-web-server-instance-01-us-central1-a

# Special characters
name: prod_api_web_01
name: prod@api#web$01

# No environment
name: api-web-01

# Unclear abbreviations
name: prd-ap-wb-01
```

### ✅ Prefer These

```yaml
# Clear and consistent
name: prod-api-web-01-us-central1-a
name: dev-app-uploads-us
name: staging-db-primary-us-central1

# Self-documenting
name: prod-api-worker-payment-processor
name: prod-data-pipeline-etl-bigquery
```

## Migration Strategy

### Renaming Existing Resources

**Important:** Many GCP resources cannot be renamed. Plan carefully!

**Resources that CAN be renamed:**
- Projects (project ID cannot change, but display name can)
- Some labels and metadata

**Resources that CANNOT be renamed:**
- Compute instances (must recreate)
- Cloud Storage buckets (must recreate)
- VPCs (must recreate)
- Service accounts (must recreate)

**Migration approach:**
1. Document current naming
2. Create new resources with correct names
3. Migrate data/configurations
4. Update references
5. Deprecate old resources
6. Delete old resources after verification

## Tools and Automation

### Validation Scripts

```bash
#!/bin/bash
# validate-resource-name.sh

NAME=$1
ENV=$2
SERVICE=$3

# Check format
if [[ ! $NAME =~ ^${ENV}-${SERVICE}- ]]; then
  echo "Error: Name must start with ${ENV}-${SERVICE}-"
  exit 1
fi

# Check length
if [ ${#NAME} -gt 63 ]; then
  echo "Error: Name too long (max 63 characters)"
  exit 1
fi

# Check characters
if [[ $NAME =~ [A-Z_] ]]; then
  echo "Error: Name contains uppercase or underscores"
  exit 1
fi

echo "Name validation passed"
```

### Terraform Validation

```hcl
# Custom validation
variable "resource_name" {
  type = string
  validation {
    condition = can(regex("^[a-z0-9-]+$", var.resource_name))
    error_message = "Resource name must be lowercase alphanumeric with hyphens only."
  }
}
```

## Conclusion

Effective naming conventions and organization strategies provide:

1. **Clarity:** Instantly understand resource purpose and context
2. **Automation:** Enable programmatic resource management
3. **Cost Management:** Track and allocate costs effectively
4. **Security:** Apply policies consistently
5. **Compliance:** Meet audit and governance requirements
6. **Scalability:** Support growth without confusion

**Key takeaways:**
- Establish conventions early and document them
- Enforce through automation and policies
- Be consistent across all resources
- Include environment, service, and purpose
- Use labels for additional metadata
- Plan organization hierarchy carefully
- Review and refine conventions regularly

Remember: Good naming conventions are an investment that pays dividends in operational efficiency, reduced errors, and easier maintenance as your infrastructure grows.
