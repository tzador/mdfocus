# VPC Design: Patterns and Security Best Practices

## Introduction

Virtual Private Cloud (VPC) is the foundation of network security and
connectivity in Google Cloud. Proper VPC design ensures security, scalability,
and operational efficiency.

This guide covers VPC design patterns, security best practices, and network
architecture strategies.

## VPC Fundamentals

### VPC Types

**Choose appropriate VPC mode.**

```bash
# Auto mode VPC (default, simple)
# Automatically creates subnets in each region

# Custom mode VPC (recommended for production)
gcloud compute networks create CUSTOM_VPC \
  --subnet-mode=custom
```

**Auto mode:**
- ✅ Simple setup
- ✅ Automatic subnet creation
- ❌ Less control
- ❌ Fixed IP ranges

**Custom mode:**
- ✅ Full control
- ✅ Flexible IP ranges
- ✅ Better for production
- ❌ Manual subnet creation

### Subnet Design

**Design subnets for your architecture.**

```bash
# Create custom subnet
gcloud compute networks subnets create SUBNET_NAME \
  --network=VPC_NETWORK \
  --range=10.0.1.0/24 \
  --region=us-central1 \
  --enable-private-ip-google-access
```

**Subnet design principles:**
- Use CIDR notation (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
- Plan for growth (don't use entire /8)
- Separate by function (app, db, dmz)
- Use consistent addressing
- Reserve IP ranges for future use

### IP Address Planning

**Plan IP address allocation.**

```
VPC: 10.0.0.0/16
├── us-central1
│   ├── app-subnet: 10.0.1.0/24
│   ├── db-subnet: 10.0.2.0/24
│   └── dmz-subnet: 10.0.3.0/24
├── us-east1
│   ├── app-subnet: 10.0.11.0/24
│   ├── db-subnet: 10.0.12.0/24
│   └── dmz-subnet: 10.0.13.0/24
└── Reserved: 10.0.100.0/24 - 10.0.255.0/24
```

**Best practices:**
- Use private IP ranges (RFC 1918)
- Allocate /24 subnets (256 IPs)
- Reserve ranges for future expansion
- Document IP allocation
- Avoid overlapping ranges

## Network Architecture Patterns

### Single VPC Pattern

**Simple architecture for small deployments.**

```
VPC (10.0.0.0/16)
├── App Subnet (10.0.1.0/24)
├── DB Subnet (10.0.2.0/24)
└── Shared Services (10.0.3.0/24)
```

**Use when:**
- Small to medium deployments
- Single team/project
- Simple requirements
- Limited security isolation needs

### Hub-and-Spoke Pattern

**Centralized services with distributed workloads.**

```
Hub VPC (10.0.0.0/16)
├── Shared Services
│   ├── DNS
│   ├── Monitoring
│   └── Security Services
└── Spoke VPCs
    ├── Production (10.1.0.0/16)
    ├── Staging (10.2.0.0/16)
    └── Development (10.3.0.0/16)
```

**Implementation:**
```bash
# Create hub VPC
gcloud compute networks create hub-vpc --subnet-mode=custom

# Create spoke VPCs
gcloud compute networks create prod-vpc --subnet-mode=custom
gcloud compute networks create staging-vpc --subnet-mode=custom

# VPC peering
gcloud compute networks peerings create hub-to-prod \
  --network=hub-vpc \
  --peer-network=prod-vpc \
  --auto-create-routes
```

**Benefits:**
- Centralized management
- Shared services
- Isolated workloads
- Scalable architecture

### Multi-Region Pattern

**Global deployment with regional isolation.**

```
Global VPC
├── us-central1
│   ├── app-subnet
│   └── db-subnet
├── us-east1
│   ├── app-subnet
│   └── db-subnet
└── europe-west1
    ├── app-subnet
    └── db-subnet
```

**Best practices:**
- Consistent subnet design across regions
- Regional failover capability
- Global load balancing
- Regional data residency

## Security Best Practices

### Firewall Rules

**Implement least-privilege firewall rules.**

```bash
# Deny all by default (implicit)
# Create specific allow rules

# Allow SSH from specific source
gcloud compute firewall-rules create allow-ssh \
  --network=VPC_NETWORK \
  --allow=tcp:22 \
  --source-ranges=203.0.113.0/24 \
  --target-tags=ssh-allowed \
  --description="Allow SSH from office IP"

# Allow HTTP from load balancer
gcloud compute firewall-rules create allow-http \
  --network=VPC_NETWORK \
  --allow=tcp:80,tcp:443 \
  --source-ranges=130.211.0.0/22,35.191.0.0/16 \
  --target-tags=web-server \
  --description="Allow HTTP/HTTPS from load balancer"

# Allow internal communication
gcloud compute firewall-rules create allow-internal \
  --network=VPC_NETWORK \
  --allow=tcp:0-65535,udp:0-65535,icmp \
  --source-ranges=10.0.0.0/16 \
  --description="Allow all internal traffic"
```

**Firewall rule best practices:**
- Deny by default (implicit)
- Allow explicitly what's needed
- Use specific source ranges
- Apply rules to network tags
- Use priority for rule ordering
- Document all rules
- Regular review and cleanup

### Network Tags

**Use tags for firewall rule targeting.**

```bash
# Create instance with tags
gcloud compute instances create INSTANCE_NAME \
  --network=VPC_NETWORK \
  --subnet=SUBNET_NAME \
  --tags=web-server,ssh-allowed \
  --zone=us-central1-a
```

**Tag strategy:**
- Use descriptive names
- Group by function (web-server, db-server)
- Group by environment (prod, staging)
- Apply consistently
- Document tag meanings

### Private Google Access

**Enable access to Google APIs without external IP.**

```bash
# Enable private Google access on subnet
gcloud compute networks subnets update SUBNET_NAME \
  --region=us-central1 \
  --enable-private-ip-google-access
```

**Benefits:**
- No external IP needed
- Better security
- Access to Google APIs
- Reduced attack surface

### Cloud NAT

**Outbound internet access without external IPs.**

```bash
# Create Cloud NAT
gcloud compute routers create NAT_ROUTER \
  --network=VPC_NETWORK \
  --region=us-central1

gcloud compute routers nats create NAT_CONFIG \
  --router=NAT_ROUTER \
  --region=us-central1 \
  --nat-all-subnet-ip-ranges \
  --auto-allocate-nat-external-ips
```

**Use cases:**
- Outbound internet access
- Software updates
- API calls to external services
- No inbound access needed

## Advanced Networking

### VPC Peering

**Connect VPCs securely.**

```bash
# Create VPC peering
gcloud compute networks peerings create PEERING_NAME \
  --network=VPC_1 \
  --peer-network=VPC_2 \
  --auto-create-routes
```

**Peering types:**
- **Internal:** Within same project
- **External:** Between projects
- **Transitive:** Through hub VPC

**Best practices:**
- Use non-overlapping IP ranges
- Plan peering topology
- Monitor peering status
- Use custom routes if needed

### Shared VPC

**Share VPC across projects.**

```bash
# Host project: Enable Shared VPC
gcloud compute shared-vpc enable PROJECT_ID

# Attach service project
gcloud compute shared-vpc associated-projects add SERVICE_PROJECT \
  --host-project=HOST_PROJECT
```

**Benefits:**
- Centralized network management
- Shared firewall rules
- Consistent security policies
- Cost optimization

### Cloud VPN

**Connect to on-premises or other clouds.**

```bash
# Create VPN gateway
gcloud compute vpn-gateways create VPN_GATEWAY \
  --network=VPC_NETWORK \
  --region=us-central1

# Create VPN tunnel
gcloud compute vpn-tunnels create TUNNEL_NAME \
  --peer-gcp-gateway=PEER_GATEWAY \
  --region=us-central1 \
  --ike-version=2 \
  --shared-secret=SECRET \
  --target-vpn-gateway=VPN_GATEWAY
```

**Use cases:**
- Hybrid cloud connectivity
- On-premises integration
- Multi-cloud connectivity
- Secure site-to-site VPN

### Cloud Interconnect

**Dedicated connection to Google Cloud.**

```bash
# Create interconnect attachment
gcloud compute interconnects attachments create ATTACHMENT_NAME \
  --region=us-central1 \
  --interconnect=INTERCONNECT_NAME \
  --router=ROUTER_NAME \
  --vlan-tag=8021q
```

**Types:**
- **Dedicated Interconnect:** Physical connection
- **Partner Interconnect:** Through service provider
- **Cross-Cloud Interconnect:** To other clouds

## Monitoring and Operations

### VPC Flow Logs

**Monitor network traffic.**

```bash
# Enable VPC flow logs
gcloud compute networks update VPC_NETWORK \
  --enable-flow-logs \
  --logging-aggregation-interval=interval-5-sec \
  --logging-flow-sampling=0.5 \
  --logging-metadata=include-all
```

**Use cases:**
- Security monitoring
- Traffic analysis
- Troubleshooting
- Compliance

### Firewall Rules Logging

**Log firewall rule matches.**

```bash
# Enable logging on firewall rule
gcloud compute firewall-rules update RULE_NAME \
  --enable-logging
```

**Benefits:**
- Security audit trail
- Troubleshooting
- Compliance requirements
- Traffic analysis

### Network Monitoring

**Monitor network performance.**

```bash
# View network topology
gcloud compute networks describe VPC_NETWORK

# Check routes
gcloud compute routes list --filter="network:VPC_NETWORK"

# View firewall rules
gcloud compute firewall-rules list --filter="network:VPC_NETWORK"
```

## Cost Optimization

### Egress Cost Management

**Minimize egress costs.**

**Strategies:**
- Use same-region resources
- Use Cloud CDN for content
- Minimize cross-region transfers
- Use Cloud Interconnect for high volume
- Cache content locally

### IP Address Management

**Optimize IP address usage.**

```bash
# Use internal IPs when possible
gcloud compute instances create INSTANCE_NAME \
  --no-address \
  --network=VPC_NETWORK

# Release unused static IPs
gcloud compute addresses list
gcloud compute addresses delete STATIC_IP_NAME --region=REGION
```

## Troubleshooting

### Common Issues

**Connectivity problems:**
```bash
# Check firewall rules
gcloud compute firewall-rules list --filter="network:VPC_NETWORK"

# Test connectivity
gcloud compute instances describe INSTANCE_NAME --zone=ZONE

# Check routes
gcloud compute routes list --filter="network:VPC_NETWORK"
```

**DNS resolution:**
```bash
# Check DNS configuration
gcloud dns managed-zones list

# Test DNS resolution
nslookup hostname
```

## Best Practices Summary

1. **Design:** Use custom mode VPC, plan IP ranges
2. **Security:** Least-privilege firewall, network tags
3. **Architecture:** Choose appropriate pattern (single, hub-spoke, multi-region)
4. **Connectivity:** Private Google Access, Cloud NAT, VPN
5. **Monitoring:** Flow logs, firewall logging
6. **Cost:** Minimize egress, optimize IP usage
7. **Documentation:** Document design, IP allocation, rules

**Key takeaways:**
- Use custom mode VPC for production
- Plan IP address allocation carefully
- Implement least-privilege firewall rules
- Use network tags for rule targeting
- Enable private Google access
- Monitor with flow logs
- Document network architecture

Remember: VPC design is foundational to cloud security and operations. Proper
planning and implementation ensure scalable, secure, and manageable network
infrastructure.
