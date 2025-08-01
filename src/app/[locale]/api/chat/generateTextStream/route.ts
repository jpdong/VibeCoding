import {parseOpenAIStream} from "~/utils/openai-handle";
import {apiKey, baseUrl, model, temperature} from "~/configs/openaiConfig";
import {getUserById} from "~/servers/user";
import {getDb} from "~/libs/db";
import * as process from "process";

const db = getDb();

export const maxDuration = 300;

export async function POST(req: Request, res: Response) {
  const json = await req.json();
  const textStr = json.textStr;
  const user_id = json.user_id;
  console.log('textStr===>', textStr);

  // 限制请求
  if (process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN != '0' && !user_id) {
    return new Response("Login to continue.", {
      status: 401,
      statusText: "Login to continue.",
    })
  }

  if (process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN != '0') {
    // 检查用户在数据库是否存在，不存在则返回需登录
    const resultsUser = await getUserById(user_id);
    if (resultsUser.email == '') {
      return new Response("Login to continue.", {
        status: 401,
        statusText: "Login to continue.",
      })
    }
    // 判断该用户上一次保存是否在 30 秒内，30 秒内的不允许再次提交
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

  let body = {
    messages: [
      {
        role: 'user',
        content: textStr
      }
    ],
    model: model,
    temperature: temperature,
    stream: true
  }

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      "Content-Type": 'application/json',
      "authorization": `Bearer ${apiKey}`
    }
  });

  return parseOpenAIStream(response);
}
