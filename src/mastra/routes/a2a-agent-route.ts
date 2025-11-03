import { registerApiRoute } from '@mastra/core/server';
import { randomUUID } from 'crypto';

export const a2aAgentRoute = registerApiRoute('/a2a/agent/:agentId', {
  method: 'POST',
  handler: async (c) => {
    // Set CORS headers
    c.header('Access-Control-Allow-Origin', '*');
    c.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (c.req.method === 'OPTIONS') {
      return c.body(null, 204);
    }

    try {
      const mastra = c.get('mastra');
      const agentId = c.req.param('agentId');

      console.log(`[A2A] Received request for agent: ${agentId}`);

      // Parse JSON-RPC 2.0 request
      let body;
      try {
        body = await c.req.json();
        console.log('[A2A] Request body:', JSON.stringify(body, null, 2));
      } catch (parseError) {
        console.error('[A2A] JSON parse error:', parseError);
        // Return 200 with empty/default response if JSON is empty
        return c.json({
          jsonrpc: '2.0',
          id: null,
          result: {
            id: randomUUID(),
            contextId: randomUUID(),
            status: {
              state: 'completed',
              timestamp: new Date().toISOString(),
              message: {
                messageId: randomUUID(),
                role: 'agent',
                parts: [{ kind: 'text', text: 'Ready to receive requests' }],
                kind: 'message'
              }
            },
            artifacts: [],
            history: [],
            kind: 'task'
          }
        }, 200);
      }

      const { jsonrpc, id: requestId, method, params } = body;

      // Validate JSON-RPC 2.0 format
      if (jsonrpc !== '2.0') {
        console.error('[A2A] Invalid jsonrpc version:', jsonrpc);
        return c.json({
          jsonrpc: '2.0',
          id: requestId || null,
          error: {
            code: -32600,
            message: 'Invalid Request: jsonrpc must be "2.0"'
          }
        }, 400);
      }

      if (!requestId) {
        console.error('[A2A] Missing request id');
        return c.json({
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32600,
            message: 'Invalid Request: id is required'
          }
        }, 400);
      }

      // Get agent
      const agent = mastra.getAgent(agentId);
      if (!agent) {
        console.error(`[A2A] Agent not found: ${agentId}`);
        console.log('[A2A] Available agents:', Object.keys(mastra.getAgents() || {}));
        return c.json({
          jsonrpc: '2.0',
          id: requestId,
          error: {
            code: -32602,
            message: `Agent '${agentId}' not found`,
            data: { 
              availableAgents: Object.keys(mastra.getAgents() || {}),
              requestedAgent: agentId
            }
          }
        }, 404);
      }

      // Extract messages from params
      const { message, messages, contextId, taskId, metadata } = params || {};

      let messagesList = [];
      if (message) {
        messagesList = [message];
      } else if (messages && Array.isArray(messages)) {
        messagesList = messages;
      } else {
        console.error('[A2A] No messages provided in params');
        return c.json({
          jsonrpc: '2.0',
          id: requestId,
          error: {
            code: -32602,
            message: 'Invalid params: message or messages required'
          }
        }, 400);
      }

      // Convert A2A messages to Mastra format
      const mastraMessages = messagesList.map((msg) => ({
        role: msg.role || 'user',
        content: msg.parts?.map((part: { kind: string; text?: string; data?: any }) => {
          if (part.kind === 'text') return part.text;
          if (part.kind === 'data') return JSON.stringify(part.data);
          return '';
        }).join('\n') || ''
      }));

      console.log('[A2A] Executing agent with messages:', mastraMessages);

      // Execute agent
      const response = await agent.generate(mastraMessages);
      const agentText = response.text || '';

      console.log('[A2A] Agent response:', agentText);

      // Build artifacts array
      const artifacts = [
        {
          artifactId: randomUUID(),
          name: `${agentId}Response`,
          parts: [{ kind: 'text', text: agentText }]
        }
      ];

      // Add tool results as artifacts
      if (response.toolResults && response.toolResults.length > 0) {
        artifacts.push({
          artifactId: randomUUID(),
          name: 'ToolResults',
          parts: response.toolResults.map((result) => ({
            kind: 'text',
            text: JSON.stringify(result)
          }))
        });
      }

      // Build conversation history
      const history = [
        ...messagesList.map((msg) => ({
          kind: 'message',
          role: msg.role || 'user',
          parts: msg.parts,
          messageId: msg.messageId || randomUUID(),
          taskId: msg.taskId || taskId || randomUUID(),
        })),
        {
          kind: 'message',
          role: 'agent',
          parts: [{ kind: 'text', text: agentText }],
          messageId: randomUUID(),
          taskId: taskId || randomUUID(),
        }
      ];

      // Return A2A-compliant response
      const a2aResponse = {
        jsonrpc: '2.0',
        id: requestId,
        result: {
          id: taskId || randomUUID(),
          contextId: contextId || randomUUID(),
          status: {
            state: 'completed',
            timestamp: new Date().toISOString(),
            message: {
              messageId: randomUUID(),
              role: 'agent',
              parts: [{ kind: 'text', text: agentText }],
              kind: 'message'
            }
          },
          artifacts,
          history,
          kind: 'task'
        }
      };

      console.log('[A2A] Sending response');

      return c.json(a2aResponse);

    } catch (error) {
      console.error('[A2A] Internal error:', error);
      return c.json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32603,
          message: 'Internal error',
          data: { 
            details: (error as Error).message,
            stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
          }
        }
      }, 500);
    }
  }
});