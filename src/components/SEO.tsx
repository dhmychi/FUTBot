import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: any;
  language?: 'en' | 'ar' | 'de' | 'fr' | 'nl';
  alternateLanguages?: Array<{hreflang: string; href: string}>;
}

export default function SEO({
  title = "FUTBot | FC26 Autobuyer & Sniper – Over 2M Coins Weekly",
  description = "FUTBot | FC26 - The fastest EA FC 26 autobuyer and sniping bot. Earn over 2M coins weekly with our advanced AI-powered trading system. Free trial available!",
  keywords = "FUTBot, FC26, EA FC 26, autobuyer, sniping bot, FIFA 26, Ultimate Team, trading bot, automated trading, FUT coins, EA Sports FC, FC 26 bot, sniping, autobuyer FC26, FIFA trading bot, coin farming, FUT sniping, EA FC autobuyer, FC26 sniping bot, free trial, 2M coins weekly",
  image = "https://futbot.club/wolf-logo.png",
  url = "https://futbot.club",
  type = "website",
  structuredData,
  language = "en",
  alternateLanguages = [
    { hreflang: "en", href: "https://futbot.club/" },
    { hreflang: "ar", href: "https://futbot.club/ar/" },
    { hreflang: "de", href: "https://futbot.club/de/" },
    { hreflang: "fr", href: "https://futbot.club/fr/" },
    { hreflang: "nl", href: "https://futbot.club/nl/" },
    { hreflang: "x-default", href: "https://futbot.club/" }
  ]
}: SEOProps) {
  const fullTitle = title.includes('FUTBot') ? title : `${title} | FUTBot`;
  const fullUrl = url.startsWith('http') ? url : `https://futbot.club${url}`;

  return (
    <Helmet>
      {/* Language and Hreflang */}
      <html lang={language} />
      {alternateLanguages.map((alt) => (
        <link key={alt.hreflang} rel="alternate" hrefLang={alt.hreflang} href={alt.href} />
      ))}
      
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="language" content={language === 'en' ? 'English' : language === 'ar' ? 'Arabic' : language === 'de' ? 'German' : language === 'fr' ? 'French' : 'Dutch'} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="FUTBot" />
      <meta property="og:locale" content={language === 'en' ? 'en_US' : language === 'ar' ? 'ar_SA' : language === 'de' ? 'de_DE' : language === 'fr' ? 'fr_FR' : 'nl_NL'} />
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:locale:alternate" content="ar_SA" />
      <meta property="og:locale:alternate" content="de_DE" />
      <meta property="og:locale:alternate" content="fr_FR" />
      <meta property="og:locale:alternate" content="nl_NL" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

// Predefined SEO configurations for different pages
export const SEOConfigs = {
  home: {
    title: "FUTBot | FC26 Autobuyer & Sniper – Over 2M Coins Weekly",
    description: "FUTBot | FC26 - The fastest EA FC 26 autobuyer and sniping bot. Earn over 2M coins weekly with our advanced AI-powered trading system. Free trial available!",
    keywords: "FUTBot, FC26, EA FC 26, autobuyer, sniping bot, FIFA 26, Ultimate Team, trading bot, automated trading, FUT coins, EA Sports FC, FC 26 bot, sniping, autobuyer FC26, FIFA trading bot, coin farming, FUT sniping, EA FC autobuyer, FC26 sniping bot, free trial, 2M coins weekly",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "FUTBot | FC26",
      "description": "The fastest EA FC 26 autobuyer and sniping bot. Earn over 2M coins weekly with our advanced AI-powered trading system.",
      "url": "https://futbot.club",
      "applicationCategory": "GameApplication",
      "operatingSystem": "Web Browser",
      "offers": [
        {
          "@type": "Offer",
          "name": "1 Month Subscription",
          "price": "15.00",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        {
          "@type": "Offer",
          "name": "3 Months Subscription",
          "price": "24.99",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        {
          "@type": "Offer",
          "name": "12 Months Subscription",
          "price": "49.99",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        }
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "5200"
      },
      "author": {
        "@type": "Organization",
        "name": "FUTBot Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "FUTBot",
        "logo": {
          "@type": "ImageObject",
          "url": "https://futbot.club/wolf-logo.png"
        }
      }
    }
  },
  
  terms: {
    title: "Terms of Service - FUTBot | FC26",
    description: "Terms and conditions for using FUTBot | FC26. Read our terms and conditions before using our services.",
    keywords: "terms of service, FUTBot, FC26, terms and conditions, usage policy",
    url: "/terms"
  },
  
  privacy: {
    title: "Privacy Policy - FUTBot | FC26",
    description: "FUTBot | FC26 privacy policy. Learn how we protect your data and privacy.",
    keywords: "privacy policy, FUTBot, FC26, data protection, privacy",
    url: "/privacy"
  },
  
  refund: {
    title: "Refund Policy - FUTBot | FC26",
    description: "FUTBot | FC26 refund policy. Learn about our refund terms and procedures.",
    keywords: "refund policy, FUTBot, FC26, money back guarantee, refund",
    url: "/refund"
  },
  
  register: {
    title: "Register - FUTBot | FC26",
    description: "Register with FUTBot | FC26 and get your subscription. Start your automated trading journey.",
    keywords: "register, FUTBot, FC26, subscription, automated trading",
    url: "/register"
  },
  
  notFound: {
    title: "Page Not Found - FUTBot | FC26",
    description: "The page you are looking for does not exist. Return to FUTBot | FC26 homepage.",
    keywords: "404, page not found, FUTBot, FC26",
    url: "/404"
  }
};