# Load Balancing: Strategies and Configurations

## Introduction

Google Cloud Load Balancing provides scalable, high-availability traffic
distribution. Proper configuration ensures optimal performance, reliability, and
cost efficiency.

This guide covers load balancing strategies, configuration patterns, and best
practices for Google Cloud.

## Load Balancer Types

### HTTP(S) Load Balancing

**Global HTTP(S) load balancing for web applications.**

```bash
# Create backend service
gcloud compute backend-services create BACKEND_SERVICE \
  --protocol=HTTP \
  --health-checks=HEALTH_CHECK \
  --global

# Create URL map
gcloud compute url-maps create URL_MAP \
  --default-service=BACKEND_SERVICE

# Create HTTPS proxy
gcloud compute target-https-proxies create HTTPS_PROXY \
  --url-map=URL_MAP \
  --ssl-certificates=SSL_CERT

# Create forwarding rule
gcloud compute forwarding-rules create HTTP_RULE \
  --global \
  --target-https-proxy=HTTPS_PROXY \
  --ports=443
```

**Features:**
- Global anycast IP
- SSL/TLS termination
- Content-based routing
- Session affinity
- CDN integration

**Use cases:**
- Web applications
- APIs
- Microservices
- Global applications

### Network Load Balancing

**Regional TCP/UDP load balancing.**

```bash
# Create backend service
gcloud compute backend-services create BACKEND_SERVICE \
  --protocol=TCP \
  --health-checks=HEALTH_CHECK \
  --region=us-central1

# Create forwarding rule
gcloud compute forwarding-rules create TCP_RULE \
  --region=us-central1 \
  --backend-service=BACKEND_SERVICE \
  --ports=3306
```

**Features:**
- Regional distribution
- TCP/UDP protocols
- Preserves source IP
- High performance

**Use cases:**
- Database connections
- Non-HTTP protocols
- Regional applications
- High-performance requirements

### Internal Load Balancing

**Internal load balancing within VPC.**

```bash
# Create internal backend service
gcloud compute backend-services create INTERNAL_BACKEND \
  --protocol=HTTP \
  --health-checks=HEALTH_CHECK \
  --load-balancing-scheme=INTERNAL \
  --region=us-central1

# Create internal forwarding rule
gcloud compute forwarding-rules create INTERNAL_RULE \
  --region=us-central1 \
  --load-balancing-scheme=INTERNAL \
  --backend-service=INTERNAL_BACKEND \
  --subnet=SUBNET_NAME \
  --ports=80
```

**Features:**
- VPC internal only
- Private IP addresses
- Regional distribution
- Lower cost

**Use cases:**
- Internal APIs
- Microservices
- Database connections
- Internal services

## Configuration Patterns

### Health Checks

**Configure health checks for backend health.**

```bash
# HTTP health check
gcloud compute health-checks create http HTTP_CHECK \
  --port=80 \
  --request-path=/health \
  --check-interval=10 \
  --timeout=5 \
  --healthy-threshold=2 \
  --unhealthy-threshold=3

# HTTPS health check
gcloud compute health-checks create https HTTPS_CHECK \
  --port=443 \
  --request-path=/health \
  --use-serving-port

# TCP health check
gcloud compute health-checks create tcp TCP_CHECK \
  --port=3306
```

**Best practices:**
- Use appropriate check interval (10-30 seconds)
- Set reasonable timeouts
- Configure healthy/unhealthy thresholds
- Use dedicated health check endpoints
- Keep health checks lightweight

### Backend Configuration

**Configure backend services.**

```bash
# Create instance group
gcloud compute instance-groups managed create INSTANCE_GROUP \
  --base-instance-name=backend \
  --size=3 \
  --template=INSTANCE_TEMPLATE \
  --zone=us-central1-a

# Add instance group to backend
gcloud compute backend-services add-backend BACKEND_SERVICE \
  --instance-group=INSTANCE_GROUP \
  --instance-group-zone=us-central1-a \
  --balancing-mode=UTILIZATION \
  --max-utilization=0.8
```

**Balancing modes:**
- **UTILIZATION:** Based on CPU utilization
- **RATE:** Based on requests per second
- **CONNECTION:** Based on concurrent connections

**Best practices:**
- Use appropriate balancing mode
- Set capacity thresholds
- Configure session affinity when needed
- Use connection draining
- Monitor backend health

### Session Affinity

**Maintain session state.**

```bash
# Configure session affinity
gcloud compute backend-services update BACKEND_SERVICE \
  --session-affinity=CLIENT_IP \
  --affinity-cookie-ttl=3600
```

**Affinity types:**
- **NONE:** No affinity (default)
- **CLIENT_IP:** Based on client IP
- **GENERATED_COOKIE:** Cookie-based
- **CLIENT_IP_PROTO:** IP and protocol

