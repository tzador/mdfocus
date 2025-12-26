# Google Cloud: Cost Optimization Strategies and Monitoring

## Introduction

Cost optimization in Google Cloud Platform is an ongoing process that requires
understanding your usage patterns, right-sizing resources, and implementing
automated cost controls. Effective cost management can reduce cloud spending by
30-50% while maintaining or improving performance.

This guide covers comprehensive cost optimization strategies, monitoring
techniques, and best practices for managing GCP expenses.

## Cost Optimization Principles

### 1. Right-Sizing Resources

**Match resources to actual workload requirements.**

**Common mistakes:**
- Over-provisioning "just to be safe"
- Using default instance sizes without analysis
- Not reviewing resource usage regularly

**Best practices:**
- Start small and scale up based on metrics
- Use machine type recommendations from GCP
- Monitor CPU, memory, and network utilization
- Use custom machine types for exact needs

### 2. Eliminate Waste

**Remove unused or underutilized resources.**

**Common waste sources:**
- Idle VMs running 24/7
- Unattached persistent disks
- Unused IP addresses
- Orphaned snapshots
- Unused Cloud Storage buckets
- Abandoned projects

### 3. Use Appropriate Pricing Models

**Match pricing models to workload characteristics.**

**Options:**
- On-demand: Pay-as-you-go flexibility
- Committed use discounts: 1-3 year commitments
- Sustained use discounts: Automatic for long-running VMs
- Preemptible/Spot: Up to 80% discount for fault-tolerant workloads

### 4. Optimize Storage Costs

**Choose storage classes based on access patterns.**

**Storage classes:**
- Standard: Frequently accessed data
- Nearline: Monthly access (30-day minimum)
- Coldline: Quarterly access (90-day minimum)
- Archive: Annual access (365-day minimum)

## Compute Cost Optimization

### Compute Engine

#### Right-Sizing Instances

```bash
# Use machine type recommendations
gcloud recommender recommendations list \
  --recommender=google.compute.instance.MachineTypeRecommender \
  --project=PROJECT_ID \
  --location=us-central1-a

# Analyze instance utilization
gcloud compute instances describe INSTANCE_NAME \
  --zone=ZONE \
  --format="get(guestAttributes)"
```

**Strategies:**
- Use smaller instance types initially
- Monitor utilization over 2-4 weeks
- Use custom machine types for exact CPU/memory ratios
- Consider shared-core instances for low-CPU workloads

#### Preemptible VMs

**Save up to 80% on compute costs.**

```bash
# Create preemptible instance
gcloud compute instances create INSTANCE_NAME \
  --preemptible \
  --machine-type=n1-standard-1 \
  --zone=us-central1-a
```

**When to use:**
- Batch processing jobs
- Fault-tolerant workloads
- CI/CD pipelines
- Data processing that can restart
- Development and testing

**Best practices:**
- Implement checkpointing for long-running jobs
- Use instance groups for automatic replacement
- Handle termination gracefully
- Monitor preemption rates

#### Committed Use Discounts

**Save up to 70% with 1-3 year commitments.**

```bash
# Create committed use discount
gcloud compute commitments create COMMITMENT_NAME \
  --plan=TWELVE_MONTH \
  --resources=vcpu=4,memory=16 \
  --region=us-central1
```

**Types:**
- 1-year commitment: 20-30% discount
- 3-year commitment: 50-70% discount
- Regional commitments: Flexible across zones
- Specific machine types: Higher discounts

**When to use:**
- Predictable, steady workloads
- Production environments
- Long-term projects
- When you can commit to specific resources

#### Sustained Use Discounts

**Automatic discounts for long-running VMs.**

**How it works:**
- Automatic 20-30% discount
- Applies after 25% of month usage
- Increases with more usage
- No commitment required

**Optimization:**
- Consolidate workloads on fewer instances
- Run instances for full billing month
- Use same machine type family

### Cloud Run

#### Optimize Container Images

**Smaller images = faster cold starts = lower costs.**

```dockerfile
# Use multi-stage builds
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["node", "server.js"]
```

**Best practices:**
- Use Alpine or distroless base images
- Remove unnecessary dependencies
- Use .dockerignore to exclude files
- Keep images under 500MB

#### Configure Concurrency

