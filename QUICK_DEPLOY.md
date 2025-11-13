# Quick Deploy (5 minutes)

## Option 1: Automatic (Recommended)

### Prerequisites
- AWS CLI installed: https://aws.amazon.com/cli/
- Run: `aws configure` (enter your AWS credentials)

### Deploy
```powershell
.\deploy.ps1
```

Done! The script deploys everything and updates your app automatically.

---

## Option 2: Manual (AWS Console)

### Step 1: Create Lambda Function (2 min)
1. Go to AWS Console → Lambda → Create function
2. Name: `bedrockAgentHandler`
3. Runtime: **Node.js 18.x**
4. Create function

### Step 2: Add Code
Copy this code into the Lambda function:

```javascript
import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";

const AGENT_ID = 'ZOZI3PH32D';
const AGENT_ALIAS_ID = 'LC2IPXGFJV';
const REGION = 'us-west-2';

const client = new BedrockAgentRuntimeClient({ region: REGION });

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { message, sessionId } = body;

    if (!message) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify({ error: "Missing required parameter: message" })
      };
    }

    const command = new InvokeAgentCommand({
      agentId: AGENT_ID,
      agentAliasId: AGENT_ALIAS_ID,
      sessionId: sessionId || `session-${Date.now()}`,
      inputText: message
    });

    const response = await client.send(command);
    
    let agentResponse = "";
    for await (const event of response.completion) {
      if (event.chunk) {
        const chunk = event.chunk;
        if (chunk.bytes) {
          agentResponse += new TextDecoder().decode(chunk.bytes);
        }
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ 
        response: agentResponse || "No response from agent"
      })
    };
  } catch (error) {
    console.error("Error invoking Bedrock agent:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

Click **Deploy**

### Step 3: Add Permissions (1 min)
1. Configuration tab → Permissions
2. Click the Role name
3. Add permissions → Attach policies
4. Search "Bedrock" → Attach **AmazonBedrockFullAccess**

### Step 4: Create API Gateway (2 min)
1. AWS Console → API Gateway → Create API
2. Choose **REST API** → Build
3. Name: `BedrockChatbotAPI` → Create

### Step 5: Configure API
1. Actions → Create Resource
   - Name: `chat`
   - Enable CORS: ✓
   - Create

2. Select `/chat` → Actions → Create Method → **POST**
   - Integration type: Lambda Function
   - Use Lambda Proxy: ✓
   - Function: `bedrockAgentHandler`
   - Save → OK

3. Actions → Enable CORS → Enable and replace

4. Actions → Deploy API
   - Stage: [New Stage]
   - Name: `prod`
   - Deploy

### Step 6: Copy API URL
Copy the **Invoke URL**: `https://xxxxxx.execute-api.us-west-2.amazonaws.com/prod`

### Step 7: Update React App
Edit `src/components/Chatbot.jsx`:

```javascript
const MOCK_MODE = false;  // Line 9
const API_ENDPOINT = 'https://xxxxxx.execute-api.us-west-2.amazonaws.com/prod';  // Line 10 - paste your URL
```

### Step 8: Test
```bash
npm run dev
```

Done!