**Use cases:**
- Stateful applications
- Session management
- Sticky sessions
- Cache affinity

## Advanced Features

### Content-Based Routing

**Route based on URL path or host.**

```bash
# Create path matcher
gcloud compute url-maps add-path-matcher URL_MAP \
  --default-service=BACKEND_SERVICE \
  --path-matcher-name=api-matcher \
  --path-rules="/api/*=API_BACKEND,/admin/*=ADMIN_BACKEND"
```

**Routing options:**
- Path-based routing
- Host-based routing
- Header-based routing
- Query parameter routing

### SSL/TLS Configuration

**Configure SSL certificates.**

```bash
# Create SSL certificate
gcloud compute ssl-certificates create SSL_CERT \
  --certificate=cert.pem \
  --private-key=key.pem

# Use managed certificate
gcloud compute ssl-certificates create MANAGED_CERT \
  --domains=example.com,www.example.com
```

**Best practices:**
- Use managed certificates when possible
- Enable HTTP to HTTPS redirect
- Use strong cipher suites
- Regular certificate rotation
- Monitor certificate expiration

### CDN Integration

**Enable Cloud CDN for static content.**

```bash
# Enable CDN on backend service
gcloud compute backend-services update BACKEND_SERVICE \
  --enable-cdn \
  --cdn-cache-key-include-query-string=false \
  --cdn-signed-url-cache-max-age=3600
```

**CDN benefits:**
- Reduced origin load
- Lower latency
- Cost savings
- Better user experience

## High Availability

### Multi-Region Deployment

**Deploy across multiple regions.**

```bash
# Create backend in region 1
gcloud compute instance-groups managed create BACKEND_US_CENTRAL \
  --region=us-central1 \
  --template=TEMPLATE

# Create backend in region 2
gcloud compute instance-groups managed create BACKEND_US_EAST \
  --region=us-east1 \
  --template=TEMPLATE

# Add both to backend service
gcloud compute backend-services add-backend BACKEND_SERVICE \
  --instance-group=BACKEND_US_CENTRAL \
  --instance-group-region=us-central1

gcloud compute backend-services add-backend BACKEND_SERVICE \
  --instance-group=BACKEND_US_EAST \
  --instance-group-region=us-east1
```

**Benefits:**
- Regional failover
- Lower latency
- Better availability
- Disaster recovery

### Failover Configuration

**Configure automatic failover.**

```bash
# Set failover policy
gcloud compute backend-services update BACKEND_SERVICE \
  --failover-policy=DROP_CONN_IF_SERVING_CAPACITY_BELOW_THRESHOLD \
  --failover-ratio=0.3
```

**Failover options:**
- Automatic failover
- Manual failover
- Health-based failover
- Capacity-based failover

## Monitoring and Operations

### Monitoring Metrics

**Monitor load balancer performance.**

```bash
# View load balancer metrics
gcloud monitoring time-series list \
  --filter='metric.type="loadbalancing.googleapis.com/https/request_count"'
```

**Key metrics:**
- Request count
- Latency
- Error rate
- Backend utilization
- Health check status

### Logging

**Enable access logging.**

```bash
# Enable logging on load balancer
gcloud compute backend-services update BACKEND_SERVICE \
  --enable-logging \
  --logging-sample-rate=1.0
```

**Log information:**
- Request/response details
- Client IP addresses
- Backend selection
- Response codes
- Latency

## Cost Optimization

### Regional vs Global

**Choose appropriate scope.**

**Regional:**
- Lower cost
- Regional distribution
- Suitable for regional apps

**Global:**
- Higher cost
- Global distribution
- Better for global apps

### Connection Draining

**Graceful instance removal.**

```bash
# Set connection draining timeout
gcloud compute instance-groups managed set-autoscaling INSTANCE_GROUP \
  --connection-draining-timeout=300
```

**Benefits:**
- Graceful shutdown
- No dropped connections
- Better user experience
- Smooth scaling

## Best Practices Summary

1. **Choose right type:** HTTP(S), Network, or Internal
2. **Health checks:** Configure appropriately
3. **Backend config:** Right balancing mode
4. **Session affinity:** When needed
5. **SSL/TLS:** Managed certificates
6. **CDN:** Enable for static content
7. **Multi-region:** For high availability
8. **Monitoring:** Track metrics and logs

**Key takeaways:**
- Use HTTP(S) for web applications
- Configure proper health checks
- Use appropriate balancing mode
- Enable CDN for static content
- Monitor performance and errors
- Plan for high availability
- Optimize costs with right configuration

Remember: Load balancing is critical for availability and performance. Proper
configuration ensures optimal traffic distribution and user experience.
