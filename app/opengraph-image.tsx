import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'N of One — Study yourself. Learn together.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '80px',
          backgroundColor: '#0A0A0A',
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          position: 'relative',
        }}
      >
        {/* Top-left accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 80,
            width: 120,
            height: 4,
            backgroundColor: '#EA580C',
          }}
        />

        {/* Brand mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '48px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: '#EA580C',
              fontSize: '28px',
              fontWeight: 800,
              color: '#0A0A0A',
              letterSpacing: '-1px',
            }}
          >
            N1
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 600,
              color: '#E5E7EB',
              letterSpacing: '-0.5px',
            }}
          >
            N of One
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 800,
            color: '#F9FAFB',
            lineHeight: 1.1,
            letterSpacing: '-2px',
            marginBottom: '24px',
            maxWidth: '800px',
          }}
        >
          Study yourself.{' '}
          <span style={{ color: '#EA580C' }}>Learn together.</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            color: '#9CA3AF',
            lineHeight: 1.5,
            maxWidth: '700px',
          }}
        >
          Design a clinical protocol. Collect your data. See what works for you.
        </div>

        {/* Bottom-right domain */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '80px',
            fontSize: '20px',
            color: '#4B5563',
            letterSpacing: '0.5px',
          }}
        >
          nofone.us
        </div>
      </div>
    ),
    { ...size }
  )
}
