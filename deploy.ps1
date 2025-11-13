# PowerShell deployment script for Windows
# This script automatically deploys the Lambda function and API Gateway

Write-Host "Starting automated deployment..." -ForegroundColor Green

# Check if AWS CLI is installed
try {
    aws --version | Out-Null
} catch {
    Write-Host "ERROR: AWS CLI is not installed!" -ForegroundColor Red
    Write-Host "Install it from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# Check AWS credentials
Write-Host "Checking AWS credentials..." -ForegroundColor Cyan
try {
    aws sts get-caller-identity | Out-Null
} catch {
    Write-Host "ERROR: AWS credentials not configured!" -ForegroundColor Red
    Write-Host "Run: aws configure" -ForegroundColor Yellow
    exit 1
}

$REGION = "us-west-2"
$STACK_NAME = "bedrock-chatbot-stack"

Write-Host "Deploying CloudFormation stack..." -ForegroundColor Cyan
aws cloudformation deploy `
    --template-file cloudformation.yaml `
    --stack-name $STACK_NAME `
    --capabilities CAPABILITY_IAM `
    --region $REGION

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Getting API endpoint..." -ForegroundColor Cyan
$API_URL = aws cloudformation describe-stacks `
    --stack-name $STACK_NAME `
    --region $REGION `
    --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" `
    --output text

Write-Host "`nDeployment successful!" -ForegroundColor Green
Write-Host "API Endpoint: $API_URL" -ForegroundColor Yellow

# Update the React app configuration
Write-Host "`nUpdating React app configuration..." -ForegroundColor Cyan
$chatbotFile = "src/components/Chatbot.jsx"
$content = Get-Content $chatbotFile -Raw
$content = $content -replace "const MOCK_MODE = true;", "const MOCK_MODE = false;"
$content = $content -replace "const API_ENDPOINT = 'YOUR_API_GATEWAY_ENDPOINT';", "const API_ENDPOINT = '$API_URL';"
Set-Content $chatbotFile $content

Write-Host "Configuration updated!" -ForegroundColor Green
Write-Host "`nYou can now run: npm run dev" -ForegroundColor Yellow