**Balance cost and latency.**

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
      containerConcurrency: 80  # Requests per instance
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
- Monitor request latency
- Test with production traffic patterns
- Use CPU throttling for cost savings

#### Use Cloud Run Jobs

**For batch processing instead of always-on VMs.**

```bash
# Create Cloud Run job
gcloud run jobs create JOB_NAME \
  --image=gcr.io/PROJECT/IMAGE \
  --region=us-central1 \
  --max-retries=3 \
  --task-timeout=3600
```

**Benefits:**
- Pay only for execution time
- Automatic scaling
- No idle costs
- Built-in retry logic

### Cloud Functions

#### Optimize Function Execution

**Reduce execution time and memory usage.**

```javascript
// Optimize cold starts
const cachedData = {};

exports.myFunction = async (req, res) => {
  // Initialize expensive resources once
  if (!cachedData.client) {
    cachedData.client = await initializeClient();
  }
  
  // Use cached client
  const result = await cachedData.client.query();
  res.json(result);
};
```

**Best practices:**
- Minimize cold start time
- Use appropriate memory allocation
- Implement connection pooling
- Cache expensive initializations

#### Use Function Generation 2

**Better performance and cost efficiency.**

```bash
# Deploy 2nd gen function
gcloud functions deploy FUNCTION_NAME \
  --gen2 \
  --runtime=nodejs18 \
  --region=us-central1 \
  --source=. \
  --entry-point=myFunction \
  --memory=256MB \
  --timeout=60s
```

**Advantages:**
- Lower cold start times
- Better concurrency handling
- More predictable pricing
- Integration with Cloud Run features

### Kubernetes Engine (GKE)

#### Cluster Autoscaling

**Automatically adjust cluster size.**

```yaml
# Enable cluster autoscaling
gcloud container clusters create CLUSTER_NAME \
  --enable-autoscaling \
  --min-nodes=1 \
  --max-nodes=10 \
  --num-nodes=3
```

**Best practices:**
- Set appropriate min/max nodes
- Use node pools for different workload types
- Monitor autoscaling events
- Use cluster autoscaler with HPA/VPA

#### Node Pool Optimization

**Use appropriate machine types per workload.**

```bash
# Create optimized node pool
gcloud container node-pools create POOL_NAME \
  --cluster=CLUSTER_NAME \
  --machine-type=e2-medium \
  --preemptible \
  --num-nodes=3 \
  --enable-autoscaling \
  --min-nodes=1 \
  --max-nodes=5
```

**Strategies:**
- Use preemptible nodes for non-critical workloads
- Separate node pools for different workload types
- Use e2 machine types for cost savings
- Right-size based on pod requirements

#### Pod Resource Requests

**Request only what you need.**

```yaml
# Optimize resource requests
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: app
    resources:
      requests:
        cpu: "100m"      # Start small
        memory: "128Mi"
      limits:
        cpu: "500m"       # Allow burst
        memory: "512Mi"
```

**Best practices:**
- Set requests based on actual usage
- Use Vertical Pod Autoscaler (VPA) for recommendations
- Monitor and adjust regularly
- Avoid over-provisioning

## Storage Cost Optimization

### Cloud Storage

#### Lifecycle Policies

**Automatically transition objects to cheaper storage.**

```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {
          "type": "SetStorageClass",
          "storageClass": "NEARLINE"
        },
        "condition": {
          "age": 30,
          "matchesStorageClass": ["STANDARD"]
        }
      },
      {
        "action": {
          "type": "SetStorageClass",
          "storageClass": "COLDLINE"
        },
        "condition": {
          "age": 90,
          "matchesStorageClass": ["NEARLINE"]
        }
      },
      {
        "action": {
          "type": "Delete"
        },
        "condition": {
          "age": 365
        }
      }
    ]
  }
}
```

**Apply lifecycle policy:**
```bash
gsutil lifecycle set lifecycle.json gs://BUCKET_NAME
```

#### Storage Class Selection

**Match storage class to access patterns.**

| Storage Class | Use Case | Cost |
|--------------|----------|------|
| Standard | Frequently accessed | Highest |
| Nearline | Monthly access | Medium |
| Coldline | Quarterly access | Lower |
| Archive | Annual access | Lowest |

