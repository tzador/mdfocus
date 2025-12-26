# Compute Engine: Optimization and Management Best Practices

## Introduction

Google Compute Engine provides scalable, high-performance virtual machines. Proper
optimization and management are crucial for cost efficiency, performance, and
reliability.

This guide covers optimization strategies, management patterns, and best
practices for Compute Engine instances.

## Instance Optimization

### Right-Sizing Instances

**Match machine types to actual workload requirements.**

```bash
# Check current instance utilization
gcloud compute instances describe INSTANCE_NAME \
  --zone=ZONE \
  --format="get(machineType)"

# Get machine type recommendations
gcloud recommender recommendations list \
  --recommender=google.compute.instance.MachineTypeRecommender \
  --project=PROJECT_ID \
  --location=ZONE
```

**Machine type families:**
- **E2:** General purpose, cost-optimized
- **N1:** Previous generation, flexible
- **N2:** Balanced performance
- **N2D:** AMD processors, cost-effective
- **C2:** Compute-optimized
- **M1/M2:** Memory-optimized
- **A2:** GPU-accelerated

**Best practices:**
- Start with smaller instances
- Monitor CPU, memory, and network usage
- Use custom machine types for exact needs
- Consider shared-core for low-CPU workloads
- Use preemptible for fault-tolerant workloads

### Custom Machine Types

**Create instances with exact CPU/memory ratios.**

```bash
# Create custom machine type
gcloud compute instances create INSTANCE_NAME \
  --custom-cpu=4 \
  --custom-memory=8GB \
  --zone=us-central1-a
```

**When to use:**
- Standard types don't match your needs
- Need specific CPU/memory ratio
- Cost optimization (pay only for what you need)
- Fine-tuning performance

### Preemptible Instances

**Save up to 80% on compute costs.**

```bash
# Create preemptible instance
gcloud compute instances create INSTANCE_NAME \
  --preemptible \
  --machine-type=n1-standard-1 \
  --zone=us-central1-a
```

**Characteristics:**
- Can be terminated at any time (24-hour max)
- Up to 80% cost savings
- Suitable for fault-tolerant workloads
- Automatic restart with instance groups

**Use cases:**
- Batch processing
- CI/CD pipelines
- Data processing
- Development and testing
- Stateless workloads

**Best practices:**
- Implement checkpointing
- Use instance groups for auto-replacement
- Handle termination gracefully
- Monitor preemption rates
- Don't use for stateful, critical workloads

## Instance Groups

### Managed Instance Groups

**Automatically manage instance lifecycle.**

```bash
# Create managed instance group
gcloud compute instance-groups managed create MIG_NAME \
  --base-instance-name=base-instance \
  --size=3 \
  --template=INSTANCE_TEMPLATE \
  --zone=us-central1-a
```

**Features:**
- Automatic scaling
- Health checks
- Rolling updates
- Auto-healing
- Load balancing integration

### Autoscaling Configuration

**Scale based on metrics.**

```bash
# Configure autoscaling
gcloud compute instance-groups managed set-autoscaling MIG_NAME \
  --max-num-replicas=10 \
  --min-num-replicas=2 \
  --target-cpu-utilization=0.6 \
  --zone=us-central1-a
```

**Scaling metrics:**
- CPU utilization
- Load balancing serving capacity
- Custom metrics (Stackdriver)
- Queue-based (Pub/Sub)

**Best practices:**
- Set appropriate min/max replicas
- Use target CPU utilization (60-70%)
- Consider scaling cooldown periods
- Monitor scaling events
- Test scaling behavior

### Health Checks

**Ensure instances are healthy.**

```bash
# Create health check
gcloud compute health-checks create http HEALTH_CHECK_NAME \
  --port=80 \
  --request-path=/health

# Apply to instance group
gcloud compute instance-groups managed set-autohealing MIG_NAME \
  --health-check=HEALTH_CHECK_NAME \
  --initial-delay=300 \
  --zone=us-central1-a
```

**Health check types:**
- HTTP: For web servers
- HTTPS: For secure web servers
- TCP: For TCP services
- SSL: For SSL/TLS services

## Storage Optimization

### Persistent Disk Types

**Choose appropriate disk type.**

**Disk types:**
- **Standard:** HDD, cost-effective, suitable for most workloads
- **SSD Persistent:** High IOPS, low latency
- **Balanced:** Balanced performance and cost
- **Extreme:** Highest performance (NVMe)

```bash
# Create instance with SSD disk
gcloud compute instances create INSTANCE_NAME \
  --disk=name=DISK_NAME,size=100GB,type=pd-ssd \
  --zone=us-central1-a
```

**Selection guidelines:**
- Standard: Development, backups, low I/O
- Balanced: Most production workloads
- SSD: Database, high I/O applications
- Extreme: Highest performance requirements

### Disk Performance

**Optimize disk performance.**

