# Vibe Coding - Flow Diagrams

## 🔄 System Flow Diagrams

### 1. Overall System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[User Browser]
        PWA[Progressive Web App]
    end
    
    subgraph "CDN Layer"
        CF[Cloudflare CDN]
        Static[Static Assets]
    end
    
    subgraph "Application Layer"
        NextJS[Next.js 14 App]
        SSR[Server Components]
        CSR[Client Components]
        API[API Routes]
    end
    
    subgraph "Security Layer"
        Turnstile[Cloudflare Turnstile]
        Auth[NextAuth.js]
        RateLimit[Rate Limiting]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL)]
        Cache[Redis Cache]
    end
    
    subgraph "External Services"
        OpenAI[OpenAI/OpenRouter]
        Google[Google OAuth]
        Analytics[Analytics]
    end
    
    Browser --> CF
    CF --> NextJS
    NextJS --> SSR
    NextJS --> CSR
    NextJS --> API
    
    API --> Turnstile
    API --> Auth
    API --> RateLimit
    
    API --> DB
    API --> Cache
    API --> OpenAI
    
    Auth --> Google
    NextJS --> Analytics
    
    CF --> Static
```

### 2. User Journey Flow

```mermaid
flowchart TD
    Start([User visits site]) --> Load[Page loads with SSR content]
    Load --> Input[User enters coding question]
    Input --> Click[User clicks "Get Code Help"]
    
    Click --> CheckAuth{Authentication required?}
    CheckAuth -->|Yes| Login[Show login modal]
    CheckAuth -->|No| CheckToken{Has Turnstile token?}
    
    Login --> OAuth[Google OAuth flow]
    OAuth --> CheckToken
    
    CheckToken -->|No| ShowTurnstile[Display Turnstile widget]
    CheckToken -->|Yes| SendRequest[Send API request]
    
    ShowTurnstile --> UserVerify[User completes verification]
    UserVerify --> VerifySuccess{Verification successful?}
    VerifySuccess -->|No| ShowError[Show error message]
    VerifySuccess -->|Yes| AutoExecute[Auto-execute generation]
    
    ShowError --> ShowTurnstile
    AutoExecute --> SendRequest
    
    SendRequest --> ServerVerify[Server verifies token]
    ServerVerify --> RateCheck[Check rate limits]
    RateCheck --> AIRequest[Send request to AI]
    
    AIRequest --> StreamResponse[Stream AI response]
    StreamResponse --> DisplayResult[Display result to user]
    DisplayResult --> SaveChat[Save chat to database]
    SaveChat --> End([End])
    
    style Start fill:#e1f5fe
    style End fill:#e8f5e8
    style ShowError fill:#ffebee
```

### 3. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant H as Header Component
    participant N as NextAuth
    participant G as Google OAuth
    participant DB as Database
    participant S as Session Store
    
    U->>H: Click "Login"
    H->>N: signIn('google')
    N->>G: Redirect to Google OAuth
    
    Note over G: User grants permission
    G->>N: Return authorization code
    N->>G: Exchange code for tokens
    G->>N: Return access & ID tokens
    
    N->>DB: Check if user exists
    alt User doesn't exist
        N->>DB: Create new user record
    end
    
    N->>S: Create session
    N->>H: Return user data
    H->>U: Show logged-in state
    
    Note over U,S: User is now authenticated
```

### 4. Chat Generation Flow

```mermaid
flowchart TD
    UserInput[User enters question] --> ValidateInput{Input valid?}
    ValidateInput -->|No| ShowError[Show validation error]
    ValidateInput -->|Yes| CheckAuth{Auth required?}
    
    CheckAuth -->|Yes| IsLoggedIn{User logged in?}
    CheckAuth -->|No| CheckTurnstile{Has Turnstile token?}
    
    IsLoggedIn -->|No| ShowLogin[Show login modal]
    IsLoggedIn -->|Yes| CheckTurnstile
    
    ShowLogin --> LoginFlow[Google OAuth flow]
    LoginFlow --> CheckTurnstile
    
    CheckTurnstile -->|No| ShowTurnstile[Display Turnstile]
    CheckTurnstile -->|Yes| PrepareRequest[Prepare API request]
    
    ShowTurnstile --> UserVerifies[User completes verification]
    UserVerifies --> TurnstileCallback[onVerify callback]
    TurnstileCallback --> SetToken[Set turnstile token]
    SetToken --> AutoExecute[Auto-execute if pending]
    AutoExecute --> PrepareRequest
    
    PrepareRequest --> SendAPI[POST /api/chat/generateTextStream]
    SendAPI --> ServerValidation[Server-side validation]
    
    ServerValidation --> VerifyTurnstile[Verify Turnstile token]
    VerifyTurnstile --> CheckRateLimit[Check rate limits]
    CheckRateLimit --> CallAI[Call AI service]
    
    CallAI --> StreamStart[Start streaming response]
    StreamStart --> ProcessChunk[Process response chunk]
    ProcessChunk --> UpdateUI[Update UI with chunk]
    UpdateUI --> MoreChunks{More chunks?}
    
    MoreChunks -->|Yes| ProcessChunk
    MoreChunks -->|No| StreamComplete[Stream complete]
    
    StreamComplete --> SaveToDB[Save chat to database]
    SaveToDB --> ResetState[Reset component state]
    ResetState --> Complete[Generation complete]
    
    style UserInput fill:#e3f2fd
    style Complete fill:#e8f5e8
    style ShowError fill:#ffebee
```

