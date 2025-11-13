import json
import boto3
import uuid
import os

# Environment variables
AGENT_ID = 'ZOZI3PH32D'
AGENT_ALIAS_ID = 'LC2IPXGFJV'
FLOW_ID = os.environ.get('FLOW_ID', '')  # Optional: Flow ID if needed
AWS_REGION = os.environ.get('AWS_REGION', 'us-west-2')

# Initialize client outside handler for reuse
bedrock_agent_client = boto3.client(
    service_name='bedrock-agent-runtime',
    region_name=AWS_REGION
)

# CORS headers (reutilizável)
CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

def lambda_handler(event, context):
    """
    Lambda handler to invoke Bedrock Agent
    Expected event format:
    {
        "message": "User question here",
        "sessionId": "optional-session-id"
    }
    """
    
    # Handle OPTIONS preflight request
    if event.get('requestContext', {}).get('http', {}).get('method') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': ''
        }
    
    try:
        # Parse input
        body = json.loads(event.get('body', '{}')) if isinstance(event.get('body'), str) else event
        user_message = body.get('message', '')
        session_id = body.get('sessionId', str(uuid.uuid4()))
        
        if not user_message:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Message is required'})
            }
        
        # Invoke agent
        response = bedrock_agent_client.invoke_agent(
            agentId=AGENT_ID,
            agentAliasId=AGENT_ALIAS_ID,
            sessionId=session_id,
            inputText=user_message
        )
        
        # Collect response from stream
        full_response = ""
        for event in response.get('completion', []):
            if 'chunk' in event:
                chunk = event['chunk']
                if 'bytes' in chunk:
                    text = chunk['bytes'].decode('utf-8')
                    full_response += text
        
        # Return response
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'response': full_response,
                'sessionId': session_id
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': str(e)})
        }
