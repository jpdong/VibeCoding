import PageComponent from "./PageComponent";
import {unstable_setRequestLocale} from 'next-intl/server';
import {
  getDiscoverPageText,
} from "~/configs/languageText";
import {getPublicResultList, getPagination} from "~/servers/chatRecord";
import {notFound} from "next/navigation";

export const revalidate = 0;

export default async function IndexPage({params: {locale = '', page = 2}}) {
  // Enable static rendering
  unstable_setRequestLocale(locale);

  const discoverPageText = await getDiscoverPageText();

  if (page == 0) {
    page = 1;
  }

  // 获取分页数据
  const resultInfoData = await getPublicResultList(locale, page);
  const pageData = await getPagination(locale, page);

  if (page > pageData.totalPage) {
    notFound();
  }

  return (
    <PageComponent
      locale={locale}
      discoverPageText={discoverPageText}
      resultInfoData={resultInfoData}
      page={page}
      pageData={pageData}
    />
  )
}
