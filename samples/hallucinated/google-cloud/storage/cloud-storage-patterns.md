# Cloud Storage: Patterns and Best Practices

## Introduction

Google Cloud Storage is a highly scalable object storage service. Proper
organization, access patterns, and configuration are essential for security,
performance, and cost optimization.

This guide covers Cloud Storage best practices, patterns, and optimization
strategies.

## Bucket Organization

### Naming Conventions

**Follow consistent naming patterns.**

```bash
# Good bucket naming
gs://acme-prod-app-uploads-us
gs://acme-prod-app-backups-us
gs://acme-dev-app-temp-us
```

**Best practices:**
- Include organization/company prefix
- Include environment (prod, staging, dev)
- Include purpose (uploads, backups, logs)
- Include region if multi-region
- Use lowercase, hyphens (no underscores)
- Globally unique names required

### Bucket Structure

**Organize objects with prefixes.**

```
bucket-name/
├── uploads/
│   ├── 2024/
│   │   ├── 01/
│   │   │   ├── user-123/
│   │   │   └── user-456/
│   │   └── 02/
│   └── 2023/
├── backups/
│   └── daily/
└── logs/
    └── application/
```

**Benefits:**
- Logical organization
- Easier lifecycle management
- Better access control
- Simplified querying

## Access Patterns

### Uniform Bucket-Level Access

**Use uniform access for better security.**

```bash
# Enable uniform bucket-level access
gsutil uniformbucketlevelaccess set on gs://BUCKET_NAME
```

**Benefits:**
- Consistent IAM-based access
- Better security model
- Easier permission management
- Required for some features

### IAM Permissions

**Grant appropriate permissions.**

```bash
# Grant read access to service account
gsutil iam ch serviceAccount:SA@PROJECT.iam.gserviceaccount.com:objectViewer \
  gs://BUCKET_NAME

# Grant write access
gsutil iam ch serviceAccount:SA@PROJECT.iam.gserviceaccount.com:objectCreator \
  gs://BUCKET_NAME
```

**Common roles:**
- `storage.objectViewer`: Read objects
- `storage.objectCreator`: Create objects
- `storage.objectAdmin`: Full object control
- `storage.legacyBucketReader`: Legacy read
- `storage.legacyBucketWriter`: Legacy write

### Signed URLs

**Generate temporary access URLs.**

```javascript
// Node.js example
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

async function generateSignedUrl(bucketName, fileName) {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(fileName);
  
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  });
  
  return url;
}
```

**Use cases:**
- Temporary file downloads
- User-uploaded content access
- Private content sharing
- Time-limited access

### Signed URLs for Uploads

**Allow direct client uploads.**

```javascript
async function generateUploadUrl(bucketName, fileName) {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(fileName);
  
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 60 * 60 * 1000, // 1 hour
    contentType: 'image/jpeg',
  });
  
  return url;
}
```

**Benefits:**
- Offload uploads from server
- Reduce server bandwidth
- Better scalability
- Direct client-to-storage transfer

## Storage Classes

### Class Selection

**Choose storage class based on access patterns.**

| Class | Access Frequency | Min Storage | Use Case |
|-------|-----------------|------------|----------|
| Standard | Frequent | None | Active data, web content |
| Nearline | Monthly | 30 days | Backups, archives |
| Coldline | Quarterly | 90 days | Long-term backups |
| Archive | Annual | 365 days | Compliance, deep archives |

```bash
# Set storage class on upload
gsutil cp -s STANDARD file.txt gs://BUCKET_NAME/

# Set storage class on existing object
gsutil rewrite -s NEARLINE gs://BUCKET_NAME/file.txt
```

### Lifecycle Policies

**Automatically transition objects.**

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

```bash
# Apply lifecycle policy
gsutil lifecycle set lifecycle.json gs://BUCKET_NAME
```

**Best practices:**
- Transition based on access patterns
- Delete old versions automatically
- Archive before deletion
- Test policies in non-production first

## Performance Optimization

### Parallel Composite Uploads

**Upload large files faster.**

```bash
# Enable parallel composite uploads
gsutil -o GSUtil:parallel_composite_upload_threshold=150M \
  cp large-file.zip gs://BUCKET_NAME/
```

**Benefits:**
- Faster uploads for large files
- Automatic parallelization
- Better reliability
- Threshold: 150MB default

### Resumable Uploads

**Handle network interruptions.**

