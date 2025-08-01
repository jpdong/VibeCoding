export const getLinkHref = (locale = 'en', page = '') => {
  if (page == '') {
    if (locale == 'en') {
      return '/';
    }
    return `/${locale}/`;
  }
  if (locale == 'en') {
    return `/${page}`;
  }
  return `/${locale}/${page}`;
}
