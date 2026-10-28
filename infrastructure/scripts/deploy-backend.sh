#!/usr/bin/env bash
# ==============================================================
# PantryPal Backend Production Deployment Script (AWS Mumbai)
# ==============================================================

set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-south-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-}"
ECR_REPO_NAME="pantrypal-backend"
ECS_CLUSTER="pantrypal-production-cluster"
ECS_SERVICE="pantrypal-backend-service"
IMAGE_TAG="$(git rev-parse --short HEAD 2>/dev/null || echo 'latest')"

if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo "Fetching AWS Account ID..."
  AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
fi

ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}"

echo "========================================================"
echo "🚀 Deploying PantryPal Backend to AWS Mumbai (${AWS_REGION})"
echo "   Account ID: ${AWS_ACCOUNT_ID}"
echo "   ECR URI:    ${ECR_URI}:${IMAGE_TAG}"
echo "========================================================"

# 1. Authenticate Docker with Amazon ECR
echo "🔑 Logging in to Amazon ECR..."
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# 2. Ensure ECR repository exists
aws ecr describe-repositories --repository-names "${ECR_REPO_NAME}" --region "${AWS_REGION}" >/dev/null 2>&1 || {
  echo "Creating ECR repository ${ECR_REPO_NAME}..."
  aws ecr create-repository --repository-name "${ECR_REPO_NAME}" --region "${AWS_REGION}" --image-scanning-configuration scanOnPush=true
}

# 3. Build Docker container image
echo "📦 Building production Docker image..."
docker build -t "${ECR_REPO_NAME}:${IMAGE_TAG}" -f backend/Dockerfile backend/
docker tag "${ECR_REPO_NAME}:${IMAGE_TAG}" "${ECR_URI}:${IMAGE_TAG}"
docker tag "${ECR_REPO_NAME}:${IMAGE_TAG}" "${ECR_URI}:latest"

# 4. Push image to Amazon ECR
echo "📤 Pushing image to Amazon ECR..."
docker push "${ECR_URI}:${IMAGE_TAG}"
docker push "${ECR_URI}:latest"

# 5. Update ECS Service to trigger rolling deployment
echo "🔄 Updating ECS Fargate service..."
aws ecs update-service \
  --cluster "${ECS_CLUSTER}" \
  --service "${ECS_SERVICE}" \
  --force-new-deployment \
  --region "${AWS_REGION}"

echo "✅ Backend deployment triggered successfully!"
echo "   Monitor status with: aws ecs describe-services --cluster ${ECS_CLUSTER} --services ${ECS_SERVICE} --region ${AWS_REGION}"