**Decision tree:**
- Access > once/month → Standard
- Access monthly → Nearline
- Access quarterly → Coldline
- Access annually → Archive

#### Object Versioning

**Disable if not needed to save costs.**

```bash
# Disable versioning
gsutil versioning set off gs://BUCKET_NAME

# Or configure lifecycle to delete old versions
```

**Cost impact:**
- Each version counts as separate object
- Storage costs multiply with versions
- Only enable if you need point-in-time recovery

### Cloud SQL

#### Instance Right-Sizing

**Match instance size to workload.**

```bash
# Monitor instance metrics
gcloud sql instances describe INSTANCE_NAME \
  --format="get(settings.tier)"

# Resize instance
gcloud sql instances patch INSTANCE_NAME \
  --tier=db-n1-standard-2
```

**Best practices:**
- Monitor CPU, memory, and I/O usage
- Use smaller instances for dev/test
- Scale up for production gradually
- Use read replicas instead of larger primary

#### Storage Optimization

**Optimize database storage usage.**

**Strategies:**
- Enable automatic storage increases with limits
- Regularly clean up old data
- Use partitioning for large tables
- Archive old data to Cloud Storage
- Compress data where possible

#### Backup Retention

**Optimize backup retention periods.**

```bash
# Configure backup retention
gcloud sql instances patch INSTANCE_NAME \
  --backup-start-time=03:00 \
  --enable-bin-log \
  --retained-backups-count=7
```

**Guidelines:**
- Keep only necessary backups
- Use point-in-time recovery for critical data
- Export old backups to Cloud Storage
- Automate backup cleanup

### BigQuery

#### Query Optimization

**Reduce query costs through optimization.**

```sql
-- Use LIMIT in development
SELECT * FROM dataset.table LIMIT 100;

-- Use partitioned tables
CREATE TABLE dataset.table (
  date DATE,
  ...
)
PARTITION BY date;

-- Use clustering
CREATE TABLE dataset.table (
  ...
)
CLUSTER BY user_id;
```

**Cost-saving techniques:**
- Use LIMIT in development queries
- Query only necessary columns
- Use partitioned tables
- Implement table clustering
- Cache query results
- Use materialized views

#### Slot Management

**Control BigQuery slot usage.**

```bash
# Set slot reservation
bq mk --reservation \
  --slots=100 \
  --location=US \
  RESERVATION_NAME
```

**Best practices:**
- Use on-demand pricing for variable workloads
- Use flat-rate pricing for predictable workloads
- Monitor slot usage
- Right-size reservations

#### Storage Optimization

**Reduce storage costs.**

**Strategies:**
- Use partitioning to reduce scanned data
- Delete unused tables and datasets
- Set table expiration
- Use streaming inserts efficiently
- Compress data before loading

## Network Cost Optimization

### Egress Costs

**Minimize data transfer costs.**

**Strategies:**
- Use Cloud CDN for static content
- Implement caching strategies
- Use same-region resources
- Minimize cross-region transfers
- Use Cloud Load Balancing efficiently

### Cloud CDN

**Cache content to reduce origin requests.**

```bash
# Enable Cloud CDN
gcloud compute backend-services update BACKEND_SERVICE \
  --enable-cdn \
  --cdn-cache-key-include-query-string=false
```

**Benefits:**
- Reduced origin server load
- Lower egress costs
- Better user experience
- Reduced bandwidth usage

## Monitoring and Budgets

### Budget Alerts

**Set up budget alerts to prevent surprises.**

```bash
# Create budget alert
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="Monthly Budget" \
  --budget-amount=1000USD \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100
```

**Best practices:**
- Set alerts at 50%, 90%, and 100%
- Create separate budgets per project
- Use budget filters for granular tracking
- Set up email and Pub/Sub notifications

### Cost Monitoring

**Track costs in real-time.**

```bash
# View current month costs
gcloud billing accounts list

# Export billing data
gcloud billing accounts get-iam-policy BILLING_ACCOUNT_ID

# View project costs
gcloud billing projects describe PROJECT_ID
```

**Tools:**
- Cloud Billing Console
- Cost Breakdown reports
- Cost Attribution labels
- Billing export to BigQuery
- Cost Management API

### Cost Attribution

**Use labels for cost tracking.**

