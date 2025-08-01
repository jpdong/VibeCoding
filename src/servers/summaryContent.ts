import {apiKey, baseUrl, model, temperature} from "~/configs/openaiConfig";
import {getLanguageByLang} from "~/config";

export const generateTitle = async (input_text, output_text, language) => {
  const languageObj = getLanguageByLang(language);
  let body = {
    messages: [
      {
        role: 'system',
        content: `你是一个文本总结专家，能够将下方文本总结成合适的标题，标题最多60个字符，并且总结为这个语言${languageObj.languageInChineseSimple}，输出结果不含任何解释，开头也不要输出类似于 Title 这种字符！`
      },
      {
        role: 'user',
        content: `内容的问题是: ${input_text}, 内容的答案是: ${output_text}`
      }
    ],
    model: model,
    temperature: temperature,
    stream: false
  }

  let summaryResult = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      "Content-Type": 'application/json',
      "authorization": `Bearer ${apiKey}`
    }
  })
    .then(v => v.json()).catch(err => console.log(err));

  // console.log('summaryResult-=->', summaryResult);
  let summaryResultText = input_text;
  try {
    if (summaryResult?.choices) {
      // console.log('summaryResult?.choices-=->', summaryResult?.choices);
      // console.log('summaryResult?.choices[0].message-=->', summaryResult?.choices[0]?.message);
      if (summaryResult?.choices[0]?.message?.content) {
        // console.log('summaryResult?.choices[0].message.content-=->', summaryResult?.choices[0]?.message?.content);
        summaryResultText = summaryResult?.choices[0]?.message?.content || '';
        // console.log('summaryResult-=-=-=->', summaryResult);
      }
      return summaryResultText;
    }
  } catch (e) {
    console.log(e);
  }
  return input_text;


}
