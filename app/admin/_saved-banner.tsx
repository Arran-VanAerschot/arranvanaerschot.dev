'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function SavedBanner() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.delete('saved');
      router.replace(url.pathname + (url.searchParams.size ? '?' + url.searchParams : ''), { scroll: false });
    }, 2500);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: '#1a3a1a', border: '1px solid #2d6a2d', borderRadius: 8,
      padding: '12px 20px', color: '#4ade80', fontSize: 13,
      fontFamily: 'ui-monospace, monospace',
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      animation: 'savedIn 0.2s ease',
    }}>
      ✓ saved
      <style>{`@keyframes savedIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  );
}
