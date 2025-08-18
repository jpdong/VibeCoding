import {parseOpenAIStream} from "~/utils/openai-handle";
import {parseOpenAIStreamWithUsage} from "~/utils/openai-handle-with-usage";
import {apiKey, baseUrl, model, temperature} from "~/configs/openaiConfig";
import {getModelById, getDefaultModel} from "~/configs/modelConfig";
import {getUserById} from "~/servers/user";
import {getDb} from "~/libs/db";
import {canUserUseService, incrementUsage} from "~/servers/usageTracking";
import * as process from "process";

const db = getDb();

export const maxDuration = 300;

async function verifyTurnstile(token: string): Promise<boolean> {
  try {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      console.error('Turnstile secret key not configured');
      return false;
    }

    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const verifyResult = await verifyResponse.json();
    return verifyResult.success;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

export async function POST(req: Request, res: Response) {
  const json = await req.json();
  const textStr = json.textStr;
  const user_id = json.user_id;
  const turnstileToken = json.turnstileToken;
  const modelId = json.modelId;
  console.log('textStr===>', textStr);
  console.log('modelId===>', modelId);

  // Get client IP for guest users
  const clientIP = req.headers.get('x-forwarded-for') || 
                   req.headers.get('x-real-ip') || 
                   'unknown';

  // Get selected model configuration
  const selectedModel = getModelById(modelId) || getDefaultModel();
  console.log('Selected model:', selectedModel);

  // Check if user can access premium models
  const { canUse, usageInfo } = await canUserUseService(user_id, clientIP);
  const userType = usageInfo.userType;
  
  if (selectedModel.isPremium && userType !== 'premium') {
    return new Response(JSON.stringify({
      error: "Premium model access requires subscription upgrade.",
      requiresUpgrade: true,
      modelId: selectedModel.id
    }), {
      status: 403,
      statusText: "Premium model access denied",
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Verify Turnstile token
  if (turnstileToken) {
    const isVerified = await verifyTurnstile(turnstileToken);
    if (!isVerified) {
      return new Response("Security verification failed.", {
        status: 403,
        statusText: "Security verification failed.",
      });
    }
  } else {
    return new Response("Security verification required.", {
      status: 403,
      statusText: "Security verification required.",
    });
  }

  // Check usage limits
  if (!canUse) {
    const errorMessage = user_id 
      ? `Daily limit reached. You've used ${usageInfo.used}/${usageInfo.limit} generations today.`
      : `Daily limit reached. You've used ${usageInfo.used}/${usageInfo.limit} generations today. Sign in for more!`;
    
    return new Response(JSON.stringify({
      error: errorMessage,
      usageInfo,
      requiresUpgrade: usageInfo.userType !== 'premium'
    }), {
      status: 429,
      statusText: "Usage limit exceeded",
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Legacy login check (keeping for compatibility)
  if (process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN != '0') {
    if (user_id) {
      // Check if user exists in database
      const resultsUser = await getUserById(user_id);
      if (resultsUser.email == '') {
        return new Response("Login to continue.", {
          status: 401,
          statusText: "Login to continue.",
        })
      }
      
      // Rate limiting: 30 seconds between requests
      const {rows: existListByUser} = await db.query('select created_at from chat_record where user_id=$1 order by created_at desc limit 1', [user_id]);
      if (existListByUser.length > 0) {
        const existTime = new Date(existListByUser[0].created_at).getTime();
        const currentTime = new Date().getTime();
        const resultTime = (currentTime - existTime)/1000;
        if (resultTime < 30) {
          return new Response("Requested too frequently!", {
            status: 429,
            statusText: "Requested too frequently!",
          })
        }
      }
    }
  }

  let body = {
    messages: [
      {
        role: 'user',
        content: textStr
      }
    ],
    model: selectedModel.name,
    temperature: selectedModel.temperature,
    stream: true
  }
  const apiEndpoint = process.env.OPENAI_API_BASE_URL;
  const modelApiKey = process.env.OPENAI_API_KEY

  const response = await fetch(`${apiEndpoint}/v1/chat/completions`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      "Content-Type": 'application/json',
      "authorization": `Bearer ${modelApiKey}`
    }
  });

  // 仅检查响应状态，用量统计将在流完成后自动处理
  if (!response.ok) {
    console.error('OpenAI API error:', response.status, response.statusText);
    return parseOpenAIStream(response);
  }

  // 使用带用量统计的流解析器
  return parseOpenAIStreamWithUsage(response, user_id, clientIP);
}
