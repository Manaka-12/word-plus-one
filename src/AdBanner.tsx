import { useEffect, useRef } from 'react';

const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;
const SLOT = import.meta.env.VITE_ADSENSE_SLOT as string | undefined;

/**
 * 画面最下部に表示する広告バナー（Google AdSense）。
 * 邪魔にならない高さ・配置。VITE_ADSENSE_CLIENT / VITE_ADSENSE_SLOT を設定すると表示。
 */
export function AdBanner() {
  const pushed = useRef(false);

  useEffect(() => {
    if (!CLIENT || !SLOT) return;

    if (!document.querySelector(`script[src*="adsbygoogle.js?client=${CLIENT}"]`)) {
      const s = document.createElement('script');
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`;
      s.async = true;
      s.crossOrigin = 'anonymous';
      document.head.appendChild(s);
    }

    if (!pushed.current) {
      pushed.current = true;
      try {
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
          (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || [];
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle.push({});
      } catch {
        // ignore
      }
    }
  }, []);

  if (CLIENT && SLOT) {
    return (
      <aside className="ad-banner" aria-label="広告">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={CLIENT}
          data-ad-slot={SLOT}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </aside>
    );
  }

  // デモ用プレースホルダー（AdSense 未設定時も広告枠の見た目を確認できる）
  return (
    <aside className="ad-banner ad-banner-demo" aria-label="広告（デモ）">
      <div className="ad-banner-placeholder">
        広告（デモ）
      </div>
    </aside>
  );
}
