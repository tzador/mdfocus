# BigQuery: Best Practices and Query Optimization

## Introduction

BigQuery is Google Cloud's serverless data warehouse. Proper data modeling,
query optimization, and cost management are essential for performance and
efficiency.

This guide covers BigQuery best practices, query optimization techniques, and
data modeling patterns.

## Data Modeling

### Table Design

**Design tables for optimal query performance.**

```sql
-- Partitioned table
CREATE TABLE dataset.sales (
  sale_date DATE,
  product_id INT64,
  quantity INT64,
  revenue NUMERIC
)
PARTITION BY sale_date
CLUSTER BY product_id;

-- Clustered table
CREATE TABLE dataset.user_events (
  user_id INT64,
  event_timestamp TIMESTAMP,
  event_type STRING,
  event_data JSON
)
PARTITION BY DATE(event_timestamp)
CLUSTER BY user_id, event_type;
```

**Best practices:**
- Partition by date/timestamp columns
- Cluster by frequently filtered columns
- Use appropriate data types
- Avoid nested data when possible
- Denormalize for read performance

### Partitioning Strategies

**Partition tables to reduce scanned data.**

```sql
-- Daily partition
CREATE TABLE dataset.events (
  event_date DATE,
  event_id STRING,
  user_id INT64
)
PARTITION BY event_date;

-- Integer range partition
CREATE TABLE dataset.sales (
  sale_id INT64,
  sale_date DATE,
  amount NUMERIC
)
PARTITION BY RANGE_BUCKET(sale_id, GENERATE_ARRAY(0, 1000000, 10000));

-- Time-unit partition
CREATE TABLE dataset.logs (
  log_timestamp TIMESTAMP,
  log_level STRING,
  message STRING
)
PARTITION BY DATE(log_timestamp);
```

**Partition types:**
- **Date:** Daily partitions (most common)
- **Integer range:** For ID-based partitioning
- **Time-unit:** Hour, day, month, year
- **Ingestion time:** Automatic partition on load

**Benefits:**
- Reduced data scanned
- Lower query costs
- Better performance
- Easier data management

### Clustering

**Cluster tables for better performance.**

```sql
-- Clustered table
CREATE TABLE dataset.orders (
  order_date DATE,
  customer_id INT64,
  product_id INT64,
  order_amount NUMERIC
)
PARTITION BY order_date
CLUSTER BY customer_id, product_id;
```

**When to use:**
- Frequently filter by specific columns
- Large tables (> 1GB)
- Queries benefit from co-location
- Up to 4 clustering columns

**Benefits:**
- Faster queries on clustered columns
- Reduced data scanned
- Better compression
- Automatic maintenance

## Query Optimization

### SELECT Best Practices

**Query only needed columns.**

```sql
-- ❌ Bad: Select all columns
SELECT * FROM dataset.large_table
WHERE date = '2024-01-01';

-- ✅ Good: Select specific columns
SELECT user_id, event_type, event_timestamp
FROM dataset.large_table
WHERE date = '2024-01-01';
```

**Best practices:**
- Avoid SELECT *
- Use specific column names
- Limit result sets with LIMIT
- Use approximate functions when appropriate

### WHERE Clause Optimization

**Filter early and use partition/cluster columns.**

```sql
-- ✅ Good: Filter on partition column first
SELECT *
FROM dataset.sales
WHERE sale_date = '2024-01-01'  -- Partition column
  AND product_id = 123;          -- Clustered column

-- ❌ Bad: Filter on non-partitioned column
SELECT *
FROM dataset.sales
WHERE product_name = 'Widget'    -- Not partitioned/clustered
  AND sale_date = '2024-01-01';
```

**Optimization tips:**
- Filter on partition columns first
- Use clustered columns in WHERE
- Use appropriate operators (=, IN, BETWEEN)
- Avoid functions on partition columns
- Use DATE() for timestamp partitions

### JOIN Optimization

**Optimize joins for performance.**

```sql
-- ✅ Good: Join on clustered columns
SELECT t1.*, t2.name
FROM dataset.table1 t1
JOIN dataset.table2 t2
  ON t1.user_id = t2.user_id  -- Clustered column
WHERE t1.date = '2024-01-01';

-- Use INNER JOIN when possible (faster than LEFT)
-- Place larger table on left side
-- Filter before joining when possible
```

