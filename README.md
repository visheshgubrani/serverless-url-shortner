# Serverless URL Shortener

This project is a fully serverless URL shortener built on AWS using Terraform for backend infrastructure and AWS UI for frontend deployment. It consists of:

- AWS Lambda functions for URL shortening, redirection, and tracking
- DynamoDB for persistent storage
- API Gateway for exposing the backend
- S3 + CloudFront for hosting the frontend

## Setup Instructions

### 1. Clone the Repository

```sh
git clone https://github.com/your-repo/serverless-url-shortener.git
cd serverless-url-shortener
```

### 2. Create S3 Bucket and DynamoDB Lock Table for Terraform State

```sh
aws s3api create-bucket \
  --bucket your-tf-bucket-name \
  --create-bucket-configuration LocationConstraint=ap-south-1

aws dynamodb create-table --table-name tf-lock-table-url --attribute-definitions AttributeName=LockID,AttributeType=S --key-schema AttributeName=LockID,KeyType=HASH --billing-mode PAY_PER_REQUEST
```

### 3. Deploy Backend with Terraform

```sh
cd infrastructure
# dont forget to change the name of bucket in backend.tf
terraform init
terraform apply
```

This will create:

- DynamoDB table
- IAM roles
- Lambda functions

### 4. Create API Gateway Manually

1. Go to **API Gateway** in AWS Console.
2. Create a new **HTTP API**.
3. Add integrations for all three Lambda functions.
4. Add the following routes:
   - `POST /shorten` → Connect to `shortenUrl` Lambda
   - `GET /r/{id}` → Connect to `redirectUrl` Lambda
   - `GET /stats/{id}` → Connect to `urlStats` Lambda
5. Deploy the API and note the **API Gateway URL**.

### 5. Deploy Frontend

1. Create an S3 bucket for frontend hosting.
2. Enable static site hosting on the bucket.
3. Update the API Gateway URL in `client/.env.prodution and local`.
4. Build the frontend and deploy it:

```sh
cd client
npm install
npm run build
aws s3 sync dist/ s3://your-frontend-bucket --delete
```

### 6. Create CloudFront Distribution

1. Create a new **CloudFront Distribution**.
2. Set the **origin** as your frontend S3 bucket.
3. Create an **Origin Access Identity (OAI)** and update the bucket policy.
4. Set `index.html` as the **Default Root Object**.
5. (Optional) If using a domain, add it under **CNAMEs** and request an SSL certificate from ACM.
6. Deploy the CloudFront distribution.

### 7. Configure Redirection in CloudFront

1. Add another origin with the **origin path** set to your API Gateway **stage** and **type** as API Gateway.
2. In **Behaviors**, create a new behavior:
   - Path: `/r/*`
   - Origin: API Gateway
3. Deploy the changes.

### 8. Access Your Live URL Shortener

Your site will now be live!

- Use `https://your-cloudfront-url/` for the frontend.
- Shorten URLs using `POST /shorten`.
- Redirect using `GET /r/{id}`.
- Get stats using `GET /stats/{id}`.
