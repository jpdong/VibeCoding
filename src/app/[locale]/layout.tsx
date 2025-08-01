import clsx from 'clsx';
import {Inter} from 'next/font/google';
import {notFound} from 'next/navigation';
import {unstable_setRequestLocale} from 'next-intl/server';
import {ReactNode} from 'react';
import {locales} from '~/config';
import {CommonProvider} from '~/context/common-context';
import {NextAuthProvider} from '~/context/next-auth-context';
import {GoogleAnalytics} from '@next/third-parties/google'
import {getAuthText, getCommonText, getMenuText} from "~/configs/languageText";
import CookieConsent from "../../components/analytics/CookieConsent"
const inter = Inter({subsets: ['latin']});

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
                                             children,
                                             params: {locale}
                                           }: Props) {

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  // Enable static rendering
  unstable_setRequestLocale(locale);

  const commonText = await getCommonText();
  const authText = await getAuthText();
  const menuText = await getMenuText();

  return (
    <html lang={locale} dir={locale == 'ar' ? 'rtl' : 'ltr'}>
    {
      process.env.NEXT_PUBLIC_GOOGLE_OPEN != '0' ?
        <head>
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_TAG_ID}/>
        </head>
        :
        null
    }
    <head>
      <script src="https://accounts.google.com/gsi/client" async defer></script>
    </head>
    <body suppressHydrationWarning={true} className={clsx(inter.className, 'flex flex-col background-div')}>
    <NextAuthProvider>
      <CommonProvider
        commonText={commonText}
        authText={authText}
        menuText={menuText}
      >
        {children}
      </CommonProvider>
    </NextAuthProvider>
    <CookieConsent />
    </body>
    </html>
  );
}