```bash
# Create high-performance disk
gcloud compute disks create DISK_NAME \
  --size=500GB \
  --type=pd-ssd \
  --zone=us-central1-a \
  --provisioned-iops=10000
```

**Performance factors:**
- Disk type (SSD > Balanced > Standard)
- Disk size (larger = more IOPS)
- Provisioned IOPS (for extreme disks)
- Instance type (affects max IOPS)

### Snapshot Management

**Regular backups with lifecycle management.**

```bash
# Create snapshot
gcloud compute disks snapshot DISK_NAME \
  --snapshot-names=SNAPSHOT_NAME \
  --zone=us-central1-a

# Create snapshot schedule
gcloud compute resource-policies create snapshot-schedule SCHEDULE_NAME \
  --max-retention-days=7 \
  --start-time=02:00 \
  --daily-schedule \
  --region=us-central1
```

**Best practices:**
- Schedule regular snapshots
- Set retention policies
- Delete old snapshots
- Store snapshots in appropriate regions
- Test restore procedures

## Network Optimization

### Network Performance

**Optimize network configuration.**

```bash
# Create instance with specific network tier
gcloud compute instances create INSTANCE_NAME \
  --network-tier=PREMIUM \
  --zone=us-central1-a
```

**Network tiers:**
- **Premium:** Best performance, global load balancing
- **Standard:** Lower cost, regional only

**Best practices:**
- Use Premium tier for production
- Use Standard tier for internal traffic
- Minimize cross-region transfers
- Use Cloud CDN for static content
- Implement caching strategies

### IP Address Management

**Optimize IP address usage.**

```bash
# Reserve static IP
gcloud compute addresses create STATIC_IP_NAME \
  --region=us-central1

# Use ephemeral IP (no charge when stopped)
gcloud compute instances create INSTANCE_NAME \
  --no-address \
  --zone=us-central1-a
```

**IP address types:**
- **Ephemeral:** Free when instance running
- **Static:** Charged even when instance stopped
- **Internal:** Free, VPC internal only

**Best practices:**
- Use ephemeral IPs when possible
- Reserve static IPs only when needed
- Release unused static IPs
- Use internal IPs for internal communication

## Security Best Practices

### OS Login

**Better security and auditability.**

```bash
# Enable OS Login
gcloud compute instances add-metadata INSTANCE_NAME \
  --metadata enable-oslogin=TRUE \
  --zone=us-central1-a
```

**Benefits:**
- Centralized SSH key management
- IAM-based access control
- Audit logging
- No need to manage SSH keys on instances

### Shielded VMs

**Enhanced security features.**

```bash
# Create shielded VM
gcloud compute instances create INSTANCE_NAME \
  --shielded-secure-boot \
  --shielded-vtpm \
  --shielded-integrity-monitoring \
  --zone=us-central1-a
```

**Features:**
- Secure Boot: Verified boot process
- vTPM: Virtual Trusted Platform Module
- Integrity Monitoring: Detect tampering

### Firewall Rules

**Implement least-privilege firewall rules.**

```bash
# Create specific firewall rule
gcloud compute firewall-rules create ALLOW_HTTP \
  --allow=tcp:80 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=web-server \
  --description="Allow HTTP traffic to web servers"
```

**Best practices:**
- Use specific source ranges
- Apply rules to specific tags
- Deny by default, allow explicitly
- Regular review and cleanup
- Use network tags for grouping

## Monitoring and Maintenance

### Monitoring Setup

**Comprehensive monitoring configuration.**

```bash
# Install monitoring agent
curl -sSO https://dl.google.com/cloudagents/add-monitoring-agent-repo.sh
sudo bash add-monitoring-agent-repo.sh
sudo apt-get update
sudo apt-get install stackdriver-agent
```

**Key metrics to monitor:**
- CPU utilization
- Memory usage
- Disk I/O
- Network traffic
- Instance uptime
- Error rates

### Logging

**Centralized logging setup.**

```bash
# Install logging agent
curl -sSO https://dl.google.com/cloudagents/add-logging-agent-repo.sh
sudo bash add-logging-agent-repo.sh
sudo apt-get update
sudo apt-get install google-fluentd
```

**Best practices:**
- Use structured logging
- Include correlation IDs
- Set appropriate log levels
- Configure log retention
- Export to BigQuery for analysis

### Maintenance Windows

**Schedule maintenance activities.**

```bash
# Set maintenance policy
gcloud compute instance-groups managed set-instance-template MIG_NAME \
  --template=NEW_TEMPLATE \
  --zone=us-central1-a
```

**Best practices:**
- Use managed instance groups for rolling updates
- Schedule maintenance during low-traffic periods
- Test updates in non-production first
- Have rollback plan ready
- Communicate maintenance windows

## Cost Optimization

### Committed Use Discounts

**Save with 1-3 year commitments.**

