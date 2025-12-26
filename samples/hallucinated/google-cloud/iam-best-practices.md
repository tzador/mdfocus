# Google Cloud IAM: Best Practices and Security Patterns

## Introduction

Google Cloud Identity and Access Management (IAM) is the foundation of security in GCP. Proper IAM configuration ensures that users, services, and applications have the minimum necessary permissions to perform their functions while maintaining security and compliance.

This guide covers IAM best practices, common patterns, and security strategies for managing access in Google Cloud Platform.

## Core IAM Concepts

### Resources Hierarchy

GCP uses a hierarchical resource model:
```
Organization
  └── Folders
      └── Projects
          └── Resources (VMs, buckets, databases, etc.)
```

**Key principles:**
- Permissions are inherited down the hierarchy
- Organization policies can enforce constraints across all resources
- IAM policies can be set at any level (organization, folder, project, resource)

### IAM Components

1. **Principals (Who):**
   - Google accounts (users)
   - Service accounts
   - Google Groups
   - Google Workspace domains
   - All authenticated users
   - All users (public)

2. **Roles (What):**
   - Predefined roles (curated by Google)
   - Custom roles (user-defined)
   - Primitive roles (Owner, Editor, Viewer - avoid in production)

3. **Resources (Where):**
   - Organization
   - Folders
   - Projects
   - Individual resources (buckets, VMs, etc.)

## Best Practices

### 1. Use Service Accounts for Applications

**Never use user accounts for application authentication.**

```yaml
# ❌ Bad: Using user account
gcloud auth activate-service-account user@example.com

# ✅ Good: Using service account
gcloud auth activate-service-account \
  --key-file=service-account-key.json
```

**Best practices:**
- Create dedicated service accounts for each application or service
- Use descriptive names: `my-app-backend@project.iam.gserviceaccount.com`
- Grant service accounts only the permissions they need
- Use Workload Identity for GKE workloads (no key management)
- Rotate service account keys regularly

### 2. Implement Least Privilege

**Grant only the minimum permissions necessary.**

```yaml
# ❌ Bad: Overly permissive
- members:
  - serviceAccount:app@project.iam.gserviceaccount.com
  role: roles/owner

# ✅ Good: Specific permissions
- members:
  - serviceAccount:app@project.iam.gserviceaccount.com
  role: roles/storage.objectViewer  # Only read access
```

**Strategy:**
1. Start with no permissions
2. Grant permissions incrementally as needed
3. Use predefined roles when they match your needs
4. Create custom roles for specific requirements
5. Regularly audit and remove unused permissions

### 3. Use Google Groups for User Management

**Manage users through groups, not individual assignments.**

```yaml
# ❌ Bad: Individual user assignments
- members:
  - user:alice@example.com
  - user:bob@example.com
  - user:charlie@example.com
  role: roles/cloudsql.client

# ✅ Good: Group-based management
- members:
  - group:developers@example.com
  role: roles/cloudsql.client
```

**Benefits:**
- Easier to manage permissions for multiple users
- Automatic updates when users join/leave groups
- Better audit trail and compliance
- Separation of concerns (group membership vs. permissions)

### 4. Avoid Primitive Roles in Production

**Primitive roles (Owner, Editor, Viewer) are too broad.**

```yaml
# ❌ Bad: Primitive role
- members:
  - user:developer@example.com
  role: roles/owner  # Too permissive!

# ✅ Good: Specific predefined role
- members:
  - user:developer@example.com
  role: roles/compute.instanceAdmin  # Specific to compute
```

**Why avoid primitive roles:**
- Owner: Can delete projects, modify billing, change IAM
- Editor: Can modify all resources (except IAM)
- Viewer: Read-only, but can see sensitive data

**Exception:** Use primitive roles only for:
- Initial project setup
- Emergency access (with proper controls)
- Development/test environments (with caution)

### 5. Create Custom Roles for Specific Needs

**When predefined roles don't fit, create custom roles.**

```yaml
# Example: Custom role for CI/CD pipeline
title: "CI/CD Pipeline Role"
description: "Permissions for CI/CD to deploy applications"
stage: "GA"
includedPermissions:
  - storage.objects.create
  - storage.objects.delete
  - cloudbuild.builds.create
  - cloudbuild.builds.update
  - run.services.update
  # Explicitly exclude dangerous permissions
```

**Best practices:**
- Start with a predefined role and modify
- Include only necessary permissions
- Document why each permission is needed
- Test custom roles in non-production first
- Version control your custom role definitions

### 6. Use Conditional IAM Policies

**Add conditions to IAM bindings for fine-grained control.**

```yaml
# Example: Allow access only during business hours
bindings:
- members:
  - user:contractor@example.com
  role: roles/compute.instanceAdmin
  condition:
    title: "Business Hours Only"
    description: "Access only during business hours"
    expression: |
      request.time.getHours() >= 9 &&
      request.time.getHours() <= 17 &&
      request.time.getDayOfWeek() >= 1 &&
      request.time.getDayOfWeek() <= 5
```

