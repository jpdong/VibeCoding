import {getTranslations} from "next-intl/server";

export const getIndexPageText = async () => {
  const tIndex = await getTranslations('IndexPageText');
  return {
    title: tIndex('title'),
    description: tIndex('description'),
    h1Text: tIndex('h1Text'),
    h2Text: tIndex('h2Text'),
    h2TextBegin: tIndex('h2TextBegin'),
    h2TextMiddle: tIndex('h2TextMiddle'),
    h2TextEnd: tIndex('h2TextEnd'),
    h2TextOrder: tIndex('h2TextOrder'),
  }
}

export const getCommonText = async () => {
  const tCommon = await getTranslations('CommonText');
  const tCommonAddition = await getTranslations('CommonTextAddition');
  return {
    loadingText: tCommon('loadingText'),
    placeholderText: tCommon('placeholderText'),
    buttonText: tCommon('buttonText'),
    footerDescText: tCommonAddition('footerDescText'),
    exploreMore: tCommonAddition('exploreMore'),
    contactTipBegin: tCommon('contactTipBegin'),
    contactTipEnd: tCommon('contactTipEnd'),
    createTextBegin: tCommonAddition('createTextBegin'),
    createTextEnd: tCommonAddition('createTextEnd'),
    getAnswerText: tCommonAddition('getAnswerText'),
    answerText: tCommonAddition('answerText'),
    chatQuestionText: tCommonAddition('chatQuestionText'),
    chatAnswerText: tCommonAddition('chatAnswerText'),
    inputTipText: tCommonAddition('inputTipText'),
    inputTipText2: tCommonAddition('inputTipText2'),
    securityVerificationText: tCommonAddition('securityVerificationText'),
    securityVerificationRequired: tCommonAddition('securityVerificationRequired'),
    securityVerificationFailed: tCommonAddition('securityVerificationFailed'),
    securityVerificationError: tCommonAddition('securityVerificationError'),
    aboutTitle: tCommonAddition('aboutTitle'),
    aboutDescription: tCommonAddition('aboutDescription'),
    featuresTitle: tCommonAddition('featuresTitle'),
    feature1Title: tCommonAddition('feature1Title'),
    feature1Description: tCommonAddition('feature1Description'),
    feature2Title: tCommonAddition('feature2Title'),
    feature2Description: tCommonAddition('feature2Description'),
    feature3Title: tCommonAddition('feature3Title'),
    feature3Description: tCommonAddition('feature3Description'),
    feature4Title: tCommonAddition('feature4Title'),
    feature4Description: tCommonAddition('feature4Description'),
    faqTitle: tCommonAddition('faqTitle'),
    faq1Question: tCommonAddition('faq1Question'),
    faq1Answer: tCommonAddition('faq1Answer'),
    faq2Question: tCommonAddition('faq2Question'),
    faq2Answer: tCommonAddition('faq2Answer'),
    faq3Question: tCommonAddition('faq3Question'),
    faq3Answer: tCommonAddition('faq3Answer'),
    faq4Question: tCommonAddition('faq4Question'),
    faq4Answer: tCommonAddition('faq4Answer'),
    faq5Question: tCommonAddition('faq5Question'),
    faq5Answer: tCommonAddition('faq5Answer'),
  }
}

export const getAuthText = async () => {
  const tAuth = await getTranslations('AuthText');
  return {
    loginText: tAuth('loginText'),
    loginModalDesc: tAuth('loginModalDesc'),
    loginModalButtonText: tAuth('loginModalButtonText'),
    logoutModalDesc: tAuth('logoutModalDesc'),
    confirmButtonText: tAuth('confirmButtonText'),
    cancelButtonText: tAuth('cancelButtonText'),
    toastConfirmText: tAuth('toastConfirmText'),
  }
}

export const getMenuText = async () => {
  const tMenu = await getTranslations('MenuText');
  return {
    header0: tMenu('header0'),
    header1: tMenu('header1'),
    footerLegal: tMenu('footerLegal'),
    footerLegal0: tMenu('footerLegal0'),
    footerLegal1: tMenu('footerLegal1')
  }
}


export const getPrivacyPolicyText = async () => {
  const tPrivacyPolicy = await getTranslations('PrivacyPolicyText');
  return {
    title: tPrivacyPolicy('title') + ' | ' + process.env.NEXT_PUBLIC_WEBSITE_NAME,
    description: tPrivacyPolicy('description'),
    h1Text: tPrivacyPolicy('h1Text'),
    detailText: tPrivacyPolicy('detailText'),
  }
}


export const getTermsOfServiceText = async () => {
  const tTermsOfService = await getTranslations('TermsOfServiceText');
  return {
    title: tTermsOfService('title') + ' | ' + process.env.NEXT_PUBLIC_WEBSITE_NAME,
    description: tTermsOfService('description'),
    h1Text: tTermsOfService('h1Text'),
    detailText: tTermsOfService('detailText'),
  }
}

export const getDiscoverPageText = async () => {
  const tDiscover = await getTranslations('DiscoverPageText');
  return {
    title: tDiscover('title'),
    description: tDiscover('description'),
    h1Text: tDiscover('h1Text'),
    h2Text: tDiscover('h2Text'),
  }
}

export const getMyPageText = async () => {
  const tMy = await getTranslations('MyPageText');
  return {
    title: tMy('title'),
    description: tMy('description'),
    h1Text: tMy('h1Text'),
    askNew: tMy('askNew'),
  }
}

export const getChatPageText = async () => {
  const tChat = await getTranslations('ChatPageText');
  return {
    description: tChat('description'),
    chatWithBegin: tChat('chatWithBegin'),
    chatWithMiddle: tChat('chatWithMiddle'),
    chatWithEnd: tChat('chatWithEnd'),
    chatWithOrder: tChat('chatWithOrder'),
  }
}
