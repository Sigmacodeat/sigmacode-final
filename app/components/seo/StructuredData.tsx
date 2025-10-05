export function StructuredData() {
  const data = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'SIGMACODE AI',
      url: '/',
      logo: '/og-image.svg',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'SIGMACODE AI – Firewall‑Powered Agents',
      image: ['/og-image.svg', '/logo/sigmaguard.svg'],
      description:
        'Firewall‑gesicherte AI‑Agenten & Workflows mit SIGMAGUARD (powered by Superagent), Orchestrierung, Audit‑Logs und Policy‑Durchsetzung.',
      brand: { '@type': 'Brand', name: 'SIGMACODE' },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'EUR',
        lowPrice: '0',
        highPrice: '299',
        offerCount: '3',
        offers: [
          {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'EUR',
            url: '/#pricing',
            name: 'Free',
          },
          {
            '@type': 'Offer',
            price: '99',
            priceCurrency: 'EUR',
            url: '/#pricing',
            name: 'Pro',
          },
          {
            '@type': 'Offer',
            price: '299',
            priceCurrency: 'EUR',
            url: '/#pricing',
            name: 'Business',
          },
        ],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SIGMACODE AI – Firewall‑Powered Agents',
      applicationCategory: 'AIApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
        { '@type': 'ListItem', position: 2, name: 'Agents', item: '/agents' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Firewall',
          item: '/firewall',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Workflows',
          item: '/workflows',
        },
        { '@type': 'ListItem', position: 5, name: 'MAS', item: '/mas' },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Was sind Firewall‑Powered Agents?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'AI‑Agenten, deren Ein‑ und Ausgaben durch SIGMAGUARD (powered by Superagent) vor‑ und nachgeprüft werden: Policy‑Checks, PII‑Filter, Rate‑Limits und Audit‑Logs.',
          },
        },
        {
          '@type': 'Question',
          name: 'Unterstützt ihr Multi‑Agent‑Workflows (MAS)?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ja, Orchestrierung mit SIGMACODE AI ermöglicht Rollen (Planner/Researcher/Executor) und Tool‑Aufrufe. Die Firewall bleibt als Wächter aktiv.',
          },
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'Workflow mit Firewall‑Policies bauen',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Vorfilter konfigurieren',
          text: 'PII/Toxicity Regeln wählen und aktivieren.',
        },
        {
          '@type': 'HowToStep',
          name: 'Workflow‑Steps anlegen',
          text: 'Prompts, Tools und Branching definieren.',
        },
        {
          '@type': 'HowToStep',
          name: 'Nachfilter aktivieren',
          text: 'Ausgaben prüfen, sensible Daten schwärzen.',
        },
      ],
    },
  ];

  return (
    <>
      {data.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
    </>
  );
}
