import { notFound } from 'next/navigation';

export default function SitePage() {
  // Diese Seite sollte nie erreicht werden, da alle Unterrouten spezifische page.tsx haben
  notFound();
}