### 5. Security Verification Flow

```mermaid
stateDiagram-v2
    [*] --> NoToken: User clicks "Get Answer"
    
    NoToken --> ShowWidget: Display Turnstile widget
    ShowWidget --> UserInteraction: User sees challenge
    UserInteraction --> Solving: User solves challenge
    Solving --> WidgetCallback: Widget calls onVerify
    
    WidgetCallback --> TokenReceived: Token stored in state
    TokenReceived --> AutoExecute: Auto-execute if pending
    AutoExecute --> ServerVerification: Send to server
    
    ServerVerification --> CloudflareAPI: Verify with Cloudflare
    CloudflareAPI --> VerificationResult: Get result
    
    VerificationResult --> Success: Token valid
    VerificationResult --> Failed: Token invalid
    
    Success --> ProcessRequest: Continue with AI request
    Failed --> ResetWidget: Reset and show widget again
    ResetWidget --> ShowWidget
    
    ProcessRequest --> [*]: Request completed
    
    state UserInteraction {
        [*] --> Challenge
        Challenge --> Checkbox: Simple challenge
        Challenge --> Interactive: Complex challenge
        Checkbox --> Solved
        Interactive --> Solved
        Solved --> [*]
    }
```

### 6. Database Operations Flow

```mermaid
flowchart LR
    subgraph "User Management"
        CreateUser[Create User] --> UserDB[(users table)]
        GetUser[Get User] --> UserDB
        UpdateUser[Update User] --> UserDB
    end
    
    subgraph "Chat Management"
        SaveChat[Save Chat] --> ChatDB[(chat_record table)]
        GetHistory[Get History] --> ChatDB
        GetPublic[Get Public Chats] --> ChatDB
    end
    
    subgraph "Session Management"
        CreateSession[Create Session] --> SessionDB[(sessions table)]
        ValidateSession[Validate Session] --> SessionDB
        CleanupSessions[Cleanup Expired] --> SessionDB
    end
    
    UserDB --> ChatDB: user_id reference
    UserDB --> SessionDB: user_id reference
    
    style UserDB fill:#e1f5fe
    style ChatDB fill:#f3e5f5
    style SessionDB fill:#e8f5e8
```

### 7. API Request/Response Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant M as Middleware
    participant A as API Handler
    participant T as Turnstile
    participant D as Database
    participant AI as AI Service
    
    C->>A: POST /api/chat/generateTextStream
    A->>A: Parse request body
    A->>T: Verify Turnstile token
    T-->>A: Verification result
    
    alt Token invalid
        A->>C: 403 Security verification failed
    else Token valid
        A->>D: Check rate limits
        alt Rate limit exceeded
            A->>C: 429 Too many requests
        else Within limits
            A->>AI: Send chat request
            AI-->>A: Stream response chunks
            
            loop For each chunk
                A-->>C: Stream chunk to client
            end
            
            A->>D: Save chat record
            A->>C: End stream
        end
    end
```

### 8. Component Interaction Flow

```mermaid
graph TD
    subgraph "Server Components (SSR)"
        Page[PageComponent]
        SEO[SEOContent]
        Structured[StructuredData]
    end
    
    subgraph "Client Components (CSR)"
        Header[Header]
        Chat[ChatInterface]
        Turnstile[TurnstileWidget]
        Footer[Footer]
    end
    
    subgraph "Context & State"
        Context[CommonContext]
        LocalState[Component State]
    end
    
    Page --> SEO
    Page --> Structured
    Page --> Header
    Page --> Chat
    Page --> Footer
    
    Chat --> Turnstile
    Chat --> Context
    Header --> Context
    Footer --> Context
    
    Context --> LocalState
    
    style Page fill:#e3f2fd
    style Chat fill:#f3e5f5
    style Context fill:#e8f5e8
