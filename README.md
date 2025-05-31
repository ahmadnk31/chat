# AI Chatbot Platform

A powerful AI chatbot platform built with Next.js that allows you to create intelligent chatbots trained on your own data sources. The platform supports multiple data source types including websites, PDFs, and text content, with advanced vector search capabilities powered by OpenAI embeddings.

## Features

- 🤖 **AI-Powered Chatbots** - Create intelligent chatbots using OpenAI's GPT models
- 📚 **Multiple Data Sources** - Train on websites, PDFs, and custom text content
- 🔍 **Vector Search** - Advanced semantic search using OpenAI embeddings
- 💬 **Rich Text Rendering** - Beautiful message formatting with Contentful rich text
- 📊 **Analytics Dashboard** - Track chatbot performance and usage
- 🎨 **Customizable UI** - Customize colors, messages, and branding
- 📱 **Embeddable Widget** - Easy integration into any website
- 🔒 **User Management** - Multi-user support with authentication

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **AI**: OpenAI GPT-4 & Embeddings API
- **Storage**: AWS S3 (for file uploads)
- **Payments**: Stripe (subscription management)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenAI API key
- AWS S3 bucket (optional, for file uploads)
- Stripe account (optional, for payments)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd c1
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
DATABASE_URL="postgresql://..."
OPENAI_API_KEY="sk-..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma db seed
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### Creating a Chatbot

1. Sign up or log in to your account
2. Navigate to the dashboard
3. Click "Create New Chatbot"
4. Configure your chatbot settings
5. Add data sources (websites, PDFs, or text)
6. Test your chatbot and customize the appearance
7. Embed the chatbot on your website using the provided code

### Adding Data Sources

The platform supports three types of data sources:

- **Website URLs** - Crawl and extract content from web pages
- **PDF Files** - Upload and process PDF documents
- **Text Content** - Add custom text content directly

### Embedding Your Chatbot

Use the generated embed code to add your chatbot to any website:

```html
<script src="https://your-domain.com/embed.js"></script>
<script>
  ChatWidget.init({
    embedCode: 'your-embed-code',
    primaryColor: '#000000'
  });
</script>
```

## API Documentation

### Chat API
```
POST /api/chat/[embedCode]
```
Send messages to a chatbot and receive AI-generated responses.

### Chatbot Management
```
GET    /api/chatbots         # List chatbots
POST   /api/chatbots         # Create chatbot
GET    /api/chatbots/[id]    # Get chatbot
PUT    /api/chatbots/[id]    # Update chatbot
DELETE /api/chatbots/[id]    # Delete chatbot
```

### Data Sources
```
GET  /api/chatbots/[id]/sources     # List data sources
POST /api/chatbots/[id]/sources     # Add data source
```

## Development

### Database Schema

The application uses Prisma with PostgreSQL. Key models include:

- `User` - User accounts and settings
- `Chatbot` - Chatbot configurations
- `DataSource` - Training data sources
- `ContentChunk` - Processed content with embeddings
- `Conversation` - Chat sessions
- `Message` - Individual chat messages

### Testing

Run the test scripts to verify functionality:

```bash
# Check chatbot data and embeddings
node check-chatbot-data.js

# Test AI formatting
node test-ai-formatting.js

# Test API endpoints
node test-api.js
```

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy the application

### Environment Variables for Production

Ensure all environment variables are properly configured:

- Database URL (PostgreSQL)
- OpenAI API key
- AWS credentials (if using file uploads)
- Stripe keys (if using payments)
- NextAuth configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Your License Here]

## Support

For support and questions, please [create an issue](https://github.com/ahmadnk31/chat/issues) or contact [email](nikzadahmadullah@gmail.com).
