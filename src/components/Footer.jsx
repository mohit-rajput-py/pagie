import Image from 'next/image'
import React from 'react'

const Footer = () => {
  return (
    <div
      style={{
        backgroundColor: '#faf9f6',   // bg-primary
        color: '#ffffff',             // text-background
        padding: '1rem 0',
      }}
    >
      <p
        style={{
          fontSize: '0.875rem',        // text-sm
          color: '#000',            // text-muted
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.25rem',
        }}
      >
        Built With
        ❤️
        Using
        <a
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center' }}
        >
          <Image
            src="/next.svg"
            alt="Next.js logo"
            width={46}
            height={28}
            style={{ marginLeft: '0.25rem' }}
          />
        </a>
      </p>
    </div>
  )
}

export default Footer
