'use client';

import { useEffect } from 'react';

export default function ApiDocsPage() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.SwaggerUIBundle) {
        // @ts-ignore
        window.SwaggerUIBundle({
          url: '/api/docs/openapi',
          dom_id: '#swagger-ui',
          presets: [
            // @ts-ignore
            window.SwaggerUIBundle.presets.apis,
          ],
          layout: 'BaseLayout',
          deepLinking: true,
        });
      }
    };

    document.body.appendChild(script);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css';
    document.head.appendChild(link);

    return () => {
      document.body.removeChild(script);
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>API Dokumentation</h1>
      <div id="swagger-ui" />
    </div>
  );
}
