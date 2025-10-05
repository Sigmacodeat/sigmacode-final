import { MarketingLandingPage } from '@/components/landing/MarketingLanding';

interface LocalePageProps {
  params: { locale: string };
}

export default function LocaleLandingPage({}: LocalePageProps) {
  return <MarketingLandingPage />;
}
