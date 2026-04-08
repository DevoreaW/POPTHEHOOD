import React from 'react';

const F  = "'Open Sans', -apple-system, BlinkMacSystemFont, sans-serif";
const FC = F;

const LogoMark: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
    <img
      src="/icons/icon.svg"
      alt=""
      aria-hidden="true"
      style={{
        width: compact ? 34 : 40, height: compact ? 34 : 40,
        borderRadius: 10, flexShrink: 0,
        boxShadow: '0 4px 16px rgba(249,115,22,0.28)',
      }}
    />
    <div>
      <div style={{
        fontFamily: FC, fontWeight: 800,
        fontSize: compact ? 18 : 21,
        letterSpacing: '0.02em', textTransform: 'uppercase',
        color: '#fff', lineHeight: 1,
      }}>
        PopTheHood
      </div>
      <div style={{
        fontFamily: F, fontWeight: 600, fontSize: 9,
        color: '#f97316', letterSpacing: '0.18em',
        textTransform: 'uppercase', marginTop: 3,
        opacity: 0.75, whiteSpace: 'nowrap',
      }}>
        Diagnose Before You Dial
      </div>
    </div>
  </div>
);

export default LogoMark;
