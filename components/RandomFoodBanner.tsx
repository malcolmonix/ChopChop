import React from 'react';

const foodImages = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
  'https://images.unsplash.com/photo-1516685018646-5499d0a7d42f',
  'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0',
  'https://images.unsplash.com/photo-1502741338009-cac2772e18bc',
  'https://images.unsplash.com/photo-1523987355523-c7b5b0723c6a',
];

function RandomFoodBanner() {
  // Render the same src on server and first client paint to avoid hydration mismatch,
  // then swap to a random image after mount.
  const [src, setSrc] = React.useState<string>(foodImages[0]);
  React.useEffect(() => {
    const next = foodImages[Math.floor(Math.random() * foodImages.length)];
    setSrc(next);
  }, []);

  return (
    <div style={{ width: '100%', marginBottom: '1rem' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Delicious food"
        style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.15)' }}
      />
    </div>
  );
}

export default React.memo(RandomFoodBanner);
