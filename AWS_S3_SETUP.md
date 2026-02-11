# AWS S3 Setup Guide

This guide explains how to configure AWS S3 for document storage in your Credential Store application.

## Why Use S3?

- **Scalability**: Unlimited storage capacity
- **Durability**: 99.999999999% (11 9's) durability
- **Availability**: 99.99% availability
- **Cost-effective**: Pay only for what you use
- **Security**: Built-in encryption and access controls
- **No server maintenance**: Fully managed service

## Storage Options

Your application supports two storage modes:

1. **Local Storage** (Default): Files stored on server filesystem
2. **AWS S3**: Files stored in Amazon S3 bucket

The application automatically detects which mode to use based on environment variables.

## AWS S3 Setup Steps

### Step 1: Create an S3 Bucket

1. **Login to AWS Console**: https://console.aws.amazon.com/
2. **Navigate to S3**: Services → S3
3. **Create Bucket**:
   - Click "Create bucket"
   - Bucket name: `credential-store-documents` (must be globally unique)
   - Region: Choose closest to your users (e.g., `us-east-1`)
   - Block Public Access: Keep all boxes CHECKED (files should not be public)
   - Versioning: Enable (optional, for backup)
   - Encryption: Enable (recommended)
   - Click "Create bucket"

### Step 2: Create IAM User

1. **Navigate to IAM**: Services → IAM
2. **Create User**:
   - Click "Users" → "Add users"
   - User name: `credential-store-app`
   - Access type: Select "Programmatic access"
   - Click "Next: Permissions"

3. **Set Permissions**:
   - Click "Attach existing policies directly"
   - Search for "S3"
   - Select "AmazonS3FullAccess" (or create custom policy below)
   - Click "Next: Tags" → "Next: Review" → "Create user"

4. **Save Credentials**:
   - **IMPORTANT**: Copy the Access Key ID and Secret Access Key
   - You won't be able to see the secret key again!
   - Store them securely

### Step 3: Create Custom IAM Policy (Recommended)

For better security, create a custom policy with minimal permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::credential-store-documents",
                "arn:aws:s3:::credential-store-documents/*"
            ]
        }
    ]
}
```

To create:
1. IAM → Policies → Create policy
2. JSON tab → Paste above policy
3. Replace `credential-store-documents` with your bucket name
4. Name: `CredentialStoreS3Policy`
5. Attach this policy to your IAM user

### Step 4: Configure Application

Update your `backend/.env` file:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=credential-store-documents
```

**Replace with your actual values:**
- `AWS_REGION`: Your bucket's region
- `AWS_ACCESS_KEY_ID`: From Step 2
- `AWS_SECRET_ACCESS_KEY`: From Step 2
- `AWS_S3_BUCKET`: Your bucket name

### Step 5: Test the Configuration

1. **Restart the application**:
```bash
docker-compose down
docker-compose up -d
```

2. **Check logs**:
```bash
docker-compose logs backend | grep -i s3
# Should see: "Using AWS S3 for file storage"
```

3. **Upload a test document**:
   - Login as admin
   - Go to Documents tab
   - Upload a file
   - Verify it appears in your S3 bucket

## Verification

### Check S3 Bucket

1. Go to AWS Console → S3
2. Open your bucket
3. You should see uploaded files with names like: `1707654321_123456789.pdf`

### Check Application Logs

```bash
# Should see S3 confirmation
docker-compose logs backend | head -20
# Output: "Using AWS S3 for file storage"
```

## Switching Between Storage Modes

### Use S3 (Production)

Add to `backend/.env`:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your-bucket
```

### Use Local Storage (Development)

Comment out or remove AWS variables from `backend/.env`:
```env
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=your_key
# AWS_SECRET_ACCESS_KEY=your_secret
# AWS_S3_BUCKET=your-bucket
```

## Cost Estimation

AWS S3 pricing (as of 2024):

| Item | Cost |
|------|------|
| Storage | $0.023 per GB/month |
| PUT requests | $0.005 per 1,000 requests |
| GET requests | $0.0004 per 1,000 requests |
| Data transfer out | $0.09 per GB (first 10 TB) |

**Example**: 
- 1,000 documents (100 MB total)
- 10,000 views/month
- Cost: ~$0.50/month

## Security Best Practices

### 1. Use IAM Roles (EC2)

If running on EC2, use IAM roles instead of access keys:

```go
// In s3_service.go, the SDK automatically uses IAM role if available
sess, err := session.NewSession(&aws.Config{
    Region: aws.String(region),
    // No credentials needed - uses IAM role
})
```

### 2. Enable Bucket Encryption

```bash
aws s3api put-bucket-encryption \
    --bucket credential-store-documents \
    --server-side-encryption-configuration '{
        "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            }
        }]
    }'
