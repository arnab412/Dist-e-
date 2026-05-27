import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  type?: string;
  pathname?: string;
  image?: string;
}

export function SEO({
  title = 'পিডিএফ টুলবক্স | সেরা ফ্রি পিডিএফ সরঞ্জাম',
  description = 'পিডিএফ ফাইল মার্জ (Merge), স্প্লিট (Split), সাইজ কমানো (Compress), এবং ডিজিটাল সিগনেচার ভেরিফাই করার নিরাপদ অনলাইন প্ল্যাটফর্ম। পিডিএফ টুলবক্স ব্যবহার করুন বিনামূল্যে।',
  type = 'website',
  pathname = '/',
  image = '/og-image.png',
}: SEOProps) {
  const siteUrl = window.location.origin;
  const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={`${siteUrl}${pathname}`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={`${siteUrl}${pathname}`} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={imageUrl} />
    </Helmet>
  );
}