```

### 9. Internationalization Flow

```mermaid
flowchart TD
    UserVisit[User visits site] --> DetectLocale{Detect locale from URL}
    DetectLocale -->|/en or /| EnglishFlow[Load English content]
    DetectLocale -->|/zh| ChineseFlow[Load Chinese content]
    
    EnglishFlow --> LoadEnMessages[Load messages/en.json]
    ChineseFlow --> LoadZhMessages[Load messages/zh.json]
    
    LoadEnMessages --> ServerRender[Server-side rendering]
    LoadZhMessages --> ServerRender
    
    ServerRender --> GetTexts[getCommonText(), getIndexPageText()]
    GetTexts --> RenderComponents[Render components with localized text]
    RenderComponents --> ClientHydration[Client-side hydration]
    
    ClientHydration --> ContextProvider[CommonContext provides text]
    ContextProvider --> ComponentsUseText[Components use localized text]
    
    style EnglishFlow fill:#e3f2fd
    style ChineseFlow fill:#fff3e0
    style ServerRender fill:#e8f5e8
```

### 10. Error Handling Flow

```mermaid
flowchart TD
    Error[Error Occurs] --> ErrorType{Error Type}
    
    ErrorType -->|Network Error| NetworkHandler[Network Error Handler]
    ErrorType -->|Validation Error| ValidationHandler[Validation Error Handler]
    ErrorType -->|Auth Error| AuthHandler[Auth Error Handler]
    ErrorType -->|Rate Limit Error| RateLimitHandler[Rate Limit Error Handler]
    ErrorType -->|Server Error| ServerHandler[Server Error Handler]
    
    NetworkHandler --> ShowToast[Show error toast]
    ValidationHandler --> ShowInlineError[Show inline validation error]
    AuthHandler --> RedirectLogin[Redirect to login]
    RateLimitHandler --> ShowCooldown[Show cooldown message]
    ServerHandler --> ShowGenericError[Show generic error message]
    
    ShowToast --> LogError[Log error to console]
    ShowInlineError --> LogError
    RedirectLogin --> LogError
    ShowCooldown --> LogError
    ShowGenericError --> LogError
    
    LogError --> UserAction{User takes action?}
    UserAction -->|Retry| RetryOperation[Retry operation]
    UserAction -->|Dismiss| ResetState[Reset error state]
    
    RetryOperation --> Error
    ResetState --> NormalFlow[Return to normal flow]
    
    style Error fill:#ffebee
    style NormalFlow fill:#e8f5e8
```

### 11. Performance Optimization Flow

```mermaid
graph TD
    subgraph "Build Time"
        StaticGen[Static Generation]
        CodeSplit[Code Splitting]
        TreeShake[Tree Shaking]
        Minify[Minification]
    end
    
    subgraph "Runtime"
        SSR[Server-Side Rendering]
        Hydration[Client Hydration]
        LazyLoad[Lazy Loading]
        Caching[Response Caching]
    end
    
    subgraph "Client Side"
        ComponentMemo[Component Memoization]
        StateOpt[State Optimization]
        EventOpt[Event Optimization]
    end
    
    StaticGen --> SSR
    CodeSplit --> LazyLoad
    TreeShake --> ComponentMemo
    Minify --> Caching
    
    SSR --> Hydration
    Hydration --> StateOpt
    LazyLoad --> EventOpt
    
    style StaticGen fill:#e3f2fd
    style SSR fill:#f3e5f5
    style ComponentMemo fill:#e8f5e8
```

## 📊 Data Flow Summary

### Key Data Flows:
1. **User Input → AI Response**: Main chat functionality
2. **Authentication → Session**: User login and session management
3. **Security Verification → Request Processing**: Turnstile integration
4. **Localization → Content Rendering**: Multi-language support
5. **Error Handling → User Feedback**: Comprehensive error management

### Performance Considerations:
- Server-side rendering for SEO and initial load speed
- Client-side hydration for interactivity
- Streaming responses for real-time AI feedback
- Component memoization for re-render optimization
- Code splitting for reduced bundle sizes

These flow diagrams provide a comprehensive view of how the Vibe Coding platform operates, from high-level architecture to detailed component interactions.