```

### 3. Enable Versioning

```bash
aws s3api put-bucket-versioning \
    --bucket credential-store-documents \
    --versioning-configuration Status=Enabled
```

### 4. Set Lifecycle Policy

Automatically delete old versions after 30 days:

```json
{
    "Rules": [{
        "Id": "DeleteOldVersions",
        "Status": "Enabled",
        "NoncurrentVersionExpiration": {
            "NoncurrentDays": 30
        }
    }]
}
```

### 5. Enable Access Logging

```bash
aws s3api put-bucket-logging \
    --bucket credential-store-documents \
    --bucket-logging-status '{
        "LoggingEnabled": {
            "TargetBucket": "credential-store-logs",
            "TargetPrefix": "access-logs/"
        }
    }'
```

## Troubleshooting

### Error: "AWS_S3_BUCKET environment variable is required"

**Solution**: Add `AWS_S3_BUCKET` to your `.env` file

### Error: "Failed to upload to S3: AccessDenied"

**Solutions**:
1. Check IAM user has S3 permissions
2. Verify bucket name is correct
3. Check AWS credentials are valid

### Error: "Failed to create AWS session"

**Solutions**:
1. Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set
2. Check credentials are valid
3. Ensure no extra spaces in `.env` file

### Files Not Appearing in S3

**Check**:
1. Application logs: `docker-compose logs backend`
2. AWS credentials are correct
3. Bucket name matches exactly
4. Region is correct

### Presigned URLs Not Working

**Solutions**:
1. Check bucket CORS configuration
2. Verify presigned URL hasn't expired (15 minutes)
3. Check bucket permissions

## CORS Configuration (If Needed)

If accessing S3 directly from browser:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://your-domain.com"],
        "ExposeHeaders": []
    }
]
```

Apply via AWS Console:
1. S3 → Your bucket → Permissions → CORS
2. Paste above JSON
3. Save

## Migration from Local to S3

If you have existing files in local storage:

```bash
# Upload all files to S3
aws s3 sync ./uploads s3://credential-store-documents/

# Verify
aws s3 ls s3://credential-store-documents/
```

## Backup Strategy

### Automatic Backups

Enable S3 versioning (already covered above)

### Manual Backup

```bash
# Backup entire bucket
aws s3 sync s3://credential-store-documents/ ./backup/

# Restore from backup
aws s3 sync ./backup/ s3://credential-store-documents/
```

### Cross-Region Replication

For disaster recovery, replicate to another region:

1. Create bucket in different region
2. Enable versioning on both buckets
3. Set up replication rule in source bucket

## Monitoring

### CloudWatch Metrics

Monitor S3 usage:
1. AWS Console → CloudWatch
2. Metrics → S3
3. View: Storage, Requests, Data Transfer

### Set Up Alerts

```bash
# Alert when storage exceeds 10 GB
aws cloudwatch put-metric-alarm \
    --alarm-name s3-storage-alert \
    --metric-name BucketSizeBytes \
    --namespace AWS/S3 \
    --statistic Average \
    --period 86400 \
    --threshold 10737418240 \
    --comparison-operator GreaterThanThreshold
```

## Summary

**To enable S3 storage:**
1. Create S3 bucket
2. Create IAM user with S3 permissions
3. Add AWS credentials to `.env`
4. Restart application
5. Upload test file to verify

**Benefits:**
- Unlimited scalable storage
- High durability and availability
- No server disk space concerns
- Built-in security features
- Cost-effective for production

**Fallback:**
- If S3 is not configured, application automatically uses local storage
- No code changes needed to switch between modes

---

Need help? Check the main [DEPLOYMENT.md](DEPLOYMENT.md) or open an issue on GitHub.
