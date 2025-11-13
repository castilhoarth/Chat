# Como Habilitar CORS na Lambda Function URL

O chatbot funciona localmente mas não em produção porque a Lambda Function URL precisa ter CORS habilitado.

## Solução: Configurar CORS na Lambda

1. Acesse o AWS Console
2. Vá para Lambda > Functions
3. Selecione sua função Lambda
4. Vá para "Configuration" > "Function URL"
5. Clique em "Edit"
6. Em "Configure cross-origin resource sharing (CORS)", marque a opção
7. Configure:
   - **Allow origin**: `*` (ou especifique seu domínio Amplify)
   - **Allow methods**: `POST, OPTIONS`
   - **Allow headers**: `content-type`
   - **Max age**: `86400`
8. Salve as alterações

## Alternativa: Modificar o código da Lambda

Se você tem acesso ao código da Lambda, adicione headers CORS na resposta:

```python
def lambda_handler(event, context):
    # Seu código aqui
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        'body': json.dumps(response)
    }
```

Depois de configurar CORS, faça o deploy novamente no Amplify.