**Best practices:**
- Join on clustered columns
- Use INNER JOIN when possible
- Filter before joining
- Avoid CROSS JOIN
- Use UNION ALL instead of UNION when possible

### Aggregation Optimization

**Optimize aggregations.**

```sql
-- ✅ Good: Use APPROX_COUNT_DISTINCT for large datasets
SELECT
  APPROX_COUNT_DISTINCT(user_id) as unique_users,
  COUNT(*) as total_events
FROM dataset.events
WHERE event_date = '2024-01-01';

-- Use approximate functions when exact count not needed
-- Filter before aggregating
-- Use GROUP BY on clustered columns
```

### Window Functions

**Use window functions efficiently.**

```sql
-- Efficient window function
SELECT
  user_id,
  event_timestamp,
  ROW_NUMBER() OVER (
    PARTITION BY user_id
    ORDER BY event_timestamp
  ) as event_sequence
FROM dataset.events
WHERE event_date = '2024-01-01';
```

## Cost Optimization

### Query Cost Management

**Minimize bytes processed.**

```sql
-- Use LIMIT in development
SELECT * FROM dataset.large_table
LIMIT 100;

-- Use preview in console
-- Estimate query cost before running
-- Use dry run to check bytes processed
```

```bash
# Dry run to estimate cost
bq query --dry_run --use_legacy_sql=false \
  'SELECT * FROM dataset.table'
```

### Slot Management

**Manage query slots efficiently.**

```bash
# Create slot reservation
bq mk --reservation \
  --slots=100 \
  --location=US \
  RESERVATION_NAME

# Assign project to reservation
bq mk --assignment \
  --reservation_id=RESERVATION_NAME \
  --job_type=QUERY \
  --assignee_type=PROJECT \
  --assignee_id=PROJECT_ID
```

**Pricing models:**
- **On-demand:** Pay per query (default)
- **Flat-rate:** Fixed monthly cost
- **Flex slots:** Purchase slots as needed

### Caching

**Leverage query result caching.**

```sql
-- Results cached for 24 hours
-- Same query returns cached results
-- Use parameters for cacheable queries
```

**Cache conditions:**
- Exact same query text
- Same table data (no changes)
- User has access to cached results
- Results < 10MB

### Materialized Views

**Pre-compute aggregations.**

```sql
-- Create materialized view
CREATE MATERIALIZED VIEW dataset.daily_stats AS
SELECT
  DATE(event_timestamp) as event_date,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users
FROM dataset.events
GROUP BY event_date;

-- Query materialized view (faster)
SELECT * FROM dataset.daily_stats
WHERE event_date = '2024-01-01';
```

**Benefits:**
- Pre-computed results
- Automatic refresh
- Faster queries
- Cost savings

## Data Loading

### Batch Loading

**Load data efficiently.**

```bash
# Load from Cloud Storage
bq load \
  --source_format=NEWLINE_DELIMITED_JSON \
  --autodetect \
  dataset.table \
  gs://bucket/data/*.json

# Load with schema
bq load \
  --schema=schema.json \
  dataset.table \
  gs://bucket/data.csv
```

**Best practices:**
- Use appropriate file format (Parquet recommended)
- Compress files (GZIP, SNAPPY)
- Load in parallel
- Use schema auto-detection carefully
- Validate data before loading

### Streaming Inserts

**Stream data in real-time.**

```javascript
// Node.js streaming insert
const { BigQuery } = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function streamInsert(rows) {
  await bigquery
    .dataset('dataset')
    .table('table')
    .insert(rows);
}
```

**Best practices:**
- Batch rows when possible
- Handle errors and retries
- Monitor streaming quota
- Use appropriate batch size
- Consider using Pub/Sub + Dataflow

### Data Formats

**Choose optimal data formats.**

**Format comparison:**
- **Parquet:** Best compression, columnar
- **Avro:** Good compression, schema evolution
- **JSON:** Human-readable, larger size
- **CSV:** Simple, no compression

