'use client';

import React from 'react';

export default function DisableNeonCanvas() {
  return (
    <style jsx global>{`
      .neon-bg-canvas {
        display: none !important;
      }
    `}</style>
  );
}
