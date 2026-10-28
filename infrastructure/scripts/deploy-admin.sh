#!/usr/bin/env bash
# ==============================================================
# PantryPal Admin Panel Production Deployment Script
# Amazon S3 + CloudFront Invalidation (AWS Mumbai)
# ==============================================================

set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-south-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-}"
S3_BUCKET="${S3_BUCKET:-}"
CLOUDFRONT_DIST_ID="${CLOUDFRONT_DIST_ID:-}"

if [ -z "$AWS_ACCOUNT_ID" ]; then
  AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
fi

if [ -z "$S3_BUCKET" ]; then
  S3_BUCKET="pantrypal-admin-${AWS_ACCOUNT_ID}-ap-south-1"
fi

echo "========================================================"
echo "🚀 Deploying PantryPal Admin Dashboard to S3 & CloudFront"
echo "   S3 Target:       s3://${S3_BUCKET}"
echo "   CloudFront ID:   ${CLOUDFRONT_DIST_ID:-auto-detect}"
echo "========================================================"

# 1. Install dependencies & build production static files
echo "📦 Building Admin Dashboard SPA..."
cd admin-panel
if [ -f ".env.production" ]; then
  echo "Using .env.production"
else
  echo "Warning: .env.production not found, using default VITE_API_BASE_URL"
fi
npm run build
cd ..

# 2. Sync build output to private S3 bucket
echo "📤 Uploading dist/ files to Amazon S3..."
aws s3 sync admin-panel/dist/ "s3://${S3_BUCKET}/" --delete --region "${AWS_REGION}"

# 3. Invalidate CloudFront cache
if [ -z "$CLOUDFRONT_DIST_ID" ]; then
  echo "Detecting CloudFront Distribution ID..."
  CLOUDFRONT_DIST_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Origins.Items[?Id=='S3Origin']].Id" --output text | head -n1 || echo "")
fi

if [ -n "$CLOUDFRONT_DIST_ID" ]; then
  echo "🧹 Creating CloudFront cache invalidation for distribution ${CLOUDFRONT_DIST_ID}..."
  aws cloudfront create-invalidation --distribution-id "${CLOUDFRONT_DIST_ID}" --paths "/*"
  echo "✅ CloudFront cache invalidated!"
else
  echo "ℹ️ CloudFront Distribution ID not specified or found. Please invalidate manually if needed."
fi

echo "🎉 Admin Panel deployed successfully!"