```bash
# Add labels to resources
gcloud compute instances add-labels INSTANCE_NAME \
  --labels=environment=prod,team=backend,cost-center=engineering \
  --zone=us-central1-a
```

**Label strategy:**
- environment: prod, staging, dev
- team: backend, frontend, data
- cost-center: engineering, marketing
- project: project-code
- owner: team-email

### Billing Export

**Export billing data to BigQuery for analysis.**

```bash
# Enable billing export
gcloud billing accounts get-iam-policy BILLING_ACCOUNT_ID

# Query billing data in BigQuery
SELECT
  service.description,
  SUM(cost) as total_cost
FROM `project.dataset.gcp_billing_export`
WHERE _PARTITIONTIME >= TIMESTAMP('2024-01-01')
GROUP BY service.description
ORDER BY total_cost DESC
```

## Automation and Best Practices

### Automated Cost Optimization

**Use Recommender API for automated suggestions.**

```bash
# List cost optimization recommendations
gcloud recommender recommendations list \
  --recommender=google.compute.instance.IdleResourceRecommender \
  --project=PROJECT_ID \
  --location=us-central1

# Apply recommendation
gcloud recommender recommendations mark-claimed \
  RECOMMENDATION_NAME \
  --recommender=google.compute.instance.IdleResourceRecommender \
  --location=us-central1
```

**Recommendation types:**
- Idle VM recommendations
- Machine type recommendations
- IAM recommendations
- Security recommendations

### Scheduled Cleanup

**Automate resource cleanup.**

```bash
# Create cleanup script
#!/bin/bash
# cleanup-unused-resources.sh

# Delete unattached disks older than 30 days
gcloud compute disks list \
  --filter="users:*" \
  --format="value(name,zone)" | \
  while read disk zone; do
    # Check if disk is attached
    if [ -z "$(gcloud compute instances list \
      --filter="disks.name:$disk" \
      --format="value(name)")" ]; then
      gcloud compute disks delete $disk --zone=$zone --quiet
    fi
  done
```

### Cost Optimization Checklist

**Regular review process:**

- [ ] Review and right-size compute instances monthly
- [ ] Check for idle or underutilized resources
- [ ] Review storage classes and lifecycle policies
- [ ] Analyze BigQuery query costs
- [ ] Review network egress costs
- [ ] Check for unused snapshots and images
- [ ] Review committed use discounts
- [ ] Optimize Cloud Run concurrency settings
- [ ] Review and clean up unused projects
- [ ] Analyze cost by label/cost-center

## Cost Optimization Tools

### Cloud Asset Inventory

**Discover and track all resources.**

```bash
# Export all assets
gcloud asset export ASSET_NAME \
  --output-path=gs://BUCKET/path \
  --content-type=resource \
  --project=PROJECT_ID
```

### Recommender API

**Get automated optimization recommendations.**

```bash
# List all recommendations
gcloud recommender recommendations list \
  --project=PROJECT_ID \
  --location=global
```

### Cost Management API

**Programmatically manage costs.**

```python
from google.cloud import billing_v1

client = billing_v1.CloudBillingClient()
budget = billing_v1.Budget(
    display_name="Monthly Budget",
    budget_filter=billing_v1.Filter(
        projects=["projects/PROJECT_ID"]
    ),
    amount=billing_v1.BudgetAmount(
        specified_amount=billing_v1.Money(
            currency_code="USD",
            units=1000
        )
    )
)
```

## Conclusion

Effective cost optimization requires:

1. **Regular monitoring:** Track costs continuously
2. **Right-sizing:** Match resources to actual needs
3. **Automation:** Use tools and scripts for cleanup
4. **Planning:** Use committed discounts for predictable workloads
5. **Optimization:** Continuously review and improve
6. **Governance:** Implement budgets and alerts
7. **Attribution:** Use labels for cost tracking
8. **Education:** Train teams on cost optimization

**Key takeaways:**
- Start with monitoring and visibility
- Eliminate waste before optimizing
- Use appropriate pricing models
- Automate cost optimization tasks
- Review costs regularly (weekly/monthly)
- Set budgets and alerts
- Use labels for cost attribution
- Leverage GCP's cost optimization tools

Remember: Cost optimization is an ongoing process, not a one-time activity.
Regular reviews and adjustments will help you maintain optimal costs as your
workloads evolve.