```bash
# Create committed use discount
gcloud compute commitments create COMMITMENT_NAME \
  --plan=TWELVE_MONTH \
  --resources=vcpu=4,memory=16 \
  --region=us-central1
```

**Discounts:**
- 1-year: 20-30% discount
- 3-year: 50-70% discount
- Regional: Flexible across zones
- Specific machine types: Higher discounts

### Sustained Use Discounts

**Automatic discounts for long-running instances.**

**How it works:**
- Automatic 20-30% discount
- Applies after 25% of month usage
- Increases with more usage
- No commitment required

**Optimization:**
- Consolidate workloads
- Run instances for full billing month
- Use same machine type family

### Resource Cleanup

**Remove unused resources.**

```bash
# List all instances
gcloud compute instances list

# Delete unused instances
gcloud compute instances delete INSTANCE_NAME --zone=ZONE

# List unattached disks
gcloud compute disks list --filter="-users:*"

# Delete unattached disks
gcloud compute disks delete DISK_NAME --zone=ZONE
```

**Regular cleanup:**
- Unused instances
- Unattached persistent disks
- Unused static IPs
- Old snapshots
- Unused images

## Automation

### Instance Templates

**Standardize instance configurations.**

```bash
# Create instance template
gcloud compute instance-templates create TEMPLATE_NAME \
  --machine-type=n1-standard-1 \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --tags=web-server \
  --metadata=startup-script-url=gs://BUCKET/script.sh
```

**Benefits:**
- Consistent configurations
- Version control
- Easy updates
- Managed instance group integration

### Startup Scripts

**Automate instance initialization.**

```bash
# Create startup script
cat > startup-script.sh << 'EOF'
#!/bin/bash
apt-get update
apt-get install -y nginx
systemctl start nginx
EOF

# Use in instance template
gcloud compute instance-templates create TEMPLATE_NAME \
  --metadata-from-file startup-script=startup-script.sh
```

**Best practices:**
- Make scripts idempotent
- Handle errors gracefully
- Log script execution
- Use cloud-init for complex setups
- Store scripts in Cloud Storage

### Deployment Automation

**Automate deployments with Terraform.**

```hcl
# Terraform example
resource "google_compute_instance" "web" {
  name         = "web-instance"
  machine_type = "n1-standard-1"
  zone         = "us-central1-a"

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2004-lts"
    }
  }

  network_interface {
    network = "default"
    access_config {}
  }

  metadata_startup_script = file("startup-script.sh")
}
```

## High Availability

### Multi-Zone Deployment

**Deploy across multiple zones.**

```bash
# Create regional managed instance group
gcloud compute instance-groups managed create MIG_NAME \
  --region=us-central1 \
  --template=INSTANCE_TEMPLATE \
  --size=3
```

**Benefits:**
- Zone failure tolerance
- Better availability
- Load distribution
- Automatic failover

### Load Balancing

**Distribute traffic across instances.**

```bash
# Create backend service
gcloud compute backend-services create BACKEND_SERVICE \
  --health-checks=HEALTH_CHECK \
  --protocol=HTTP

# Add instance group to backend
gcloud compute backend-services add-backend BACKEND_SERVICE \
  --instance-group=MIG_NAME \
  --instance-group-zone=us-central1-a
```

## Troubleshooting

### Common Issues

**Instance won't start:**
```bash
# Check instance status
gcloud compute instances describe INSTANCE_NAME --zone=ZONE

# View serial console output
gcloud compute instances get-serial-port-output INSTANCE_NAME --zone=ZONE
```

**High CPU usage:**
```bash
# SSH into instance and check
top
htop
# Identify processes consuming CPU
```

**Disk space issues:**
```bash
# Check disk usage
df -h
# Clean up logs, temp files
```

### Performance Tuning

**Optimize instance performance.**

**Linux optimizations:**
- Tune kernel parameters
- Optimize I/O scheduler
- Configure swap appropriately
- Use SSD for high I/O workloads

**Application optimizations:**
- Connection pooling
- Caching strategies
- Resource limits
- Monitoring and profiling

## Conclusion

Compute Engine optimization best practices:

1. **Right-size:** Match machine types to workloads
2. **Use preemptible:** For fault-tolerant workloads
3. **Optimize storage:** Choose appropriate disk types
4. **Network:** Minimize egress, use CDN
5. **Security:** OS Login, Shielded VMs, firewall rules
6. **Monitor:** Comprehensive monitoring and logging
7. **Automate:** Templates, scripts, Infrastructure as Code
8. **Cost optimize:** Committed use, sustained use, cleanup

**Key takeaways:**
- Start small, scale based on metrics
- Use managed instance groups for HA
- Implement proper health checks
- Monitor and optimize continuously
- Automate deployments and maintenance
- Regular cleanup of unused resources

Remember: Compute Engine optimization is an ongoing process. Regularly review
and adjust based on actual usage patterns and requirements.
