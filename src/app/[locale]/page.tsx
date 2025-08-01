import PageComponent from "./PageComponent";
import {unstable_setRequestLocale} from 'next-intl/server';

import {
  getIndexPageText,
} from "~/configs/languageText";

import {getLatestChatResultList} from "~/servers/chatRecord";

export const revalidate = 300;
export default async function IndexPage({params: {locale = ''}}) {
  // Enable static rendering
  unstable_setRequestLocale(locale);

  const indexText = await getIndexPageText();

  const resultInfoListInit = await getLatestChatResultList(locale);

  return (
    <PageComponent
      locale={locale}
      indexText={indexText}
      resultInfoListInit={resultInfoListInit}
    />
  )
}