**Use cases:**
- Time-based access restrictions
- IP address restrictions
- Resource attribute conditions
- Temporary access grants

### 7. Implement Separation of Duties

**Separate administrative functions to prevent conflicts of interest.**

**Key separations:**
- **Security Admin:** Manages IAM, security policies
- **Network Admin:** Manages VPC, networking
- **Billing Admin:** Manages billing, budgets
- **Developer:** Manages application resources
- **Auditor:** Read-only access for compliance

```yaml
# Example: Separate security and development
# Security team
- members:
  - group:security-team@example.com
  role: roles/iam.securityAdmin

# Development team
- members:
  - group:developers@example.com
  role: roles/compute.developer
  # Cannot modify IAM
```

### 8. Enable Audit Logging

**Track all IAM changes and access for compliance.**

```bash
# Enable audit logs for IAM
gcloud logging sinks create iam-audit-sink \
  bigquery.googleapis.com/projects/PROJECT_ID/datasets/audit_logs \
  --log-filter='protoPayload.serviceName="iam.googleapis.com"'
```

**What to log:**
- IAM policy changes
- Service account key creation/deletion
- Permission grants/revocations
- Failed authentication attempts
- Privilege escalations

### 9. Use Workload Identity for GKE

**Eliminate service account key management for Kubernetes.**

```yaml
# Workload Identity configuration
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-app-sa
  namespace: default
  annotations:
    iam.gke.io/gcp-service-account: my-app@PROJECT_ID.iam.gserviceaccount.com
```

**Benefits:**
- No service account keys to manage
- Automatic credential rotation
- Better security (keys never stored)
- Simpler key rotation process

### 10. Implement Organization Policies

**Enforce constraints across all projects.**

```yaml
# Example: Prevent public bucket creation
constraint: storage.uniformBucketLevelAccess
enforced: true

# Example: Require OS Login
constraint: compute.requireOsLogin
enforced: true
```

**Common policies:**
- Disable public IP addresses
- Require specific machine types
- Enforce resource location restrictions
- Require VPC for compute resources
- Disable service account key creation

## Common Patterns

### Pattern 1: Multi-Environment Access

**Separate access for dev, staging, and production.**

```yaml
# Development environment
projects:
  - dev-project:
      developers: roles/editor
      qa: roles/viewer

# Production environment
projects:
  - prod-project:
      developers: roles/viewer  # Read-only
      ops-team: roles/editor
      security: roles/iam.securityAdmin
```

### Pattern 2: Cross-Project Service Accounts

**Service account from one project accessing another.**

```yaml
# Project A: Service account
serviceAccount: app-sa@project-a.iam.gserviceaccount.com

# Project B: Grant access
bindings:
- members:
  - serviceAccount:app-sa@project-a.iam.gserviceaccount.com
  role: roles/storage.objectViewer
```

### Pattern 3: Temporary Access Grants

**Grant time-limited access using conditions.**

```yaml
bindings:
- members:
  - user:contractor@example.com
  role: roles/compute.instanceAdmin
  condition:
    expression: |
      request.time < timestamp("2024-12-31T23:59:59Z")
    title: "Temporary Access"
```

### Pattern 4: Resource-Level Permissions

**Grant permissions on specific resources, not entire projects.**

```yaml
# Bucket-level permissions
bindings:
- members:
  - serviceAccount:app@project.iam.gserviceaccount.com
  role: roles/storage.objectAdmin
  # Applied only to this bucket
```

### Pattern 5: Delegation Pattern

**Service account impersonation for secure access.**

```bash
# Impersonate service account
gcloud config set auth/impersonate_service_account \
  target-sa@project.iam.gserviceaccount.com
```

**Use cases:**
- CI/CD pipelines accessing multiple projects
- Admin operations without permanent permissions
- Audit and compliance reviews

## Security Hardening

### 1. Service Account Key Management

**Minimize and secure service account keys.**

```bash
# List all service account keys
gcloud iam service-accounts keys list \
  --iam-account=SERVICE_ACCOUNT_EMAIL

# Rotate keys regularly
gcloud iam service-accounts keys create new-key.json \
  --iam-account=SERVICE_ACCOUNT_EMAIL

# Delete old keys
gcloud iam service-accounts keys delete KEY_ID \
  --iam-account=SERVICE_ACCOUNT_EMAIL
```

**Best practices:**
- Use Workload Identity instead of keys when possible
- Rotate keys every 90 days (or per compliance requirements)
- Store keys in Secret Manager, not in code
- Limit key creation permissions
- Monitor key usage

### 2. Enable Organization Policies

**Prevent dangerous configurations.**

```bash
# Disable service account key creation
gcloud resource-manager org-policies set-policy \
  disable-service-account-key-creation.yaml \
  --organization=ORGANIZATION_ID

# Require OS Login
gcloud resource-manager org-policies set-policy \
  require-os-login.yaml \
  --organization=ORGANIZATION_ID
```

### 3. Implement VPC Service Controls

**Restrict service-to-service communication.**

