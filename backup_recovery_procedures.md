# Backup and Recovery Procedures

## Table of Contents

1. [Overview](#overview)
2. [Backup Strategy](#backup-strategy)
3. [Backup Types](#backup-types)
4. [Recovery Procedures](#recovery-procedures)
5. [Testing and Validation](#testing-and-validation)
6. [Monitoring and Alerting](#monitoring-and-alerting)
7. [Documentation and Reporting](#documentation-and-reporting)
8. [Emergency Contacts](#emergency-contacts)

## Overview

This document outlines the comprehensive backup and recovery procedures for the Sebenza Construction Management Platform, ensuring business continuity and data protection in the event of system failures, data corruption, or disasters.

### Objectives

- Minimize data loss through regular backups
- Ensure rapid recovery from system failures
- Maintain business continuity during outages
- Comply with data retention requirements
- Protect against ransomware and data corruption

### Key Metrics

- **Recovery Time Objective (RTO)**: 4 hours maximum
- **Recovery Point Objective (RPO)**: 1 hour maximum
- **Backup Success Rate**: 99.9% minimum
- **Data Retention**: 7 years for compliance

## Backup Strategy

### Backup Schedule

#### Daily Backups
- **Time**: 02:00 UTC (during low usage)
- **Type**: Incremental backup
- **Retention**: 30 days
- **Components**: Database, application files, user uploads

#### Weekly Backups
- **Time**: Sunday 01:00 UTC
- **Type**: Full backup
- **Retention**: 12 weeks
- **Components**: Complete system backup

#### Monthly Backups
- **Time**: First Sunday of month 00:00 UTC
- **Type**: Full backup with compression
- **Retention**: 12 months
- **Components**: Complete system archive

#### Yearly Backups
- **Time**: January 1st 00:00 UTC
- **Type**: Full backup with encryption
- **Retention**: 7 years (compliance requirement)
- **Components**: Complete historical archive

### Backup Locations

#### Primary Backup
- **Location**: Azure Blob Storage (Hot tier)
- **Region**: South Africa North
- **Replication**: LRS (Locally Redundant Storage)
- **Purpose**: Daily operations and quick recovery

#### Secondary Backup
- **Location**: Azure Blob Storage (Cool tier)
- **Region**: West Europe
- **Replication**: GRS (Geo-Redundant Storage)
- **Purpose**: Disaster recovery and compliance

#### Offline Backup
- **Location**: Encrypted external drives
- **Storage**: Secure off-site facility
- **Frequency**: Monthly
- **Purpose**: Air-gapped protection against cyber attacks

## Backup Types

### Database Backups

#### PostgreSQL Database
```sql
-- Full backup command
pg_dump -h $DB_HOST -U $DB_USER -d sebenza_construction > backup_$(date +%Y%m%d_%H%M%S).sql

-- Incremental backup using WAL archiving
archive_command = 'cp %p /backup/wal_archive/%f'
```

#### Backup Script
```bash
#!/bin/bash
# database_backup.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/database"
DB_NAME="sebenza_construction"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME | gzip > $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz

# Upload to Azure Blob Storage
az storage blob upload \
  --file $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz \
  --container-name database-backups \
  --name "daily/db_backup_$TIMESTAMP.sql.gz" \
  --account-name $STORAGE_ACCOUNT

# Clean up local files older than 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Database backup completed: $TIMESTAMP"
```

### File System Backups

#### Application Files
```bash
#!/bin/bash
# application_backup.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/sebenza"
BACKUP_DIR="/backup/application"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create tar archive
tar -czf $BACKUP_DIR/app_backup_$TIMESTAMP.tar.gz -C $APP_DIR .

# Upload to Azure
az storage blob upload \
  --file $BACKUP_DIR/app_backup_$TIMESTAMP.tar.gz \
  --container-name application-backups \
  --name "daily/app_backup_$TIMESTAMP.tar.gz" \
  --account-name $STORAGE_ACCOUNT
```

#### User Uploads and Documents
```bash
#!/bin/bash
# documents_backup.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DOCS_DIR="/var/uploads"
BACKUP_DIR="/backup/documents"

# Sync to Azure Blob Storage
az storage blob sync \
  --source $DOCS_DIR \
  --container documents-backup \
  --account-name $STORAGE_ACCOUNT
```

### Configuration Backups

#### Environment Variables
```bash
#!/bin/bash
# config_backup.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
CONFIG_DIR="/etc/sebenza"
BACKUP_DIR="/backup/config"

# Backup configuration files
tar -czf $BACKUP_DIR/config_backup_$TIMESTAMP.tar.gz $CONFIG_DIR

# Backup environment variables (encrypted)
env | grep SEBENZA_ | gpg --encrypt -r admin@sebenza.com > $BACKUP_DIR/env_backup_$TIMESTAMP.gpg
```

## Recovery Procedures

### Database Recovery

#### Point-in-Time Recovery
```sql
-- Stop the database service
sudo systemctl stop postgresql

-- Restore from base backup
psql -h $DB_HOST -U $DB_USER -d template1 -c "DROP DATABASE IF EXISTS sebenza_construction;"
psql -h $DB_HOST -U $DB_USER -d template1 -c "CREATE DATABASE sebenza_construction;"

-- Restore backup
gunzip -c /backup/database/db_backup_20240115_020000.sql.gz | psql -h $DB_HOST -U $DB_USER -d sebenza_construction

-- Apply WAL files for point-in-time recovery
sudo -u postgres pg_ctl start -D /var/lib/postgresql/data
```

#### Recovery Script
```bash
#!/bin/bash
# database_recovery.sh

if [ $# -ne 2 ]; then
    echo "Usage: $0 <backup_file> <target_time>"
    echo "Example: $0 db_backup_20240115_020000.sql.gz '2024-01-15 14:30:00'"
    exit 1
fi

BACKUP_FILE=$1
TARGET_TIME=$2

echo "Starting database recovery..."
echo "Backup file: $BACKUP_FILE"
echo "Target time: $TARGET_TIME"

# Download backup from Azure
az storage blob download \
  --container-name database-backups \
  --name "daily/$BACKUP_FILE" \
  --file "/tmp/$BACKUP_FILE" \
  --account-name $STORAGE_ACCOUNT

# Perform recovery
sudo systemctl stop postgresql
sudo -u postgres dropdb sebenza_construction
sudo -u postgres createdb sebenza_construction
gunzip -c "/tmp/$BACKUP_FILE" | sudo -u postgres psql sebenza_construction
sudo systemctl start postgresql

echo "Database recovery completed"
```

### Application Recovery

#### Full System Recovery
```bash
#!/bin/bash
# system_recovery.sh

RECOVERY_DATE=$1
if [ -z "$RECOVERY_DATE" ]; then
    echo "Usage: $0 <YYYYMMDD>"
    exit 1
fi

echo "Starting full system recovery for date: $RECOVERY_DATE"

# Stop services
sudo systemctl stop nginx
sudo systemctl stop sebenza-app

# Create recovery directory
RECOVERY_DIR="/tmp/recovery_$RECOVERY_DATE"
mkdir -p $RECOVERY_DIR

# Download backups from Azure
az storage blob download-batch \
  --source database-backups \
  --destination $RECOVERY_DIR/database \
  --pattern "daily/*$RECOVERY_DATE*" \
  --account-name $STORAGE_ACCOUNT

az storage blob download-batch \
  --source application-backups \
  --destination $RECOVERY_DIR/application \
  --pattern "daily/*$RECOVERY_DATE*" \
  --account-name $STORAGE_ACCOUNT

# Restore database
DB_BACKUP=$(ls $RECOVERY_DIR/database/db_backup_$RECOVERY_DATE*.sql.gz | head -1)
gunzip -c "$DB_BACKUP" | sudo -u postgres psql sebenza_construction

# Restore application files
APP_BACKUP=$(ls $RECOVERY_DIR/application/app_backup_$RECOVERY_DATE*.tar.gz | head -1)
sudo tar -xzf "$APP_BACKUP" -C /var/www/sebenza

# Restore permissions
sudo chown -R www-data:www-data /var/www/sebenza
sudo chmod -R 755 /var/www/sebenza

# Start services
sudo systemctl start sebenza-app
sudo systemctl start nginx

echo "System recovery completed"
```

### Partial Recovery Procedures

#### Single Database Table Recovery
```sql
-- Create temporary database
CREATE DATABASE temp_recovery;

-- Restore full backup to temporary database
\! gunzip -c /backup/database/db_backup_20240115_020000.sql.gz | psql temp_recovery

-- Copy specific table
INSERT INTO sebenza_construction.projects 
SELECT * FROM temp_recovery.projects 
WHERE created_at >= '2024-01-15 10:00:00';

-- Drop temporary database
DROP DATABASE temp_recovery;
```

#### File Recovery
```bash
#!/bin/bash
# file_recovery.sh

FILE_PATH=$1
RECOVERY_DATE=$2

if [ $# -ne 2 ]; then
    echo "Usage: $0 <file_path> <recovery_date>"
    exit 1
fi

# Download specific backup
az storage blob download \
  --container-name application-backups \
  --name "daily/app_backup_$RECOVERY_DATE.tar.gz" \
  --file "/tmp/recovery_backup.tar.gz" \
  --account-name $STORAGE_ACCOUNT

# Extract specific file
tar -xzf /tmp/recovery_backup.tar.gz -C /tmp "$FILE_PATH"

# Copy to original location
sudo cp "/tmp/$FILE_PATH" "/$FILE_PATH"
sudo chown www-data:www-data "/$FILE_PATH"

echo "File recovery completed: $FILE_PATH"
```

## Testing and Validation

### Backup Validation

#### Automated Testing
```bash
#!/bin/bash
# backup_validation.sh

BACKUP_FILE=$1

echo "Validating backup: $BACKUP_FILE"

# Test database backup integrity
if gunzip -t "$BACKUP_FILE" 2>/dev/null; then
    echo "✓ Backup file integrity: PASS"
else
    echo "✗ Backup file integrity: FAIL"
    exit 1
fi

# Test database restoration
TEST_DB="test_restore_$(date +%s)"
createdb $TEST_DB

if gunzip -c "$BACKUP_FILE" | psql $TEST_DB >/dev/null 2>&1; then
    echo "✓ Database restoration: PASS"
    dropdb $TEST_DB
else
    echo "✗ Database restoration: FAIL"
    dropdb $TEST_DB 2>/dev/null
    exit 1
fi

echo "Backup validation completed successfully"
```

#### Monthly Recovery Tests
```bash
#!/bin/bash
# monthly_recovery_test.sh

echo "Starting monthly recovery test..."

# Create test environment
TEST_ENV="recovery-test-$(date +%Y%m)"

# Deploy test infrastructure
az group create --name $TEST_ENV --location "South Africa North"

# Restore latest backup to test environment
./system_recovery.sh $(date +%Y%m%d -d "yesterday")

# Run smoke tests
npm run test:smoke

# Clean up test environment
az group delete --name $TEST_ENV --yes --no-wait

echo "Monthly recovery test completed"
```

### Performance Testing

#### Recovery Time Measurement
```bash
#!/bin/bash
# measure_recovery_time.sh

START_TIME=$(date +%s)

# Perform recovery operation
./database_recovery.sh db_backup_20240115_020000.sql.gz

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "Recovery completed in $DURATION seconds"

# Log to monitoring system
curl -X POST "https://monitoring.sebenza.com/metrics" \
  -H "Content-Type: application/json" \
  -d "{\"metric\":\"recovery_time\",\"value\":$DURATION,\"timestamp\":$END_TIME}"
```

## Monitoring and Alerting

### Backup Monitoring

#### Health Check Script
```bash
#!/bin/bash
# backup_health_check.sh

CURRENT_DATE=$(date +%Y%m%d)
YESTERDAY=$(date +%Y%m%d -d "yesterday")

# Check if yesterday's backup exists
BACKUP_EXISTS=$(az storage blob exists \
  --container-name database-backups \
  --name "daily/db_backup_$YESTERDAY*.sql.gz" \
  --account-name $STORAGE_ACCOUNT \
  --query "exists" -o tsv)

if [ "$BACKUP_EXISTS" = "true" ]; then
    echo "✓ Daily backup found for $YESTERDAY"
    exit 0
else
    echo "✗ Daily backup missing for $YESTERDAY"
    # Send alert
    curl -X POST "https://alerts.sebenza.com/webhook" \
      -H "Content-Type: application/json" \
      -d "{\"alert\":\"backup_missing\",\"date\":\"$YESTERDAY\"}"
    exit 1
fi
```

#### Azure Monitor Integration
```json
{
  "alertRules": [
    {
      "name": "BackupFailureAlert",
      "condition": {
        "metricName": "backup_success_rate",
        "operator": "LessThan",
        "threshold": 99.0,
        "timeAggregation": "Average",
        "windowSize": "PT24H"
      },
      "actions": [
        {
          "type": "email",
          "recipients": ["admin@sebenza.com", "dba@sebenza.com"]
        },
        {
          "type": "sms",
          "phoneNumbers": ["+27821234567"]
        }
      ]
    }
  ]
}
```

### Performance Metrics

#### Key Performance Indicators
```typescript
interface BackupMetrics {
  backupDuration: number;      // seconds
  backupSize: number;          // bytes
  compressionRatio: number;    // percentage
  transferSpeed: number;       // MB/s
  successRate: number;         // percentage
  errorCount: number;          // count
}

function collectBackupMetrics(): BackupMetrics {
  return {
    backupDuration: getLastBackupDuration(),
    backupSize: getLastBackupSize(),
    compressionRatio: calculateCompressionRatio(),
    transferSpeed: calculateTransferSpeed(),
    successRate: calculateSuccessRate(),
    errorCount: getErrorCount()
  };
}
```

## Documentation and Reporting

### Backup Reports

#### Daily Backup Report
```bash
#!/bin/bash
# generate_backup_report.sh

DATE=$(date +%Y-%m-%d)
REPORT_FILE="/var/log/backup_report_$DATE.txt"

cat > $REPORT_FILE << EOF
Sebenza Construction - Daily Backup Report
Date: $DATE
Time: $(date)

=== Backup Status ===
Database Backup: $(check_backup_status "database")
Application Backup: $(check_backup_status "application")
Documents Backup: $(check_backup_status "documents")

=== Storage Usage ===
Total Backup Size: $(calculate_backup_size)
Available Storage: $(get_available_storage)
Storage Utilization: $(calculate_storage_utilization)%

=== Performance Metrics ===
Backup Duration: $(get_backup_duration) minutes
Transfer Speed: $(get_transfer_speed) MB/s
Compression Ratio: $(get_compression_ratio)%

=== Issues and Alerts ===
$(get_backup_issues)

EOF

# Email the report
mail -s "Daily Backup Report - $DATE" admin@sebenza.com < $REPORT_FILE
```

#### Monthly Compliance Report
```python
#!/usr/bin/env python3
# monthly_compliance_report.py

import json
from datetime import datetime, timedelta
from azure.storage.blob import BlobServiceClient

def generate_compliance_report():
    """Generate monthly backup compliance report"""
    
    report = {
        "report_date": datetime.now().isoformat(),
        "compliance_period": "monthly",
        "backup_compliance": {
            "daily_backups": check_daily_backup_compliance(),
            "weekly_backups": check_weekly_backup_compliance(),
            "retention_compliance": check_retention_compliance(),
            "recovery_tests": check_recovery_test_compliance()
        },
        "metrics": {
            "rto_compliance": calculate_rto_compliance(),
            "rpo_compliance": calculate_rpo_compliance(),
            "success_rate": calculate_success_rate(),
            "storage_efficiency": calculate_storage_efficiency()
        },
        "recommendations": generate_recommendations()
    }
    
    return report

if __name__ == "__main__":
    report = generate_compliance_report()
    with open(f"compliance_report_{datetime.now().strftime('%Y%m')}.json", "w") as f:
        json.dump(report, f, indent=2)
```

### Audit Trail

#### Backup Activity Log
```sql
-- Backup activity logging table
CREATE TABLE backup_audit_log (
    id SERIAL PRIMARY KEY,
    backup_type VARCHAR(50) NOT NULL,
    backup_date TIMESTAMP NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Log backup activity
INSERT INTO backup_audit_log (
    backup_type, backup_date, file_name, file_size, 
    duration_seconds, status
) VALUES (
    'database', NOW(), 'db_backup_20240115_020000.sql.gz', 
    1048576, 120, 'success'
);
```

## Emergency Contacts

### Internal Contacts

#### Primary Team
- **Database Administrator**: John Smith
  - Email: dba@sebenza.com
  - Mobile: +27 82 123 4567
  - Backup: +27 83 765 4321

- **System Administrator**: Jane Doe
  - Email: sysadmin@sebenza.com
  - Mobile: +27 84 987 6543
  - Backup: +27 85 123 4567

- **IT Manager**: Mike Johnson
  - Email: itmanager@sebenza.com
  - Mobile: +27 86 456 7890
  - Office: +27 11 123 4567

#### Management Team
- **CTO**: Sarah Wilson
  - Email: cto@sebenza.com
  - Mobile: +27 82 987 6543

- **CEO**: David Brown
  - Email: ceo@sebenza.com
  - Mobile: +27 83 456 7890

### External Contacts

#### Azure Support
- **Account Manager**: Azure Team
  - Email: azure-support@microsoft.com
  - Phone: +27 11 344 3400
  - Support Portal: portal.azure.com

#### Backup Service Provider
- **Technical Support**: CloudBackup Solutions
  - Email: support@cloudbackup.co.za
  - Phone: +27 21 555 0123
  - Emergency: +27 82 999 8888

### Escalation Matrix

#### Severity Levels
1. **Critical (P1)**: Complete system failure
   - Response Time: 15 minutes
   - Escalation: Immediate to CTO and CEO

2. **High (P2)**: Backup failure affecting recovery
   - Response Time: 1 hour
   - Escalation: IT Manager within 2 hours

3. **Medium (P3)**: Performance degradation
   - Response Time: 4 hours
   - Escalation: Next business day

4. **Low (P4)**: Minor issues or improvements
   - Response Time: 24 hours
   - Escalation: Weekly review

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-15  
**Next Review**: 2024-04-15  
**Owner**: IT Operations Team  
**Approved By**: Chief Technology Officer
