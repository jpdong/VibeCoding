import {apiKey, baseUrl, model} from "~/configs/openaiConfig";

export const temperature = 0.1
export const getLanguage = async (content) => {
  let body = {
    messages: [
      {
        role: 'system',
        content: `你是一个语言分析专家，能够直接识别文本是什么语言。`
      },
      {
        role: 'system',
        content: `如果是中文，需区分繁体中文和简体中文，繁体中文返回tw，简体中文返回zh。`
      },
      {
        role: 'system',
        content: `如果不是中文，返回对应语言的英文缩写。`
      },
      {
        role: 'system',
        content: `识别这段文字的语言，只返回语言的英文缩写，不含任何解释！`
      },
      {
        role: 'user',
        content: `需要识别的内容: ${content}`
      }
    ],
    model: model,
    temperature: temperature,
    stream: false
  }
  let languageResult = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      "Content-Type": 'application/json',
      "authorization": `Bearer ${apiKey}`
    }
  })
    .then(v => v.json()).catch(err => console.log(err));

  // console.log('languageResult-=->', languageResult);
  let langResultText = content;
  try {
    if (languageResult?.choices) {
      // console.log('languageResult?.choices-=->', languageResult?.choices);
      // console.log('languageResult?.choices[0].message-=->', languageResult?.choices[0]?.message);
      if (languageResult?.choices[0]?.message?.content) {
        // console.log('languageResult?.choices[0].message.content-=->', languageResult?.choices[0]?.message?.content);
        langResultText = languageResult?.choices[0]?.message?.content || '';
        // console.log('langResultText-=-=-=->', langResultText);
      }
      return langResultText;
    }
  } catch (e) {
    console.log(e);
  }
  return content;
}