**Recommendation:**
- Use Parquet for analytics
- Use Avro for data pipelines
- Use JSON for small datasets
- Compress all formats

## Security and Access

### IAM Permissions

**Grant appropriate permissions.**

```bash
# Grant dataset access
bq mk --dataset --location=US dataset

# Grant table read access
bq query --use_legacy_sql=false \
  'GRANT `roles/bigquery.dataViewer` ON TABLE dataset.table TO "user@example.com"'

# Grant query access
bq query --use_legacy_sql=false \
  'GRANT `roles/bigquery.jobUser` ON PROJECT PROJECT_ID TO "user@example.com"'
```

### Row-Level Security

**Implement row-level access control.**

```sql
-- Create row access policy
CREATE ROW ACCESS POLICY user_data_policy
ON dataset.user_table
GRANT TO ('user@example.com')
FILTER USING (user_id = SESSION_USER());
```

### Data Encryption

**Encrypt sensitive data.**

```sql
-- Encrypt columns
CREATE TABLE dataset.encrypted_table (
  id INT64,
  encrypted_data BYTES  -- Encrypt before storing
);

-- Use AEAD functions for encryption
SELECT
  id,
  AEAD.ENCRYPT(keyset, plaintext, aad) as encrypted
FROM dataset.table;
```

## Monitoring and Optimization

### Query Performance

**Monitor and optimize queries.**

```sql
-- Check query execution plan
EXPLAIN SELECT * FROM dataset.table
WHERE date = '2024-01-01';

-- Use query validator
-- Review query statistics
-- Monitor slot usage
```

```bash
# View query history
bq ls -j --max_results=10

# Get query details
bq show -j JOB_ID
```

### Table Statistics

**Monitor table statistics.**

```sql
-- Get table information
SELECT
  table_id,
  row_count,
  size_bytes,
  creation_time
FROM `dataset.INFORMATION_SCHEMA.TABLES`
WHERE table_name = 'table_name';
```

### Cost Monitoring

**Track BigQuery costs.**

```sql
-- Query billing export
SELECT
  service.description,
  SUM(cost) as total_cost,
  SUM(usage.amount) as total_slots
FROM `project.dataset.gcp_billing_export`
WHERE _PARTITIONTIME >= TIMESTAMP('2024-01-01')
  AND service.description = 'BigQuery'
GROUP BY service.description;
```

## Advanced Patterns

### Incremental Loading

**Load data incrementally.**

```sql
-- Merge new data
MERGE dataset.target_table T
USING dataset.source_table S
ON T.id = S.id
WHEN MATCHED THEN
  UPDATE SET
    T.updated_at = S.updated_at,
    T.data = S.data
WHEN NOT MATCHED THEN
  INSERT (id, updated_at, data)
  VALUES (S.id, S.updated_at, S.data);
```

### Data Quality Checks

**Implement data quality validation.**

```sql
-- Data quality query
SELECT
  COUNT(*) as total_rows,
  COUNT(DISTINCT user_id) as unique_users,
  COUNTIF(amount < 0) as negative_amounts,
  COUNTIF(email IS NULL) as missing_emails
FROM dataset.transactions
WHERE date = '2024-01-01';
```

### Time Travel

**Query historical data.**

```sql
-- Query table at specific time
SELECT *
FROM dataset.table
FOR SYSTEM_TIME AS OF TIMESTAMP('2024-01-01 12:00:00');
```

## Best Practices Summary

1. **Partition tables:** By date/timestamp
2. **Cluster tables:** By frequently filtered columns
3. **Optimize queries:** Filter early, select specific columns
4. **Manage costs:** Use dry run, approximate functions
5. **Load efficiently:** Use Parquet, compress files
6. **Monitor performance:** Track query stats, slot usage
7. **Secure data:** IAM, row-level security, encryption
8. **Use materialized views:** For common aggregations

**Key takeaways:**
- Partition and cluster appropriately
- Query only needed columns
- Filter on partition/cluster columns
- Use approximate functions when possible
- Monitor and optimize continuously
- Secure with proper IAM
- Load data efficiently

Remember: BigQuery optimization is about reducing bytes processed and
improving query performance. Regular monitoring and optimization ensure
cost-effective and performant data warehouse operations.
