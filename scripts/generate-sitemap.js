import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase Project & Database Info
const PROJECT_ID = "fit-replica-kcf5x";
const DATABASE_ID = "ai-studio-690929c4-1f9d-4ee9-b152-fda71c897143";
// Replace with the actual production domain where the app is hosted
const APP_URL = "https://districts-pdf-tools.web.app"; 

async function generateSitemap() {
  try {
    console.log("Fetching published blog posts from Firestore...");
    
    // Using the public Firestore REST API to query documents
    const endpoint = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents:runQuery`;
    
    const requestBody = {
      structuredQuery: {
        from: [{ collectionId: 'posts' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'status' },
            op: 'EQUAL',
            value: { stringValue: 'published' }
          }
        },
        select: {
          fields: [
            { fieldPath: 'slug' },
            { fieldPath: 'updatedAt' },
            { fieldPath: 'createdAt' }
          ]
        }
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    const results = await response.json();
    const posts = [];
    
    // Extract post data from the structuredQuery results
    if (Array.isArray(results)) {
        for (const item of results) {
            if (item.document && item.document.fields && item.document.fields.slug) {
                const slug = item.document.fields.slug.stringValue;
                const updatedAt = item.document.fields.updatedAt?.stringValue || item.document.fields.createdAt?.stringValue || new Date().toISOString();
                posts.push({ slug, updatedAt });
            }
        }
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // Static Routes
    const staticRoutes = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: '/dashboard', priority: '0.9', changefreq: 'daily' },
      { path: '/blog', priority: '0.9', changefreq: 'daily' },
      { path: '/faq', priority: '0.8', changefreq: 'weekly' }
    ];

    staticRoutes.forEach(route => {
      xml += `  <url>\n`;
      xml += `    <loc>${APP_URL}${route.path}</loc>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Dynamic Blog Post Routes
    posts.forEach(post => {
      xml += `  <url>\n`;
      xml += `    <loc>${APP_URL}/blog/${post.slug}</loc>\n`;
      xml += `    <lastmod>${post.updatedAt}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, xml);
    
    console.log(`✅ Sitemap generated at public/sitemap.xml with ${posts.length} dynamic posts.`);
  } catch (error) {
    console.error("❌ Error generating sitemap:", error);
    process.exit(1);
  }
}

generateSitemap();
