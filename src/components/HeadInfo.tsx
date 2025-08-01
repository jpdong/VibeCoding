import {getLanguageByLang, langCode, languages, languagesEn} from "~/config";
import {Fragment} from "react";

const HeadInfo = ({
                    locale,
                    page,
                    title,
                    description,
                    languageList = languages,
                    isChatDetail = false,
                    chatDetail = {language: ""}
                  }) => {

  const languageListResult = process.env.NEXT_PUBLIC_SHOW_LANGUAGE != '0' ? languageList : languagesEn;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description}/>
      {
        !isChatDetail && languageListResult.map((item) => {
          const currentPage = page;
          let hrefLang = item.code;

          if (item.lang == 'en') {
            if (currentPage) {
              const href = `${process.env.NEXT_PUBLIC_SITE_URL}/${currentPage}`;
              return <Fragment key={href + 0}>
                  <link rel="alternate" hrefLang={'x-default'} href={href}/>
                  <link rel="alternate" hrefLang={hrefLang} href={href}/>
              </Fragment>
            } else {
              const href = `${process.env.NEXT_PUBLIC_SITE_URL}/`;
              return <Fragment key={href + 1}>
                <link rel="alternate" hrefLang={'x-default'} href={href}/>
                <link rel="alternate" hrefLang={hrefLang} href={href}/>
              </Fragment>
            }
          } else {
            if (currentPage) {
              const href = `${process.env.NEXT_PUBLIC_SITE_URL}/${item.lang}/${currentPage}`;
              return <link key={href + 2} rel="alternate" hrefLang={hrefLang} href={href}/>
            } else {
              const href = `${process.env.NEXT_PUBLIC_SITE_URL}/${item.lang}`;
              return <link key={href + 3} rel="alternate" hrefLang={hrefLang} href={href}/>
            }
          }
        })
      }
      {
        !isChatDetail && languageListResult.map((item) => {
          const currentPage = page;
          let hrefLang = item.code;
          let href: string;
          if (currentPage) {
            href = `${process.env.NEXT_PUBLIC_SITE_URL}/${item.lang}/${currentPage}`;
            if (item.lang == 'en') {
              href = `${process.env.NEXT_PUBLIC_SITE_URL}/${currentPage}`;
            }
          } else {
            href = `${process.env.NEXT_PUBLIC_SITE_URL}/${item.lang}`;
            if (item.lang == 'en') {
              href = `${process.env.NEXT_PUBLIC_SITE_URL}/`;
            }
          }
          if (locale == item.lang) {
            return <link key={href + 'canonical'} rel="canonical" hrefLang={hrefLang} href={href}>
          }
        })
      }

      {
        isChatDetail ?
          chatDetail.language == 'en' ?
            <>
              <link rel="alternate" hrefLang={'x-default'} href={`${process.env.NEXT_PUBLIC_SITE_URL}/${page}`}/>
              <link rel="alternate" hrefLang={'en-US'} href={`${process.env.NEXT_PUBLIC_SITE_URL}/${page}`}/>
            </>
            :
            langCode.indexOf(chatDetail.language) == -1 ?
              <>
                <link rel="alternate" hrefLang={'x-default'} href={`${process.env.NEXT_PUBLIC_SITE_URL}/${page}`}/>
                <link rel="alternate" hrefLang={'en-US'} href={`${process.env.NEXT_PUBLIC_SITE_URL}/${page}`}/>
              </>
              :
              <>
                <link rel="alternate" hrefLang={'x-default'} href={`${process.env.NEXT_PUBLIC_SITE_URL}/${chatDetail.language}/${page}`}/>
                <link rel="alternate" hrefLang={getLanguageByLang(chatDetail.language).code} href={`${process.env.NEXT_PUBLIC_SITE_URL}/${chatDetail.language}/${page}`}/>
              </>
          :
          null
      }
      {
        isChatDetail ?
          chatDetail.language == 'en' ?
            <link rel="canonical" hrefLang={'en-US'} href={`${process.env.NEXT_PUBLIC_SITE_URL}/${page}`}/>
            :
            langCode.indexOf(chatDetail.language) == -1 ?
              <link rel="canonical" hrefLang={'en-US'} href={`${process.env.NEXT_PUBLIC_SITE_URL}/${page}`}/>
              :
              <link rel="canonical" hrefLang={getLanguageByLang(chatDetail.language).code} href={`${process.env.NEXT_PUBLIC_SITE_URL}/${chatDetail.language}/${page}`}/>
          :
          null
      }
    </>
  )
}

export default HeadInfo
