# 🚀 PantryPal AWS Mumbai (`ap-south-1`) Deployment Runbook

Complete, step-by-step operations guide to deploy the PantryPal Backend (ECS Fargate) and Admin Dashboard (S3 + CloudFront) in AWS Mumbai.

---

## 📑 Table of Contents
1. [Prerequisites & IAM Permissions](#1-prerequisites--iam-permissions)
2. [Step 1: Network & VPC Provisioning](#step-1-network--vpc-provisioning)
3. [Step 2: Database Setup (Amazon DocumentDB or Atlas)](#step-2-database-setup)
4. [Step 3: AWS Secrets Manager Configuration](#step-3-aws-secrets-manager-configuration)
5. [Step 4: Backend Containerization & ECR Deployment](#step-4-backend-containerization--ecr-deployment)
6. [Step 5: ECS Fargate Cluster & Service Setup](#step-5-ecs-fargate-cluster--service-setup)
7. [Step 6: Admin Dashboard S3 + CloudFront Deployment](#step-6-admin-dashboard-s3--cloudfront-deployment)
8. [Step 7: Domain, SSL & Route 53 Configuration](#step-7-domain-ssl--route-53-configuration)
9. [Step 8: Verification & Health Checks](#step-8-verification--health-checks)
10. [Rollback, Scaling & Disaster Recovery](#rollback-scaling--disaster-recovery)

---

## 1. Prerequisites & IAM Permissions

Ensure you have the AWS CLI configured with region `ap-south-1`:
```bash
aws configure set default.region ap-south-1
aws sts get-caller-identity
```

Ensure your IAM user or role has permissions for:
* Amazon EC2 / VPC
* Amazon Elastic Container Registry (ECR)
* Amazon Elastic Container Service (ECS)
* Elastic Load Balancing (ELBv2)
* Amazon S3 & CloudFront
* AWS Secrets Manager & CloudWatch Logs
* AWS Certificate Manager (ACM) & Route 53 (optional for custom domains)

---

## Step 1: Network & VPC Provisioning

Deploy the VPC, 2 public subnets, 2 private subnets, security groups, and Application Load Balancer using CloudFormation:

```bash
aws cloudformation deploy \
  --template-file infrastructure/cloudformation/vpc-and-alb.yaml \
  --stack-name pantrypal-production-network \
  --parameter-overrides EnvironmentName=production \
  --capabilities CAPABILITY_IAM \
  --region ap-south-1
```

Once deployment finishes, retrieve the outputs:
```bash
aws cloudformation describe-stacks \
  --stack-name pantrypal-production-network \
  --query "Stacks[0].Outputs" \
  --output table \
  --region ap-south-1
```

---

## Step 2: Database Setup

### Option A: Amazon DocumentDB (Native AWS VPC - Recommended for High Compliance)
1. Create a DocumentDB Subnet Group using the Private Subnets:
   ```bash
   aws docdb create-db-subnet-group \
     --db-subnet-group-name pantrypal-docdb-subnets \
     --db-subnet-group-description "Private subnets for DocumentDB" \
     --subnet-ids "<PrivateSubnet1_ID>" "<PrivateSubnet2_ID>" \
     --region ap-south-1
   ```
2. Create DocumentDB Cluster:
   ```bash
   aws docdb create-db-cluster \
     --db-cluster-identifier pantrypal-docdb-cluster \
     --engine docdb \
     --master-username pantryadmin \
     --master-user-password "YourStrongPasswordHere123!" \
     --vpc-security-group-ids "<DatabaseSecurityGroupId>" \
     --db-subnet-group-name pantrypal-docdb-subnets \
     --storage-encrypted \
     --region ap-south-1
   ```
3. Create Primary Instance:
   ```bash
   aws docdb create-db-instance \
     --db-instance-identifier pantrypal-docdb-instance-1 \
     --db-cluster-identifier pantrypal-docdb-cluster \
     --db-instance-class db.t3.medium \
     --region ap-south-1
   ```

### Option B: MongoDB Atlas in AWS Mumbai (Cost-Optimized MVP)
1. In MongoDB Atlas, create a cluster hosted on **AWS Mumbai (`ap-south-1`)**.
2. Whitelist your VPC CIDR (`10.0.0.0/16`) or set up VPC Peering.
3. Obtain the connection string:
   `mongodb+srv://pantryadmin:<password>@cluster0.abcde.mongodb.net/pantrypal?retryWrites=true&w=majority`

---

## Step 3: AWS Secrets Manager Configuration

Create the production secret to securely store environment variables:

```bash
aws secretsmanager create-secret \
  --name pantrypal/production \
  --description "PantryPal Backend Production Environment Variables" \
  --secret-string '{
    "NODE_ENV": "production",
    "PORT": "5000",
    "MONGODB_URI": "YOUR_DOCUMENTDB_OR_ATLAS_URI",
    "JWT_SECRET": "GENERATE_A_64_CHAR_RANDOM_SECRET_KEY_HERE",
    "JWT_EXPIRE": "30d",
    "RAZORPAY_KEY_ID": "rzp_test_TtFSHX84gdLeIO",
    "RAZORPAY_KEY_SECRET": "xDYkr3q4lYzG2RlAR5py5IWr",
    "ADMIN_REGISTER_SECRET": "YOUR_STRONG_ADMIN_REGISTRATION_PASSCODE",
    "ALLOWED_ORIGINS": "https://admin.yourdomain.com,https://your-cloudfront-id.cloudfront.net"
  }' \
  --region ap-south-1
```

---

## Step 4: Backend Containerization & ECR Deployment

Run the automated backend deployment script:
```bash
./infrastructure/scripts/deploy-backend.sh
```

Or manually:
```bash
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com

aws ecr create-repository --repository-name pantrypal-backend --region ap-south-1 || true

docker build -t pantrypal-backend:latest -f backend/Dockerfile backend/
docker tag pantrypal-backend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com/pantrypal-backend:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com/pantrypal-backend:latest
```

---

## Step 5: ECS Fargate Cluster & Service Setup

1. **Create ECS Cluster**:
   ```bash
   aws ecs create-cluster --cluster-name pantrypal-production-cluster --region ap-south-1
   ```

2. **Register Task Definition**:
   Replace `<AWS_ACCOUNT_ID>` in `infrastructure/ecs/task-definition.json` and register:
   ```bash
   aws ecs register-task-definition \
     --cli-input-json file://infrastructure/ecs/task-definition.json \
     --region ap-south-1
   ```

3. **Create Service**:
   ```bash
   aws ecs create-service \
     --cluster pantrypal-production-cluster \
     --service-name pantrypal-backend-service \
     --task-definition pantrypal-backend-production \
     --desired-count 2 \
     --launch-type FARGATE \
     --network-configuration "awsvpcConfiguration={subnets=[<PrivateSubnet1_ID>,<PrivateSubnet2_ID>],securityGroups=[<ECSSecurityGroupId>],assignPublicIp=DISABLED}" \
     --load-balancers "targetGroupArn=<TargetGroupArn>,containerName=pantrypal-api,containerPort=5000" \
     --region ap-south-1
   ```

---

## Step 6: Admin Dashboard S3 + CloudFront Deployment

1. **Deploy S3 Bucket and CloudFront Distribution**:
   ```bash
   aws cloudformation deploy \
     --template-file infrastructure/cloudformation/admin-s3-cloudfront.yaml \
     --stack-name pantrypal-admin-frontend \
     --parameter-overrides EnvironmentName=production \
     --region ap-south-1
   ```

2. **Build and Upload Admin Panel**:
   ```bash
   export S3_BUCKET=$(aws cloudformation describe-stacks --stack-name pantrypal-admin-frontend --query "Stacks[0].Outputs[?OutputKey=='AdminBucketName'].OutputValue" --output text --region ap-south-1)
   export CLOUDFRONT_DIST_ID=$(aws cloudformation describe-stacks --stack-name pantrypal-admin-frontend --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" --output text --region ap-south-1)

   ./infrastructure/scripts/deploy-admin.sh
   ```

---

## Step 7: Domain, SSL & Route 53 Configuration

1. **Request SSL Certificate in ACM**:
   * For the API: `api.pantrypal.example.com` in `ap-south-1`.
   * For CloudFront: `admin.pantrypal.example.com` in `us-east-1` (CloudFront requires ACM certs in `us-east-1`).
2. **Update ALB HTTPS Listener**:
   Add Port 443 listener with the ACM certificate forwarding to `BackendTargetGroup`.
3. **Route 53 Records**:
   * Create `A` Alias record: `api.pantrypal.example.com` $\rightarrow$ ALB DNS Name.
   * Create `A` Alias record: `admin.pantrypal.example.com` $\rightarrow$ CloudFront Domain Name.

---

## Step 8: Verification & Health Checks

1. **Verify Backend Health**:
   ```bash
   curl -I https://api.yourdomain.com/api/health
   # Expected: HTTP/2 200 OK
   # { "status": "ok", "service": "PantryPal Backend API", "environment": "production" }
   ```

2. **Verify Admin Dashboard**:
   Open `https://admin.yourdomain.com/` in your browser.
   Test navigating to `/orders`, `/inventory`, and refreshing the page (verifies SPA error handling).

3. **Verify CloudWatch Logs**:
   ```bash
   aws logs tail /ecs/pantrypal-backend-production --region ap-south-1 --follow
   ```

---

## Rollback, Scaling & Disaster Recovery

* **Immediate Rollback to Previous Container Revision**:
  ```bash
  aws ecs update-service \
    --cluster pantrypal-production-cluster \
    --service pantrypal-backend-service \
    --task-definition pantrypal-backend-production:<PREVIOUS_REVISION_NUMBER> \
    --region ap-south-1
  ```
* **Auto-Scaling Policy**:
  Scale tasks when CPU > 70% or memory > 75%:
  ```bash
  aws application-autoscaling register-scalable-target \
    --service-namespace ecs \
    --resource-id service/pantrypal-production-cluster/pantrypal-backend-service \
    --scalable-dimension ecs:service:DesiredCount \
    --min-capacity 2 \
    --max-capacity 6 \
    --region ap-south-1
  ```