```javascript
// Node.js resumable upload
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

async function uploadLargeFile(bucketName, fileName, filePath) {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(fileName);
  
  await file.save(fs.createReadStream(filePath), {
    resumable: true,
    metadata: {
      contentType: 'application/zip',
    },
  });
}
```

### Composite Objects

**Combine multiple objects.**

```bash
# Create composite object
gsutil compose gs://BUCKET/file1.txt gs://BUCKET/file2.txt \
  gs://BUCKET/composite.txt
```

**Use cases:**
- Combine log files
- Merge data chunks
- Create large files from parts
- Reduce object count

## Security Best Practices

### Encryption

**Encrypt data at rest and in transit.**

```bash
# Create bucket with encryption
gsutil mb -p PROJECT_ID -c STANDARD -l us-central1 \
  --default-encryption-key=KEY_NAME \
  gs://BUCKET_NAME
```

**Encryption options:**
- Google-managed keys (default)
- Customer-managed keys (CMEK)
- Customer-supplied keys (CSEK)

### CORS Configuration

**Configure CORS for web applications.**

```json
[
  {
    "origin": ["https://example.com"],
    "method": ["GET", "POST", "PUT"],
    "responseHeader": ["Content-Type", "Authorization"],
    "maxAgeSeconds": 3600
  }
]
```

```bash
# Set CORS configuration
gsutil cors set cors.json gs://BUCKET_NAME
```

### Public Access Prevention

**Prevent accidental public access.**

```bash
# Enable public access prevention
gsutil pap set enforced gs://BUCKET_NAME
```

**Benefits:**
- Prevents making buckets public
- Better security posture
- Compliance requirements
- Organization policy enforcement

### Versioning

**Enable versioning for critical data.**

```bash
# Enable versioning
gsutil versioning set on gs://BUCKET_NAME
```

**Use cases:**
- Data recovery
- Compliance requirements
- Change tracking
- Rollback capability

**Cost consideration:**
- Each version counts as separate object
- Storage costs multiply
- Use lifecycle policies to manage versions

## Cost Optimization

### Object Lifecycle Management

**Automate object lifecycle.**

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
          "matchesPrefix": ["uploads/"]
        }
      },
      {
        "action": {
          "type": "Delete"
        },
        "condition": {
          "age": 365,
          "matchesPrefix": ["temp/"]
        }
      }
    ]
  }
}
```

### Minimize Operations

**Reduce API calls and operations.**

**Strategies:**
- Batch operations when possible
- Use composite objects
- Minimize metadata operations
- Cache object lists
- Use appropriate storage classes

### Delete Unused Objects

**Regular cleanup of unused objects.**

```bash
# List objects older than 90 days
gsutil ls -l gs://BUCKET_NAME/ | awk '$2 < "DATE" {print}'

# Delete old objects
gsutil -m rm gs://BUCKET_NAME/old-prefix/**
```

## Common Patterns

### Static Website Hosting

**Host static websites.**

```bash
# Make bucket public (if needed)
gsutil iam ch allUsers:objectViewer gs://BUCKET_NAME

# Set main page and error page
gsutil web set -m index.html -e 404.html gs://BUCKET_NAME

# Configure as website
gsutil cors set cors.json gs://BUCKET_NAME
```

**Best practices:**
- Use Cloud CDN for better performance
- Enable HTTPS (automatic with custom domain)
- Use appropriate CORS settings
- Implement proper error pages

### Backup and Archive

**Automated backup patterns.**

```bash
# Daily backup script
#!/bin/bash
BACKUP_BUCKET="gs://backups-bucket"
DATE=$(date +%Y-%m-%d)

# Backup database
pg_dump database | gsutil cp - \
  ${BACKUP_BUCKET}/database/${DATE}.sql

# Backup files
tar czf - /data | gsutil cp - \
  ${BACKUP_BUCKET}/files/${DATE}.tar.gz
```

**Lifecycle policy for backups:**
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
          "age": 7,
          "matchesPrefix": ["database/"]
        }
      },
      {
        "action": {
          "type": "SetStorageClass",
          "storageClass": "COLDLINE"
        },
        "condition": {
          "age": 30,
          "matchesPrefix": ["database/"]
        }
      }
    ]
  }
}
```

### Log Aggregation

**Centralized log storage.**

```bash
# Export application logs
gsutil cp /var/log/app.log \
  gs://logs-bucket/app/$(date +%Y/%m/%d)/app.log
```

