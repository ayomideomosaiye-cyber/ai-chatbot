import React from 'react';

export default function FlagBadge({ code, size = 22 }) {
  const flags = {
    // Nigeria (Yoruba, Igbo, Hausa, Pidgin)
    yo: { bg: 'linear-gradient(90deg, #008751 33.3%, #ffffff 33.3%, #ffffff 66.6%, #008751 66.6%)', label: 'NG' },
    ig: { bg: 'linear-gradient(90deg, #008751 33.3%, #ffffff 33.3%, #ffffff 66.6%, #008751 66.6%)', label: 'NG' },
    ha: { bg: 'linear-gradient(90deg, #008751 33.3%, #ffffff 33.3%, #ffffff 66.6%, #008751 66.6%)', label: 'NG' },
    pcm: { bg: 'linear-gradient(90deg, #008751 33.3%, #ffffff 33.3%, #ffffff 66.6%, #008751 66.6%)', label: 'NG' },
    // USA (English)
    en: { bg: 'linear-gradient(135deg, #002868 40%, #bf0a30 40%, #bf0a30 70%, #ffffff 70%)', label: 'US' },
    // China
    zh: { bg: 'radial-gradient(circle at 30% 30%, #ffde00 20%, #de2910 21%)', label: 'CN' },
    // Spain
    es: { bg: 'linear-gradient(180deg, #aa151b 25%, #f1bf00 25%, #f1bf00 75%, #aa151b 75%)', label: 'ES' },
    // France
    fr: { bg: 'linear-gradient(90deg, #002395 33.3%, #ffffff 33.3%, #ffffff 66.6%, #ed2939 66.6%)', label: 'FR' },
    // Saudi Arabia (Arabic)
    ar: { bg: '#006c35', label: 'SA' },
    // India (Hindi)
    hi: { bg: 'linear-gradient(180deg, #ff9933 33.3%, #ffffff 33.3%, #ffffff 66.6%, #128807 66.6%)', label: 'IN' },
    // Brazil (Portuguese)
    pt: { bg: 'radial-gradient(circle, #002776 30%, #ffdf00 31%, #ffdf00 65%, #009c3b 66%)', label: 'BR' },
    // Japan
    ja: { bg: 'radial-gradient(circle at 50% 50%, #bc002d 40%, #ffffff 41%)', label: 'JP' },
    // Korea
    ko: { bg: 'radial-gradient(circle at 50% 50%, #cd2e3a 20%, #0047a0 21%, #0047a0 40%, #ffffff 41%)', label: 'KR' },
    // Germany
    de: { bg: 'linear-gradient(180deg, #000000 33.3%, #dd0000 33.3%, #dd0000 66.6%, #ffce00 66.6%)', label: 'DE' },
    // Kenya (Swahili)
    sw: { bg: 'linear-gradient(180deg, #000000 30%, #bb0000 30%, #bb0000 70%, #006600 70%)', label: 'KE' },
    // South Africa (Zulu)
    zu: { bg: 'linear-gradient(135deg, #007749 35%, #ffb81c 36%, #e03c31 70%, #001489 71%)', label: 'ZA' }
  };

  const item = flags[code] || { bg: 'var(--accent-gradient)', label: code.toUpperCase() };

  return (
    <span 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: item.bg,
        border: '1.5px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
        flexShrink: 0
      }}
      title={item.label}
    />
  );
}
