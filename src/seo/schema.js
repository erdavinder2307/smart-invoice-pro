import { SITE_CONFIG, toAbsoluteUrl } from './siteConfig';

export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_CONFIG.siteName,
  url: SITE_CONFIG.siteUrl,
  logo: toAbsoluteUrl('/logo512.png'),
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: 'admin@solidevelectrosoft.com',
      telephone: '+91-9115866828',
      areaServed: 'IN',
      availableLanguage: ['en']
    }
  ]
});

export const getWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_CONFIG.siteName,
  url: SITE_CONFIG.siteUrl,
  description: SITE_CONFIG.brandTitle
});

export const getSoftwareApplicationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_CONFIG.siteName,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'Workflow-driven financial operating system for quote-to-cash, automation, and operational visibility.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  url: SITE_CONFIG.siteUrl
});

export const getWebPageSchema = ({
  path,
  title,
  description,
  type = 'WebPage'
}) => ({
  '@context': 'https://schema.org',
  '@type': type,
  name: title,
  description,
  url: toAbsoluteUrl(path),
  isPartOf: {
    '@type': 'WebSite',
    name: SITE_CONFIG.siteName,
    url: SITE_CONFIG.siteUrl
  }
});

export const getFAQPageSchema = (faqs = []) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
});

export const getBreadcrumbSchema = (items = []) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: toAbsoluteUrl(item.path)
  }))
});