**Lifecycle for logs:**
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
          "age": 7,
          "matchesPrefix": ["app/"]
        }
      },
      {
        "action": {
          "type": "Delete"
        },
        "condition": {
          "age": 90,
          "matchesPrefix": ["app/"]
        }
      }
    ]
  }
}
```

### Data Lake Pattern

**Organize data for analytics.**

```
data-lake-bucket/
├── raw/
│   ├── 2024/
│   │   ├── 01/
│   │   │   ├── events-2024-01-01.json
│   │   │   └── events-2024-01-02.json
│   │   └── 02/
│   └── 2023/
├── processed/
│   └── aggregated/
└── archive/
```

**Benefits:**
- Organized by date
- Easy partitioning
- Lifecycle management
- Analytics-ready structure

## Monitoring and Operations

### Monitoring Metrics

**Track bucket and object metrics.**

```bash
# View bucket metrics
gcloud monitoring time-series list \
  --filter='metric.type="storage.googleapis.com/api/request_count"'
```

**Key metrics:**
- Request count
- Bytes stored
- Bytes transferred
- Object count
- Error rates

### Logging

**Enable access logs.**

```bash
# Enable access logging
gsutil logging set on -b gs://logs-bucket -o access-logs \
  gs://BUCKET_NAME
```

**Log types:**
- Access logs: Who accessed what
- Storage transfer logs: Data transfers
- Audit logs: Administrative actions

### Alerts

**Set up cost and usage alerts.**

```bash
# Create budget alert
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT \
  --display-name="Storage Budget" \
  --budget-amount=1000USD \
  --threshold-rule=percent=90
```

## Integration Patterns

### Cloud Functions Integration

**Trigger functions on storage events.**

```javascript
// Cloud Function triggered by storage
const functions = require('@google-cloud/functions-framework');

functions.cloudEvent('processFile', (cloudEvent) => {
  const file = cloudEvent.data;
  console.log(`Processing: gs://${file.bucket}/${file.name}`);
  
  // Process file
  processFile(file.bucket, file.name);
});
```

### BigQuery Integration

**Load data from Cloud Storage.**

```sql
-- Load data from Cloud Storage
CREATE EXTERNAL TABLE dataset.table
OPTIONS (
  format = 'JSON',
  uris = ['gs://bucket-name/data/*.json']
);
```

### Dataflow Integration

**Process data with Dataflow.**

```python
# Read from Cloud Storage
with beam.Pipeline() as pipeline:
    data = pipeline | 'Read' >> beam.io.ReadFromText(
        'gs://bucket-name/input/*.txt'
    )
    
    # Process data
    processed = data | 'Process' >> beam.Map(process_function)
    
    # Write to Cloud Storage
    processed | 'Write' >> beam.io.WriteToText(
        'gs://bucket-name/output/'
    )
```

## Troubleshooting

### Common Issues

**Permission denied:**
```bash
# Check IAM permissions
gsutil iam get gs://BUCKET_NAME

# Verify service account permissions
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:SA@PROJECT.iam.gserviceaccount.com"
```

**High costs:**
```bash
# Analyze storage usage
gsutil du -sh gs://BUCKET_NAME/**
gsutil ls -l gs://BUCKET_NAME/ | sort -k2

# Check for old versions
gsutil ls -a gs://BUCKET_NAME/
```

**Performance issues:**
```bash
# Use parallel operations
gsutil -m cp -r local-dir/ gs://BUCKET_NAME/

# Check network path
gsutil perfdiag gs://BUCKET_NAME
```

## Conclusion

Cloud Storage best practices:

1. **Organization:** Consistent naming, logical structure
2. **Access:** IAM-based, signed URLs, uniform access
3. **Storage classes:** Match to access patterns
4. **Lifecycle:** Automate transitions and deletions
5. **Security:** Encryption, CORS, public access prevention
6. **Performance:** Parallel uploads, composite objects
7. **Cost:** Lifecycle policies, appropriate classes
8. **Monitoring:** Metrics, logging, alerts

**Key takeaways:**
- Use uniform bucket-level access
- Implement lifecycle policies
- Choose appropriate storage classes
- Enable encryption
- Monitor usage and costs
- Organize with prefixes
- Use signed URLs for temporary access

Remember: Cloud Storage is highly scalable and cost-effective when properly
configured. Regular review of access patterns and lifecycle policies ensures
optimal performance and cost.
