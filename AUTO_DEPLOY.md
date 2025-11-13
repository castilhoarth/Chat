# Automatic Deployment

Deploy everything to AWS in one command!

## Prerequisites

1. Install AWS CLI: https://aws.amazon.com/cli/
2. Configure credentials:
   ```bash
   aws configure
   ```

## Deploy

```powershell
.\deploy.ps1
```

This will:
- Deploy Lambda function with Bedrock permissions
- Create API Gateway with CORS
- Update your React app automatically

## After Deployment

```bash
npm run dev
```

## Cleanup

```bash
aws cloudformation delete-stack --stack-name bedrock-chatbot-stack --region us-west-2
```
