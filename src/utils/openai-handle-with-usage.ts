import {createParser, ParsedEvent, ReconnectInterval} from "eventsource-parser";
import { incrementUsage, getUsageInfo } from "~/servers/usageTracking";

export const parseOpenAIStreamWithUsage = (rawResponse: Response, userId?: string, clientIP?: string) => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  
  if (!rawResponse.ok) {
    return new Response(rawResponse.body, {
      status: rawResponse.status,
      statusText: rawResponse.statusText,
    })
  }

  const stream = new ReadableStream({
    async start(controller) {
      let streamCompleted = false;
      
      const streamParser = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data
          
          if (data === '[DONE]') {
            handleStreamCompletion();
            return
          }
          
          if (JSON.parse(data)?.choices[0].finish_reason === 'stop') {
            handleStreamCompletion();
            return
          }
          
          try {
            const json = JSON.parse(data)
            const text = json.choices[0].delta?.content || ''
            const queue = encoder.encode(text)
            controller.enqueue(queue)
          } catch (e) {
            controller.error(e)
          }
        }
      }

      const handleStreamCompletion = async () => {
        if (streamCompleted) return;
        streamCompleted = true;
        
        try {
          // 增加用量统计
          await incrementUsage(userId, clientIP);
          console.log('Usage incremented successfully after stream completion');
          
          // 获取最新用量信息
          const updatedUsageInfo = await getUsageInfo(userId, clientIP);
          
          // 发送用量更新事件（作为流数据的一部分）
          const usageUpdateData = JSON.stringify({
            type: 'usage_update',
            usage: updatedUsageInfo
          });
          
          // 使用特殊标记包装用量数据，便于前端识别
          const usageMarker = `\n\n__USAGE_UPDATE__${usageUpdateData}__END_USAGE__\n\n`;
          controller.enqueue(encoder.encode(usageMarker));
        } catch (error) {
          console.error('Error updating usage after stream completion:', error);
        } finally {
          controller.close();
        }
      };

      const parser = createParser(streamParser)
      for await (const chunk of rawResponse.body as any) {
        parser.feed(decoder.decode(chunk))
      }
    },
  })

  return new Response(stream)
}