interface StructuredDataProps {
  commonText: any;
  locale: string;
}

const StructuredData = ({ commonText, locale }: StructuredDataProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vibecoding.com';
  const currentUrl = locale === 'en' ? baseUrl : `${baseUrl}/${locale}`;

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Vibe Coding",
    "url": baseUrl,
    "logo": `${baseUrl}/website.svg`,
    "description": commonText.aboutDescription,
    "sameAs": []
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Vibe Coding",
    "url": currentUrl,
    "description": commonText.aboutDescription,
    "inLanguage": locale === 'zh' ? 'zh-CN' : 'en-US',
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${currentUrl}?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const softwareApplicationData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Vibe Coding",
    "description": commonText.aboutDescription,
    "url": currentUrl,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "creator": {
      "@type": "Organization",
      "name": "Vibe Coding"
    },
    "featureList": [
      commonText.feature1Title,
      commonText.feature2Title,
      commonText.feature3Title,
      commonText.feature4Title
    ],
    "screenshot": `${baseUrl}/website.svg`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1000"
    }
  };

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": commonText.faq1Question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": commonText.faq1Answer
        }
      },
      {
        "@type": "Question",
        "name": commonText.faq2Question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": commonText.faq2Answer
        }
      },
      {
        "@type": "Question",
        "name": commonText.faq3Question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": commonText.faq3Answer
        }
      },
      {
        "@type": "Question",
        "name": commonText.faq4Question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": commonText.faq4Answer
        }
      },
      {
        "@type": "Question",
        "name": commonText.faq5Question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": commonText.faq5Answer
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqData)
        }}
      />
    </>
  );
};

export default StructuredData;