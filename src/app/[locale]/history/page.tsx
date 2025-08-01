import PageComponent from "./PageComponent";
import {unstable_setRequestLocale} from 'next-intl/server';
import {getMyPageText} from "~/configs/languageText";

export const revalidate = 0;

export default async function MyPage({params: {locale = ''}}) {
  // Enable static rendering
  unstable_setRequestLocale(locale);

  const myText = await getMyPageText();

  return (
    <PageComponent
      locale={locale}
      myText={myText}
    />
  )
}
