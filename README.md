# Vibe Coding - AI-Powered Coding Assistant

Vibe Coding is an AI-powered coding assistant platform that helps developers write better code, debug issues, and learn new programming concepts. Built with Next.js 14, TypeScript, and modern web technologies.

## 🚀 Features

- **AI-Powered Code Generation**: Generate code snippets, functions, and complete solutions using advanced AI technology
- **Multi-Language Support**: Get help with Python, JavaScript, Java, C++, and many other programming languages
- **Real-time Debugging**: Identify and fix bugs in your code with intelligent error analysis
- **Learning Resources**: Access explanations, tutorials, and best practices
- **Security**: Cloudflare Turnstile integration for bot protection
- **Internationalization**: Full support for English and Chinese
- **SEO Optimized**: Complete structured data and meta tags for search engines

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Markdown** - Markdown rendering with syntax highlighting

### Backend & APIs
- **Next.js API Routes** - Serverless API endpoints
- **OpenAI/OpenRouter** - AI model integration
- **PostgreSQL** - Database for user data and chat history
- **NextAuth.js** - Authentication with Google OAuth

### Security & Performance
- **Cloudflare Turnstile** - Bot protection and spam prevention
- **Server-Side Rendering** - SEO optimization and performance
- **Streaming Responses** - Real-time AI response streaming

### Internationalization
- **next-intl** - Multi-language support (English/Chinese)
- **Dynamic routing** - Language-based URL routing

## 📁 Project Structure

```
vibe-coding/
├── src/
│   ├── app/
│   │   └── [locale]/
│   │       ├── api/                 # API routes
│   │       │   ├── auth/           # Authentication
│   │       │   ├── chat/           # Chat functionality
│   │       │   ├── turnstile/      # Security verification
│   │       │   └── user/           # User management
│   │       ├── chat/[uid]/         # Individual chat pages
│   │       ├── discover/           # Public chat discovery
│   │       ├── history/            # User chat history
│   │       ├── privacy-policy/     # Privacy policy page
│   │       ├── terms-of-service/   # Terms of service page
│   │       ├── layout.tsx          # Root layout
│   │       ├── page.tsx            # Home page
│   │       └── PageComponent.tsx   # Main page component
│   ├── components/
│   │   ├── ChatInterface.tsx       # Main chat interface
│   │   ├── TurnstileWidget.tsx     # Security verification
│   │   ├── SEOContent.tsx          # SEO content sections
│   │   ├── StructuredData.tsx      # Schema.org markup
│   │   ├── Header.tsx              # Navigation header
│   │   ├── Footer.tsx              # Site footer
│   │   └── ...                     # Other components
│   ├── configs/
│   │   ├── languageText.ts         # Text configuration
│   │   └── openaiConfig.ts         # AI model configuration
│   ├── context/
│   │   └── common-context.tsx      # Global state management
│   ├── libs/
│   │   └── db.ts                   # Database connection
│   ├── servers/                    # Server-side functions
│   ├── utils/                      # Utility functions
│   └── i18n.ts                     # Internationalization config
├── messages/
│   ├── en.json                     # English translations
│   └── zh.json                     # Chinese translations
├── public/                         # Static assets
└── ...config files
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI/OpenRouter API key
- Cloudflare Turnstile keys (optional)

### Environment Variables

Create `.env.local` file:

```bash
# Database
POSTGRES_URL="postgresql://user:password@host:port/database"

# AI Configuration
OPENAI_API_KEY="your_openai_api_key"
OPENAI_API_BASE_URL="https://openrouter.ai/api"
OPENAI_API_MODEL="your_model_name"

# Authentication (optional)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXT_PUBLIC_CHECK_GOOGLE_LOGIN=0
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_SECRET_ID="your_google_secret"

# Cloudflare Turnstile (optional)
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your_site_key"
TURNSTILE_SECRET_KEY="your_secret_key"

# Site Configuration
NEXT_PUBLIC_WEBSITE_NAME="Vibe Coding"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd vibe-coding
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up database**
```bash
# Create PostgreSQL database and tables
# (Database schema setup instructions would go here)
```

4. **Configure environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

5. **Run development server**
```bash
npm run dev
```

6. **Open in browser**
```
http://localhost:3000
```

## 🔄 User Flow

### Basic Usage Flow
1. User visits the homepage
2. Enters a coding question in the text area
3. Clicks "Get Code Help" button
4. If needed, completes Turnstile security verification
5. AI processes the request and streams response
6. User receives code solution with explanation

### Authentication Flow (Optional)
1. User clicks login button
2. Redirected to Google OAuth
3. Returns with authentication token
4. Can access personalized features and history

## 🏗 Architecture

### Frontend Architecture
- **Server Components**: Static content, SEO optimization
- **Client Components**: Interactive features, state management
- **Hybrid Rendering**: SSR for SEO + CSR for interactivity

### API Architecture
- **RESTful APIs**: Standard HTTP methods
- **Streaming**: Real-time AI response streaming
- **Middleware**: Authentication and security checks

### Security Architecture
- **Turnstile Integration**: Bot protection
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Sanitize user inputs
- **HTTPS**: Secure data transmission

## 🌐 Internationalization

The application supports multiple languages:

- **English** (`/en` or `/`)
- **Chinese** (`/zh`)

Language files are located in the `messages/` directory:
- `en.json` - English translations
- `zh.json` - Chinese translations

## 🔒 Security Features

### Cloudflare Turnstile
- Bot protection for AI requests
- Prevents spam and abuse
- Seamless user experience

### Authentication
- Google OAuth integration
- Secure session management
- Optional user accounts

### Data Protection
- Input sanitization
- SQL injection prevention
- XSS protection

## 📊 SEO Optimization

### Structured Data
- Organization schema
- Software application schema
- FAQ schema
- Website schema

### Content Optimization
- Semantic HTML structure
- Meta tags and descriptions
- Multi-language sitemaps
- Rich snippets support

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker build -t vibe-coding .
docker run -p 3000:3000 vibe-coding
```

### Environment-Specific Configuration
- Development: `.env.local`
- Production: `.env.production`

## 🧪 Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📈 Performance

### Optimization Features
- Server-side rendering
- Static generation where possible
- Image optimization
- Code splitting
- Streaming responses

### Monitoring
- Core Web Vitals tracking
- Error monitoring
- Performance analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@vibecoding.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

## 🔄 Changelog

### v1.0.0
- Initial release
- AI-powered code generation
- Multi-language support
- Turnstile security integration
- SEO optimization

---

Built with ❤️ by the Vibe Coding team