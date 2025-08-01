import PageComponent from "./PageComponent";
import {unstable_setRequestLocale} from 'next-intl/server';
import {
  getChatPageText,
} from "~/configs/languageText";
import {getChatDetail} from "~/servers/chatRecord";
import {notFound} from "next/navigation";

export const dynamicParams = true
export const dynamic = 'error';

export default async function IndexPage({params: {locale = '', uid = ''}}) {
  // Enable static rendering
  unstable_setRequestLocale(locale);

  const chatText = await getChatPageText();

  const detail = await getChatDetail(locale, uid);
  if (detail.status == 404) {
    notFound();
  }

  return (
    <PageComponent
      locale={locale}
      uid={uid}
      detail={detail}
      chatText={chatText}
    />
  )
}
