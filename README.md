# Bedrock Agent Chatbot

A simple chatbot that connects to Amazon Bedrock Agent.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Test Frontend (Mock Mode)
```bash
npm run dev
```

### 3. Deploy to AWS (Automatic)

**Prerequisites:**
- AWS CLI installed: https://aws.amazon.com/cli/
- AWS credentials configured: `aws configure`

**Deploy:**
```powershell
.\deploy.ps1
```

This automatically deploys Lambda + API Gateway and updates your app.

### 4. Run with Real Bedrock Agent
```bash
npm run dev
```

## Configuration

Hardcoded settings in `src/components/Chatbot.jsx`:
- Agent ID: ZOZI3PH32D
- Agent Alias ID: LC2IPXGFJV
- Region: us-west-2

## Cleanup

Remove all AWS resources:
```bash
aws cloudformation delete-stack --stack-name bedrock-chatbot-stack --region us-west-2
```
