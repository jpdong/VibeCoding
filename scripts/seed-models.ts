import { db } from '../src/lib/db'

const models = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient for most coding tasks. Great for general programming questions and code explanations.',
    provider: 'openai',
    tier: 'free',
    available: true,
    sortOrder: 1,
    maxTokens: 4096,
    costPerToken: 0.0000015,
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Most capable model for complex coding problems. Excellent for architecture design and advanced debugging.',
    provider: 'openai',
    tier: 'premium',
    available: true,
    sortOrder: 2,
    maxTokens: 8192,
    costPerToken: 0.00003,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Latest GPT-4 with improved performance and larger context window. Best for complex projects.',
    provider: 'openai',
    tier: 'premium',
    available: true,
    sortOrder: 3,
    maxTokens: 128000,
    costPerToken: 0.00001,
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    description: 'Fast and lightweight Claude model. Perfect for quick code reviews and simple programming tasks.',
    provider: 'anthropic',
    tier: 'free',
    available: true,
    sortOrder: 4,
    maxTokens: 200000,
    costPerToken: 0.00000025,
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    description: 'Balanced Claude model for coding. Great for code analysis and medium complexity problems.',
    provider: 'anthropic',
    tier: 'premium',
    available: true,
    sortOrder: 5,
    maxTokens: 200000,
    costPerToken: 0.000003,
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    description: 'Most powerful Claude model. Exceptional for complex reasoning and advanced programming challenges.',
    provider: 'anthropic',
    tier: 'premium',
    available: true,
    sortOrder: 6,
    maxTokens: 200000,
    costPerToken: 0.000015,
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    description: 'Google\'s advanced AI model. Strong performance on coding and technical tasks.',
    provider: 'google',
    tier: 'premium',
    available: true,
    sortOrder: 7,
    maxTokens: 32768,
    costPerToken: 0.0000005,
  },
  {
    id: 'codellama-34b',
    name: 'Code Llama 34B',
    description: 'Specialized code generation model. Excellent for code completion and programming assistance.',
    provider: 'meta',
    tier: 'free',
    available: true,
    sortOrder: 8,
    maxTokens: 16384,
    costPerToken: 0.0000008,
  },
]

async function seedModels() {
  try {
    console.log('Starting model seeding...')

    for (const model of models) {
      try {
        await db.query(
          `INSERT INTO models (id, name, description, provider, tier, available, sort_order, max_tokens, cost_per_token)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             description = EXCLUDED.description,
             provider = EXCLUDED.provider,
             tier = EXCLUDED.tier,
             available = EXCLUDED.available,
             sort_order = EXCLUDED.sort_order,
             max_tokens = EXCLUDED.max_tokens,
             cost_per_token = EXCLUDED.cost_per_token,
             updated_at = NOW()`,
          [
            model.id,
            model.name,
            model.description,
            model.provider,
            model.tier,
            model.available,
            model.sortOrder,
            model.maxTokens,
            model.costPerToken,
          ]
        )
        console.log(`✓ Seeded model: ${model.name}`)
      } catch (error) {
        console.error(`✗ Failed to seed model ${model.name}:`, error)
      }
    }

    console.log('Model seeding completed!')
  } catch (error) {
    console.error('Model seeding failed:', error)
    process.exit(1)
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedModels()
    .then(() => {
      console.log('Seeding finished successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}

export { seedModels }