import React from 'react';

// Simple, brand-neutral hero banner without external assets
// Uses a soft gradient background and accessible text.
export default function HeroBanner() {
  return (
    <div
      role="img"
      aria-label="Discover great food from nearby restaurants"
      style={{
        width: '100%',
        borderRadius: 8,
        padding: '32px 24px',
        background:
          'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(16,185,129,0.15) 100%)',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          aria-hidden
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
            boxShadow: '0 6px 18px rgba(16,185,129,0.35)',
          }}
        />
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>
            Order from your favorite spots
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#334155' }}>
            Explore top-rated restaurants near you. Fresh meals, swift delivery, simple checkout.
          </p>
        </div>
      </div>
    </div>
  );
}
