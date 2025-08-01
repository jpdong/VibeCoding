import {saveChatText} from "~/servers/chatRecord";

export async function POST(req: Request, res: Response) {
  const json = await req.json();

  const result = await saveChatText(json);

  return new Response(JSON.stringify(result), {
    headers: {"Content-Type": "application/json"},
    status: 200
  });
}