```yaml
# VPC Service Controls perimeter
perimeter:
  name: production-perimeter
  resources:
    - projects/PROJECT_ID
  restrictedServices:
    - storage.googleapis.com
    - bigquery.googleapis.com
  vpcAccessibleServices:
    - storage.googleapis.com
```

### 4. Regular Access Reviews

**Periodically review and audit permissions.**

```bash
# Analyze IAM policy
gcloud asset analyze-iam-policy \
  --full-resource-name=//cloudresourcemanager.googleapis.com/projects/PROJECT_ID \
  --identity=user:user@example.com

# Export IAM policies
gcloud projects get-iam-policy PROJECT_ID \
  --format=json > iam-policy.json
```

**Review checklist:**
- Remove unused service accounts
- Revoke access for departed employees
- Review service account permissions
- Check for overly permissive roles
- Verify conditional policies are still needed
- Audit cross-project access

### 5. Enable Security Command Center

**Monitor for IAM misconfigurations.**

```bash
# Enable Security Command Center
gcloud scc settings update \
  --organization=ORGANIZATION_ID \
  --enable-google-cloud-asset-inventory
```

**Key findings to monitor:**
- Public buckets
- Service accounts with owner permissions
- Users with primitive roles
- Overly permissive firewall rules
- Missing MFA

## Troubleshooting Common Issues

### Issue 1: Permission Denied Errors

**Diagnosis:**
```bash
# Test permissions
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:user@example.com"

# Check effective permissions
gcloud asset analyze-iam-policy \
  --full-resource-name=//cloudresourcemanager.googleapis.com/projects/PROJECT_ID \
  --identity=user:user@example.com
```

### Issue 2: Service Account Authentication Failures

**Common causes:**
- Expired or invalid keys
- Service account deleted
- Insufficient permissions
- Wrong project context

**Solution:**
```bash
# Verify service account exists
gcloud iam service-accounts describe \
  SERVICE_ACCOUNT_EMAIL

# Test authentication
gcloud auth activate-service-account \
  --key-file=key.json
```

### Issue 3: Inheritance Not Working

**Check hierarchy:**
```bash
# View organization structure
gcloud resource-manager folders list \
  --organization=ORGANIZATION_ID

# Check project hierarchy
gcloud projects describe PROJECT_ID
```

## Compliance and Governance

### 1. IAM Policy Documentation

**Document all IAM policies and decisions.**

```markdown
# IAM Policy Documentation Template

## Service Account: app-backend@project.iam.gserviceaccount.com
- **Purpose:** Backend application authentication
- **Permissions:** roles/cloudsql.client, roles/storage.objectViewer
- **Justification:** Needs database access and read-only storage
- **Review Date:** 2024-12-31
- **Owner:** team@example.com
```

### 2. Access Request Process

**Implement formal access request workflow:**
1. Request submitted with justification
2. Manager approval
3. Security team review
4. Temporary access grant (if applicable)
5. Regular access review
6. Automatic revocation after expiration

### 3. Compliance Reporting

**Generate compliance reports:**

```bash
# Export all IAM policies
gcloud asset export \
  --output-path=gs://bucket/iam-export \
  --content-type=iam-policy \
  --project=PROJECT_ID

# Analyze for compliance
gcloud asset analyze-iam-policy \
  --full-resource-name=//cloudresourcemanager.googleapis.com/projects/PROJECT_ID
```

## Automation and Infrastructure as Code

### Terraform Example

```hcl
# Service account
resource "google_service_account" "app" {
  account_id   = "app-backend"
  display_name = "Application Backend Service Account"
}

# IAM binding
resource "google_project_iam_member" "app_storage" {
  project = var.project_id
  role    = "roles/storage.objectViewer"
  member  = "serviceAccount:${google_service_account.app.email}"
}

# Custom role
resource "google_project_iam_custom_role" "custom" {
  role_id     = "customRole"
  title       = "Custom Role"
  description = "Custom role for specific needs"
  permissions = [
    "storage.objects.get",
    "storage.objects.list",
  ]
}
```

### Deployment Manager Example

```yaml
resources:
- name: app-service-account
  type: iam.v1.serviceAccount
  properties:
    accountId: app-backend
    displayName: Application Backend

- name: app-storage-binding
  type: gcp-types/cloudresourcemanager-v1:virtual.projects.iamMemberBinding
  properties:
    resource: $(ref.project.projectId)
    role: roles/storage.objectViewer
    member: serviceAccount:$(ref.app-service-account.email)
```

## Conclusion

Effective IAM management requires:
1. **Principle of least privilege:** Grant minimum necessary permissions
2. **Regular audits:** Review and remove unused access
3. **Automation:** Use Infrastructure as Code for consistency
4. **Documentation:** Maintain clear records of all permissions
5. **Monitoring:** Track changes and access patterns
6. **Separation of duties:** Distribute administrative functions
7. **Service accounts:** Use for all application authentication
8. **Groups:** Manage users through groups, not individuals

Remember: IAM is not a one-time setup. It requires ongoing maintenance, monitoring, and adjustment as your organization and applications evolve. Regular reviews and audits are essential for maintaining security and compliance.
