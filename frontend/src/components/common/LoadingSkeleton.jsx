import React from 'react';
import ContentLoader from 'react-content-loader';

export const StatsSkeleton = () => (
  <div className="stats-grid">
    {[1, 2, 3, 4].map((i) => (
      <ContentLoader
        key={i}
        speed={2}
        width={250}
        height={120}
        viewBox="0 0 250 120"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
      >
        <rect x="0" y="0" rx="10" ry="10" width="250" height="120" />
        <rect x="15" y="25" rx="5" ry="5" width="40" height="40" />
        <rect x="65" y="30" rx="5" ry="5" width="100" height="15" />
        <rect x="65" y="50" rx="5" ry="5" width="80" height="12" />
        <rect x="15" y="85" rx="5" ry="5" width="220" height="10" />
      </ContentLoader>
    ))}
  </div>
);

export const TableSkeleton = () => (
  <ContentLoader
    speed={2}
    width="100%"
    height={400}
    viewBox="0 0 1000 400"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
  >
    <rect x="0" y="0" rx="5" ry="5" width="1000" height="30" />
    {[1, 2, 3, 4, 5].map((i) => (
      <React.Fragment key={i}>
        <rect x="0" y={40 + (i * 50)} rx="5" ry="5" width="150" height="20" />
        <rect x="170" y={40 + (i * 50)} rx="5" ry="5" width="200" height="20" />
        <rect x="390" y={40 + (i * 50)} rx="5" ry="5" width="150" height="20" />
        <rect x="560" y={40 + (i * 50)} rx="5" ry="5" width="180" height="20" />
        <rect x="760" y={40 + (i * 50)} rx="5" ry="5" width="100" height="20" />
        <rect x="880" y={40 + (i * 50)} rx="5" ry="5" width="80" height="20" />
      </React.Fragment>
    ))}
  </ContentLoader>
);

export const ChartSkeleton = () => (
  <ContentLoader
    speed={2}
    width="100%"
    height={300}
    viewBox="0 0 600 300"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
  >
    <rect x="0" y="0" rx="5" ry="5" width="600" height="300" />
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <rect
        key={i}
        x={20 + (i * 90)}
        y={80 + Math.random() * 150}
        rx="3"
        ry="3"
        width="40"
        height={150 - (Math.random() * 100)}
      />
    ))}
    <rect x="20" y="280" rx="3" ry="3" width="560" height="3" />
  </ContentLoader>
);
