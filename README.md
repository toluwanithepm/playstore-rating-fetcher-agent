# 📱 PlayStore Rating Fetching Agent

> An intelligent AI agent that fetches Google Play Store app ratings and information, built with Mastra and integrated with Telex.im using the A2A protocol.

## 🌟 Features

- ✅ **Real-time Rating Lookup** - Get instant app ratings by simply asking
- ✅ **Comprehensive Metrics** - Rating, reviews, installs, developer info, version, and more
- ✅ **Scheduled Monitoring** - Automatic periodic checks with configurable intervals
- ✅ **Smart Scoring System** - Evaluates app quality based on multiple factors
- ✅ **Conversation Memory** - Maintains context across interactions
- ✅ **A2A Protocol Compliant** - Seamless integration with Telex.im
- ✅ **Error Handling** - Graceful failure handling with meaningful error messages
- ✅ **Natural Language Responses** - Clean, formatted, conversational output

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Local Development](#local-development)
  - [Testing](#testing)
  - [Deployment](#deployment)
- [Telex.im Integration](#telexim-integration)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20 or later
- **pnpm** (recommended) or npm
- **Mastra CLI** (install globally):
  ```bash
  npm install -g @mastra/cli
  ```

You'll also need:
- A **Google Gemini API key** (free tier available at [Google AI Studio](https://makersuite.google.com/app/apikey))
- Basic understanding of TypeScript and async/await patterns

## 📦 Installation

### Option 1: Using Create Mastra (Recommended)

1. **Create a new Mastra project:**
   ```bash
   npm create mastra@latest -y
   ```

2. **Follow the prompts:**
   - Project name: `playstore-rating-agent`
   - Model provider: Select **Google Gemini**
   - Paste your Gemini API key
   - Choose the default project structure

3. **Navigate to your project:**
   ```bash
   cd playstore-rating-agent
   ```

4. **Replace the example files with the PlayStore agent code**

5. **Install the Play Store scraper dependency:**
   ```bash
   pnpm add google-play-scraper
   ```

### Option 2: Manual Setup

1. **Clone this repository:**
   ```bash
   git clone https://github.com/yourusername/playstore-rating-agent.git
   cd playstore-rating-agent
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` and add your API key:**
   ```env
   GOOGLE_API_KEY=your_gemini_api_key_here
   ```

## 📁 Project Structure

```
playstore-rating-agent/
├── src/
│   └── mastra/
│       ├── agents/
│       │   └── playstore-agent.ts       # Main agent configuration
│       ├── tools/
│       │   └── playstore-tool.ts        # Play Store scraping tool
│       ├── workflows/
│       │   └── playstore-workflow.ts    # Scheduled rating checks
│       ├── scorers/
│       │   └── playstore-scorer.ts      # App quality scoring logic
│       ├── routes/
│       │   └── a2a-agent-route.ts       # A2A protocol handler
│       └── index.ts                     # Mastra configuration & setup
├── .env.example                          # Environment variables template
├── package.json                          # Project dependencies
├── tsconfig.json                         # TypeScript configuration
└── README.md                             # This file
```

### File Descriptions

| File | Purpose |
|------|---------|
| `playstore-agent.ts` | Defines the AI agent with instructions and tools |
| `playstore-tool.ts` | Implements Play Store data fetching logic |
| `playstore-workflow.ts` | Multi-step workflow for scheduled checks |
| `playstore-scorer.ts` | Evaluates app quality with scoring algorithm |
| `a2a-agent-route.ts` | Handles A2A protocol communication |
| `index.ts` | Central configuration for Mastra instance |

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Required: Google Gemini API Key
GOOGLE_API_KEY=your_api_key_here

# Optional: Database Configuration
MASTRA_DB_URL=file:./mastra.db

# Optional: Logging
LOG_LEVEL=debug

# Optional: Server Configuration
PORT=3000
HOST=0.0.0.0
```

### Agent Configuration

The agent is configured in `src/mastra/agents/playstore-agent.ts`:

```typescript
export const playStoreAgent = new Agent({
  name: 'PlayStore Rating Agent',
  instructions: `...`, // Detailed instructions for the agent
  model: 'google/gemini-2.0-flash',
  tools: { playStoreRatingTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});
```

You can customize:
- **Model**: Change to any supported model provider
- **Instructions**: Modify agent behavior and response style
- **Memory**: Configure different storage backends
- **Tools**: Add additional tools as needed

## 🚀 Usage

### Local Development

1. **Start the development server:**
   ```bash
   pnpm run dev
   ```

2. **The server will start on** `http://localhost:3000`

3. **Access the Swagger UI** at `http://localhost:3000/api-docs` to explore endpoints

### Building for Production

```bash
pnpm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Running Tests

```bash
# Test the A2A endpoint locally
curl -X POST http://localhost:3000/a2a/agent/playStoreAgent \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "test-001",
    "method": "message/send",
    "params": {
      "message": {
        "kind": "message",
        "role": "user",
        "parts": [
          {
            "kind": "text",
            "text": "What is the rating for WhatsApp?"
          }
        ],
        "messageId": "msg-001",
        "taskId": "task-001"
      },
      "configuration": {
        "blocking": true
      }
    }
  }'
```

### Deployment

Deployment was surprisingly straightforward:


# Build the project
mastra dev

You can use the above to build your work on your Local. If all is fine, you should see this on your terminal


◐ Preparing development environment...
✓ Initial bundle complete
◇ Starting Mastra dev server...
WARN [2025-11-01 12:47:40.680 +0100] (PlayStoreAgent): Mastra telemetry is deprecated and will be removed on the Nov 4th release. Instead use AI Tracing. More info can be found here: https://github.com/mastra-ai/mastra/issues/8577 and here: https://mastra.ai/en/docs/observability/ai-tracing/overview
mastra-cloud-ai-tracing-exporter disabled: MASTRA_CLOUD_ACCESS_TOKEN environment variable not set. 🚀 Sign up for Mastra Cloud at https://cloud.mastra.ai to see your AI traces online and obtain your access token.

 mastra  0.17.7 ready in 25760 ms

│ Playground: http://localhost:4111/
│ API:        http://localhost:4111/api

To deploy and get your url,

simply push your code to github,

go to Mastra Cloud

Import your github repo and start your deployment

After deployment, you'll receive your endpoint URL:
```
https://playstore-rating-fetcher-agent.mastra.cloud/a2a/agent/playStoreAgent
```

## 🔗 Telex.im Integration

### Step 1: Deploy Your Agent

Ensure your agent is deployed to Mastra Cloud and you have the endpoint URL.

### Step 2: Create a Telex Workflow

1. Log in to your [Telex.im dashboard](https://telex.im)
2. Navigate to **AI Co-Workers** section
3. Click **Create New Co-Worker**
4. Paste the following workflow configuration:

```json
{
  "active": false,
  "category": "utilities",
  "description": "A workflow that gives Google Play Store app ratings",
  "id": "pR8sT0r3aG3nT1dX",
  "long_description": "\n      You are a helpful assistant that provides Google Play Store app ratings and information.\n\n      Your primary function is to help users get app ratings and details from the Google Play Store. When responding:\n      - Always ask for an app name if none is provided\n      - If the app name isn't in English, please translate it\n      - Provide the app's current rating, total number of reviews, and other relevant details\n      - Include relevant details like installs, developer, and last update date\n      - Keep responses concise but informative\n      - If multiple apps match the search, ask the user to be more specific\n      - If asked about rating trends or comparisons, provide helpful insights based on the data\n\n      Use the playStoreRatingTool to fetch current app ratings and information.\n",
  "name": "playstore_rating_agent",
  "nodes": [
    {
      "id": "playstore_agent",
      "name": "playstore agent",
      "parameters": {},
      "position": [816, -112],
      "type": "a2a/mastra-a2a-node",
      "typeVersion": 1,
      "url": "https://YOUR-DEPLOYMENT-URL.mastra.cloud/a2a/agent/playStoreAgent"
    }
  ],
  "pinData": {},
  "settings": {
    "executionOrder": "v1"
  },
  "short_description": "Get app ratings from Google Play Store"
}
```

5. **Replace** `YOUR-DEPLOYMENT-URL` with your actual Mastra Cloud URL
6. **Activate** the workflow by setting `"active": true`
7. **Save** the configuration

### Step 3: Test the Integration

Send a test message through Telex:
```
"What's the rating for Instagram?"
```

You should receive a formatted response with rating details!

## 📚 API Reference

### A2A Endpoint

**Endpoint:** `POST /a2a/agent/playStoreAgent`

**Request Format (JSON-RPC 2.0):**
```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "method": "message/send",
  "params": {
    "message": {
      "kind": "message",
      "role": "user",
      "parts": [
        {
          "kind": "text",
          "text": "Your question here"
        }
      ],
      "messageId": "msg-uuid",
      "taskId": "task-uuid"
    },
    "configuration": {
      "blocking": true
    }
  }
}
```

**Response Format:**
```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "result": {
    "id": "task-uuid",
    "contextId": "context-uuid",
    "status": {
      "state": "completed",
      "timestamp": "2025-11-01T12:00:00.000Z",
      "message": {
        "messageId": "response-uuid",
        "role": "agent",
        "parts": [
          {
            "kind": "text",
            "text": "Formatted response here"
          }
        ],
        "kind": "message"
      }
    },
    "artifacts": [...],
    "history": [...],
    "kind": "task"
  }
}
```

### PlayStore Tool Schema

**Input:**
```typescript
{
  appName: string  // Name of the app to search for
}
```

**Output:**
```typescript
{
  appId: string           // Package name (e.g., "com.whatsapp")
  title: string           // App display name
  rating: number          // Average rating (0-5)
  ratingsCount: number    // Total number of ratings
  reviews: number         // Total number of reviews
  installs: string        // Install range (e.g., "1,000,000,000+")
  price: string | number  // "Free" or price amount
  developer: string       // Developer name
  lastUpdated: string     // ISO date string
  version: string         // Current version
  url: string            // Play Store URL
}
```

## 💡 Examples

### Example 1: Basic Rating Query

**User Input:**
```
"What's the rating for TikTok?"
```

**Agent Response:**
```
TikTok has a rating of 4.5/5.0 with 89,234,567 total ratings. It has been 
installed 1,000,000,000+ times and was last updated on 2025-10-28. The 
current version is 32.5.4 and it is offered for free by TikTok Pte. Ltd.
```

### Example 2: Multiple App Comparison

**User Input:**
```
"Compare the ratings for Instagram, Facebook, and Twitter"
```

**Agent Response:**
```
Here's a comparison of the three apps:

📱 Instagram: 4.5/5.0 (87M ratings) - 1B+ installs
📱 Facebook: 3.9/5.0 (156M ratings) - 5B+ installs  
📱 Twitter (X): 4.1/5.0 (12M ratings) - 500M+ installs

Instagram has the highest rating, while Facebook has the most installs 
despite a lower rating.
```


## 🐛 Troubleshooting

### Common Issues

#### Issue: "App not found" error

**Cause:** The app name might be misspelled or the app doesn't exist on Play Store.

**Solution:**
- Double-check the spelling
- Try the exact title from the Play Store
- Some apps may be region-restricted

#### Issue: Raw JSON appearing in responses

**Cause:** Agent instructions are not explicit enough about formatting.

**Solution:**
- Ensure the agent instructions explicitly say: "DO NOT include raw JSON or tool output"
- Provide clear formatting examples in the instructions
- Redeploy after updating instructions

#### Issue: Rate limiting errors

**Cause:** Google Play Store scraper has rate limits.

**Solution:**
- Implement caching for frequently requested apps
- Add delays between scheduled checks
- Consider using Redis for distributed rate limiting

#### Issue: Telex integration not working

**Cause:** Workflow JSON format doesn't match Telex requirements.

**Solution:**
- Use the exact workflow format provided above
- Ensure `position` is an array: `[816, -112]`, not an object
- Node `name` should be lowercase: `"playstore agent"`
- `type` must be: `"a2a/mastra-a2a-node"`

### Debug Mode

Enable detailed logging:

```typescript
// In src/mastra/index.ts
logger: new PinoLogger({
  name: 'PlayStoreAgent',
  level: 'debug',  // Change to 'debug' for verbose logs
}),
```

### Testing Locally

Test components individually:

```bash
# Test the tool directly
node -e "
const { playStoreRatingTool } = require('./dist/mastra/tools/playstore-tool');
playStoreRatingTool.execute({ context: { appName: 'WhatsApp' } })
  .then(console.log)
  .catch(console.error);
"
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with descriptive messages:**
   ```bash
   git commit -m "Add: iOS App Store support"
   ```
5. **Push to your fork:**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Keep commits atomic and well-described

## 🛣️ Roadmap

Future enhancements we're considering:

- [ ] **iOS App Store Integration** - Support for Apple App Store ratings
- [ ] **Rating Trend Analysis** - Track and visualize rating changes over time
- [ ] **Alert System** - Notify when ratings drop significantly
- [ ] **Review Sentiment Analysis** - Analyze user review sentiment
- [ ] **Competitor Comparison** - Side-by-side app comparisons
- [ ] **Batch Queries** - Check multiple apps in one request
- [ ] **Historical Data** - Store and query past rating data
- [ ] **Export Reports** - Generate PDF/CSV reports
- [ ] **Webhook Support** - Push notifications for rating changes
- [ ] **Multi-region Support** - Check ratings across different countries

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mastra Team** - For the excellent framework and documentation
- **Telex.im** - For the A2A protocol and integration support
- **google-play-scraper** - For the Play Store API wrapper
- **Google Gemini** - For the powerful AI model

## 📞 Support

Need help? Here are your options:

- **Issues**: [GitHub Issues](https://github.com/toluwanithepm/playstore-rating-fetcher-agent/issues)
- **Mastra Docs**: [https://docs.mastra.ai](https://docs.mastra.ai)
- **Telex Support**: [https://telex.im/support](https://telex.im/support)
- **Email**: goldenwritertolu@gmail.com

## 🔗 Links

- **Live Demo**: [Try it on Telex.im](https://telex.im)
- **Blog Post**: [Building a PlayStore Rating Fetching Agent](https://wani.hashnode.dev/building-a-google-play-store-rating-agent-with-mastra-and-telexim)
- **Mastra**: [https://mastra.ai](https://mastra.ai)
- **A2A Protocol**: [https://telex.im/docs/a2a](https://telex.im/docs/a2a)

---

**Built with ❤️ using [Mastra](https://mastra.ai) and integrated with [Telex.im](https://telex.im)**

⭐ If you find this project helpful, please consider giving it a star!