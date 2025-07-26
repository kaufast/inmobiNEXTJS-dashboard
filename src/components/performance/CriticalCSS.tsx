/**
 * Critical CSS Inlining Component
 * Inlines critical CSS for above-the-fold content to improve Core Web Vitals
 */

import React from 'react';
import { Helmet } from 'react-helmet';

// Critical CSS styles for above-the-fold content
const CRITICAL_CSS = `
  /* Reset and base styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    -webkit-text-size-adjust: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    background-color: #ffffff;
    color: #1f2937;
    font-size: 16px;
    min-height: 100vh;
  }

  /* Layout containers */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .flex {
    display: flex;
  }

  .grid {
    display: grid;
  }

  /* Navigation styles */
  .navbar {
    background-color: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    position: sticky;
    top: 0;
    z-index: 50;
    height: 64px;
  }

  .navbar-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .logo {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    text-decoration: none;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .nav-link {
    color: #6b7280;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .nav-link:hover {
    color: #1f2937;
  }

  /* Hero section styles */
  .hero {
    padding: 4rem 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-align: center;
  }

  .hero-title {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 1rem;
    line-height: 1.2;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Search bar styles */
  .search-container {
    background-color: white;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    max-width: 800px;
    margin: 0 auto;
  }

  .search-form {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .search-input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
  }

  .search-input:focus {
    border-color: #667eea;
  }

  .search-button {
    background-color: #667eea;
    color: white;
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .search-button:hover {
    background-color: #5a67d8;
  }

  /* Property card styles */
  .property-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    padding: 2rem 0;
  }

  .property-card {
    background-color: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .property-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .property-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    background-color: #f3f4f6;
  }

  .property-content {
    padding: 1rem;
  }

  .property-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #1f2937;
  }

  .property-price {
    font-size: 1.5rem;
    font-weight: 700;
    color: #059669;
    margin-bottom: 0.5rem;
  }

  .property-details {
    display: flex;
    gap: 1rem;
    color: #6b7280;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .property-location {
    color: #6b7280;
    font-size: 0.875rem;
  }

  /* Button styles */
  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    text-align: center;
    transition: all 0.2s;
  }

  .btn-primary {
    background-color: #667eea;
    color: white;
  }

  .btn-primary:hover {
    background-color: #5a67d8;
  }

  .btn-secondary {
    background-color: #f3f4f6;
    color: #374151;
  }

  .btn-secondary:hover {
    background-color: #e5e7eb;
  }

  /* Loading states */
  .loading-spinner {
    width: 2rem;
    height: 2rem;
    border: 4px solid #f3f4f6;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .skeleton {
    background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .navbar-container {
      padding: 0 0.5rem;
    }
    
    .hero-title {
      font-size: 2rem;
    }
    
    .search-form {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .search-input,
    .search-button {
      width: 100%;
    }
    
    .property-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    
    .container {
      padding: 0 0.5rem;
    }
  }

  /* Focus styles for accessibility */
  .search-input:focus,
  .btn:focus,
  .nav-link:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }

  /* Print styles */
  @media print {
    .navbar,
    .search-container,
    .btn {
      display: none;
    }
    
    .hero {
      background: none;
      color: black;
    }
  }
`;

// Critical CSS for specific page types
const PAGE_SPECIFIC_CSS = {
  homepage: `
    .hero {
      min-height: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
    
    .featured-properties {
      padding: 4rem 0;
      background-color: #f9fafb;
    }
    
    .section-title {
      font-size: 2.5rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 3rem;
      color: #1f2937;
    }
  `,
  
  search: `
    .search-filters {
      background-color: white;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .filter-group {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .filter-select {
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background-color: white;
    }
    
    .results-count {
      color: #6b7280;
      margin-bottom: 1rem;
    }
  `,
  
  propertyDetails: `
    .property-header {
      padding: 2rem 0;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .property-gallery {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .main-image {
      width: 100%;
      height: 400px;
      object-fit: cover;
      border-radius: 8px;
    }
    
    .thumbnail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }
    
    .thumbnail {
      width: 100%;
      height: 95px;
      object-fit: cover;
      border-radius: 4px;
    }
    
    .property-info {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }
    
    .property-description {
      line-height: 1.8;
      color: #374151;
    }
    
    .contact-card {
      background-color: #f9fafb;
      padding: 1.5rem;
      border-radius: 8px;
      position: sticky;
      top: 100px;
    }
  `
};

interface CriticalCSSProps {
  pageType?: 'homepage' | 'search' | 'propertyDetails' | 'dashboard';
  additionalCSS?: string;
}

export function CriticalCSS({ pageType = 'homepage', additionalCSS }: CriticalCSSProps) {
  const pageSpecificCSS = PAGE_SPECIFIC_CSS[pageType] || '';
  const combinedCSS = `${CRITICAL_CSS}${pageSpecificCSS}${additionalCSS || ''}`;

  return (
    <Helmet>
      <style>{combinedCSS}</style>
    </Helmet>
  );
}

// Hook to load non-critical CSS asynchronously
export function useAsyncCSS(href: string) {
  React.useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print';
    link.onload = () => {
      link.media = 'all';
    };
    document.head.appendChild(link);

    return () => {
      const existingLink = document.querySelector(`link[href="${href}"]`);
      if (existingLink) {
        existingLink.remove();
      }
    };
  }, [href]);
}

// Font loading optimization
export function FontPreloader() {
  return (
    <Helmet>
      <link
        rel="preload"
        href="/fonts/inter-var.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <style>
        {`
          @font-face {
            font-family: 'Inter';
            font-style: normal;
            font-weight: 100 900;
            font-display: swap;
            src: url('/fonts/inter-var.woff2') format('woff2-variations');
            unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
          }
        `}
      </style>
    </Helmet>
  );
}

// Above-the-fold content optimizer
export function AboveTheFoldOptimizer({ children }: { children: React.ReactNode }) {
  return (
    <div className="above-the-fold" style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
}

// CSS-in-JS for runtime critical styles
export function useCriticalStyles() {
  const [criticalStyles, setCriticalStyles] = React.useState<string>('');

  const addCriticalStyle = (css: string) => {
    setCriticalStyles(prev => prev + css);
  };

  React.useEffect(() => {
    if (criticalStyles) {
      const style = document.createElement('style');
      style.textContent = criticalStyles;
      document.head.appendChild(style);

      return () => {
        style.remove();
      };
    }
  }, [criticalStyles]);

  return { addCriticalStyle };
}

// Performance-focused CSS loader
export function PerformantCSSLoader({ 
  href, 
  critical = false, 
  media = 'all' 
}: { 
  href: string; 
  critical?: boolean; 
  media?: string; 
}) {
  if (critical) {
    return (
      <Helmet>
        <link rel="stylesheet" href={href} media={media} />
      </Helmet>
    );
  }

  return (
    <Helmet>
      <link
        rel="preload"
        href={href}
        as="style"
        onLoad="this.onload=null;this.rel='stylesheet'"
      />
      <noscript>
        <link rel="stylesheet" href={href} />
      </noscript>
    </Helmet>
  );
}

export default CriticalCSS;