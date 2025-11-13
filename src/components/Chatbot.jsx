import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

// Lambda configuration
// Em dev usa proxy local, em prod usa Lambda direta
const LAMBDA_URL = import.meta.env.DEV 
  ? '/api' 
  : 'https://ypwcnxepbbsojadq7srouhzb2u0elkll.lambda-url.us-west-2.on.aws/';

// Set to false to use real Lambda
const MOCK_MODE = false;

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    const currentInput = input;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      if (MOCK_MODE) {
        // Mock response for testing without backend
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockResponses = [
          `You said: "${currentInput}". This is a mock response. Set MOCK_MODE to false in Chatbot.jsx to use the real Bedrock agent.`,
          `I received your message about "${currentInput}". Currently running in mock mode for testing.`,
          `Thanks for your message: "${currentInput}". Deploy the backend and set MOCK_MODE=false to connect to Bedrock agent ${AGENT_ID}.`
        ];
        
        const assistantMessage = {
          role: 'assistant',
          content: mockResponses[Math.floor(Math.random() * mockResponses.length)]
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Real Lambda call via proxy
        console.log('Sending to Lambda:', currentInput);
        console.log('Lambda URL:', LAMBDA_URL);
        console.log('Environment:', import.meta.env.DEV ? 'Development' : 'Production');
        
        const response = await fetch(LAMBDA_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: currentInput
          })
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        let data;
        try {
          // Parse primeira camada
          const firstParse = JSON.parse(responseText);
          console.log('First parse:', firstParse);
          
          // Se tem body (formato Lambda), parse novamente
          if (firstParse.body && typeof firstParse.body === 'string') {
            data = JSON.parse(firstParse.body);
            console.log('Second parse (body):', data);
          } else {
            data = firstParse;
          }
        } catch (e) {
          console.error('Parse error:', e);
          // Se não for JSON, usa o texto direto
          data = { response: responseText };
        }

        const assistantMessage = {
          role: 'assistant',
          content: data.response || data.completion || data.message || data.output || responseText
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Full error details:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      let errorMessage = '';
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = `🚫 CORS Error: A Lambda não permite requisições do domínio ${window.location.origin}.\n\n` +
                      `Solução: Configure CORS na Lambda Function URL no AWS Console.\n` +
                      `Veja LAMBDA_CORS_FIX.md para instruções detalhadas.`;
      } else if (error.message.includes('HTTP 400')) {
        errorMessage = `❌ Erro 400: A Lambda recebeu a requisição mas o formato está incorreto.\n` +
                      `Detalhes: ${error.message}`;
      } else if (error.message.includes('HTTP 500')) {
        errorMessage = `⚠️ Erro 500: Erro interno na Lambda.\n` +
                      `Detalhes: ${error.message}`;
      } else if (error.message.includes('HTTP 404')) {
        errorMessage = `🔍 Erro 404: Lambda URL não encontrada.\n` +
                      `Verifique se a URL está correta: ${LAMBDA_URL}`;
      } else {
        errorMessage = `❌ Erro: ${error.message}\n\n` +
                      `Tipo: ${error.name}\n` +
                      `Ambiente: ${import.meta.env.DEV ? 'Development' : 'Production'}`;
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="message-content typing">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
          className="message-input"
        />
        <button type="submit" disabled={loading || !input.trim()} className="send-btn">
          Send
        </button>
      </form>

    </div>
  );
};

export default Chatbot;
