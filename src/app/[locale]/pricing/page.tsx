import { unstable_setRequestLocale } from 'next-intl/server';
import { getCommonText, getAuthText, getMenuText } from '~/configs/languageText';
import PricingPageComponent from './PricingPageComponent';

interface PricingPageProps {
  params: {
    locale: string;
  };
}

export default async function PricingPage({ params: { locale } }: PricingPageProps) {
  unstable_setRequestLocale(locale);

  const commonText = await getCommonText();
  const authText = await getAuthText();
  const menuText = await getMenuText();

  return (
    <PricingPageComponent
      locale={locale}
      commonText={commonText}
      authText={authText}
      menuText={menuText}
    />
  );
}