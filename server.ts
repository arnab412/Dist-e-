import express from "express";
import rateLimit from "express-rate-limit";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import firebaseConfig from "./firebase-applet-config.json";
import Parser from "rss-parser";

dotenv.config();

const rssParser = new Parser();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper function to map news titles, keywords, and categories to beautifully diverse Unsplash images
function getDiverseNewsImage(title: string, category: string, index: number): string {
  const lowercaseTitle = title ? title.toLowerCase() : "";
  
  // Custom Bengali as well as English Keyword matching for beautiful visual context
  if (
    lowercaseTitle.includes("কৃষক") || 
    lowercaseTitle.includes("বীজ") || 
    lowercaseTitle.includes("সার") || 
    lowercaseTitle.includes("কৃষি") || 
    lowercaseTitle.includes("farmer") || 
    lowercaseTitle.includes("crop") || 
    lowercaseTitle.includes("agriculture") ||
    lowercaseTitle.includes("সার ও বীজ")
  ) {
    return "https://images.unsplash.com/photo-1592997572594-34be01bc36c7?auto=format&fit=crop&w=800&q=80"; // Beautiful Indian Rural/Farming
  }
  
  if (
    lowercaseTitle.includes("বাংলারভূমি") || 
    lowercaseTitle.includes("মৌজা") || 
    lowercaseTitle.includes("খতিয়ান") || 
    lowercaseTitle.includes("ম্যাপ") || 
    lowercaseTitle.includes("land") || 
    lowercaseTitle.includes("record") || 
    lowercaseTitle.includes("mapping") ||
    lowercaseTitle.includes("খতিয়ান অনুসন্ধানের")
  ) {
    return "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"; // Land record search and mapping
  }

  if (
    lowercaseTitle.includes("কমপ্রেস") || 
    lowercaseTitle.includes("পিডিএফ") || 
    lowercaseTitle.includes("pdf") || 
    lowercaseTitle.includes("compress") || 
    lowercaseTitle.includes("ডকুমেন্ট") || 
    lowercaseTitle.includes("document") ||
    lowercaseTitle.includes("স্ক্যান করা")
  ) {
    return "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80"; // Office layout and neat documents
  }

  if (
    lowercaseTitle.includes("নিরাপত্তা") || 
    lowercaseTitle.includes("সিকিউরিটি") || 
    lowercaseTitle.includes("আধার") || 
    lowercaseTitle.includes("password") || 
    lowercaseTitle.includes("security") || 
    lowercaseTitle.includes("cyber") || 
    lowercaseTitle.includes("protect") ||
    lowercaseTitle.includes("সাইবার")
  ) {
    return "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80"; // Bright secure dashboard network
  }

  if (
    lowercaseTitle.includes("ইন্টারনেট") || 
    lowercaseTitle.includes("নেটওয়ার্ক") || 
    lowercaseTitle.includes("ব্রডব্যান্ড") || 
    lowercaseTitle.includes("internet") || 
    lowercaseTitle.includes("network") || 
    lowercaseTitle.includes("5g") || 
    lowercaseTitle.includes("wifi") ||
    lowercaseTitle.includes("সংযোগের গতি")
  ) {
    return "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80"; // High-tech internet setup / network infrastructure
  }

  if (
    lowercaseTitle.includes("ব্যবসা") || 
    lowercaseTitle.includes("স্টার্টআপ") || 
    lowercaseTitle.includes("খরচ") || 
    lowercaseTitle.includes("business") || 
    lowercaseTitle.includes("fintech") || 
    lowercaseTitle.includes("startup") ||
    lowercaseTitle.includes("উদ্যোগ")
  ) {
    return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"; // Bengali digital entrepreneurship / dashboard
  }

  if (
    lowercaseTitle.includes("কৃত্রিম বুদ্ধিমত্তা") || 
    lowercaseTitle.includes("কোডিং") || 
    lowercaseTitle.includes("ai") || 
    lowercaseTitle.includes("artificial intelligence") || 
    lowercaseTitle.includes("software") ||
    lowercaseTitle.includes("প্রভাব")
  ) {
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"; // Modern digital artwork
  }

  // Pre-selected distinct high-impact stock images based on position rotation
  const fallbackList = [
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80", // Modern tech social connectivity India
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80", // Tech workspace
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80", // Professional analysis
    "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=800&q=80", // Technical computing
    "https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=800&q=80", // Document archiving
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80"  // Standard office typing
  ];

  return fallbackList[index % fallbackList.length];
}

// Memory Cache for Gemini API calls to prevent exceeding the Google Gemini free tier quota (limit: 20 per day)
interface CacheEntry {
  timestamp: number;
  data: any[];
}
const newsCache: Record<string, CacheEntry> = {};
const CACHE_TTL = 1000 * 60 * 60; // Cache responses for 1 hour to preserve API quota
const API_COOLDOWN_TTL = 1000 * 60 * 15; // If API fails with 429 quota block, stop calling Gemini for 15 minutes and serve rich fallbacks
let lastApiFailedAt = 0;

interface FirestoreSettings {
  aiProvider: 'gemini' | 'groq' | 'openrouter';
  aiApiKey?: string;
  aiModel?: string;
}

let cachedSettings: FirestoreSettings | null = null;
let lastSettingsFetchTime = 0;
const SETTINGS_CACHE_TTL = 1000 * 5; // Direct cache Firestore settings for 5 seconds to reduce roundtrips but stay live

async function getGlobalSettings(): Promise<FirestoreSettings> {
  const now = Date.now();
  if (cachedSettings && (now - lastSettingsFetchTime < SETTINGS_CACHE_TTL)) {
    return cachedSettings;
  }

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/settings/global?key=${firebaseConfig.apiKey}`;
    console.log(`[Firestore Settings Fetching] URL: ${url}`);
    
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Failed to load global config: ${resp.status} ${resp.statusText}`);
    }
    const json = await resp.json();
    const fields = json.fields || {};

    const parseValue = (fieldVal: any): any => {
      if (!fieldVal) return undefined;
      if ('stringValue' in fieldVal) return fieldVal.stringValue;
      if ('integerValue' in fieldVal) return Number(fieldVal.integerValue);
      if ('doubleValue' in fieldVal) return Number(fieldVal.doubleValue);
      if ('booleanValue' in fieldVal) return fieldVal.booleanValue;
      return undefined;
    };

    const aiProvider = parseValue(fields.aiProvider) || 'gemini';
    const aiApiKey = parseValue(fields.aiApiKey) || '';
    const aiModel = parseValue(fields.aiModel) || 'gemini-2.5-flash';

    cachedSettings = { aiProvider, aiApiKey, aiModel };
    lastSettingsFetchTime = now;
    console.log("[Firestore Settings Parsed Successfully]", {
      aiProvider,
      aiModel,
      hasKey: !!aiApiKey,
      keyLength: aiApiKey ? aiApiKey.length : 0
    });
    return cachedSettings;
  } catch (err: any) {
    console.error("Failed to load settings from Firestore, returning defaults:", err.message || err);
    return { aiProvider: 'gemini', aiApiKey: '', aiModel: 'gemini-2.5-flash' };
  }
}

async function generateNewsWithCustomAPI(provider: 'groq' | 'openrouter', apiKey: string, model: string, queryTerm: string): Promise<any[]> {
  const isGroq = provider === 'groq';
  const apiUrl = isGroq 
    ? "https://api.groq.com/openai/v1/chat/completions" 
    : "https://openrouter.ai/api/v1/chat/completions";

  const defaultModel = isGroq ? "llama-3.3-70b-versatile" : "meta-llama/llama-3.3-70b-instruct";
  const selectedModel = model || defaultModel;

  const keyToUse = apiKey || (isGroq ? process.env.GROQ_API_KEY : process.env.OPENROUTER_API_KEY) || '';

  if (!keyToUse) {
    throw new Error(`API key is missing for provider: ${provider}. Please configure it in global settings.`);
  }

  // To comply with JSON mode ({ type: "json_object" }), we MUST ask for a JSON object with a specific root key rather than a top-level JSON array
  const prompt = `Generate a JSON object containing a key "articles" which is an array of 5-6 highly realistic news articles, technical tips, or announcements of interest to people in West Bengal, India.
The topics should relate directly to: "${queryTerm}".
All articles should have matching Bengali titles and summaries, realistic source names, and authentic-looking author names in Bengali.

CRITICAL INSTRUCTION: Since this software is proudly Indian, whenever you interact, analyze, or generate content (especially in Bengali), you MUST adopt the persona of an Indian assistant. Speak as an Indian (using Indian context, examples, and terminology like "জল" instead of "পানি") and NEVER as a Bangladeshi assistant.

Output EXACTLY as a single clean JSON object matching this structure:
{
  "articles": [
    {
      "sourceName": "Name of the news source or portal in Bengali (e.g., পশ্চিমবঙ্গ ডিজিটাল হাব, টেক বাংলা)",
      "author": "Reporter or author name inside West Bengal",
      "title": "Headline/Title of the news in Bengali",
      "description": "A detailed summary of the news details in Bengali",
      "url": "https://example.com/some-source-path",
      "publishedAt": "2026-05-26T12:00:00Z"
    }
  ]
}
Do NOT wrap the output in markdown code block formatting (such as \`\`\`json). Output pure unformatted raw JSON object text only.`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${keyToUse}`
  };

  if (!isGroq) {
    headers["HTTP-Referer"] = "https://ai.studio/build";
    headers["X-Title"] = "West Bengal Tech Portal Router";
  }

  const payload: any = {
    model: selectedModel,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  };

  // Enforce JSON Object structure aspect
  payload.response_format = { type: "json_object" };

  console.log(`[Custom Provider Details] Endpoint: ${apiUrl}, Model: ${selectedModel}, Provider: ${provider}, Key length: ${keyToUse.length}, StarPrefix: ${keyToUse.substring(0, 7)}...`);
  
  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Custom Provider Error] Status: ${response.status}`, errorText);
    throw new Error(`Custom API provider ${provider} failed with status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const choiceText = data?.choices?.[0]?.message?.content || "";
  
  let rawText = choiceText.trim();
  if (rawText.includes("```")) {
    rawText = rawText.replace(/```json\s*/i, "").replace(/```\s*/, "");
  }
  rawText = rawText.trim();

  console.log("[Custom Provider Choice Output]", rawText.substring(0, 200) + "...");
  
  const parsed = JSON.parse(rawText);
  let targetArray: any[] = [];
  
  // Clean structure if returned as a nested property or the array is directly under "articles"
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    if (Array.isArray(parsed.articles)) {
      targetArray = parsed.articles;
    } else {
      // Find any array key if "articles" is absent
      const keys = Object.keys(parsed);
      for (const k of keys) {
        if (Array.isArray(parsed[k])) {
          targetArray = parsed[k];
          break;
        }
      }
    }
  } else if (Array.isArray(parsed)) {
    targetArray = parsed;
  }

  if (!Array.isArray(targetArray) || targetArray.length === 0) {
    throw new Error("Invalid output format: Custom API reply did not parse into articles array.");
  }

  console.log(`[Custom Provider Success] Sliced array length: ${targetArray.length}`);
  return targetArray;
}

interface BlogGenerationRequest {
  topic: string;
  tone: string;
  language: string;
  length?: 'short' | 'medium' | 'long' | 'exhaustive';
}

async function generateBlogWithAI(
  provider: 'gemini' | 'groq' | 'openrouter', 
  apiKey: string, 
  model: string, 
  reqBody: BlogGenerationRequest
): Promise<{
  title: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  slug: string;
}> {
  const { topic, tone, language, length } = reqBody;
  
  let lengthRequirement = "";
  if (length === 'short') {
    lengthRequirement = "CRITICAL LENGTH & DEPTH TARGET: The 'content' field must be a short, concise guide of about 300 to 500 words. Keep sections brief and straight to the point.";
  } else if (length === 'medium') {
    lengthRequirement = "CRITICAL LENGTH & DEPTH TARGET: The 'content' field must be a moderately detailed, comprehensive post of about 600 to 900 words. Cover the main points with clear illustrative examples.";
  } else if (length === 'exhaustive') {
    lengthRequirement = "CRITICAL LENGTH & DEPTH TARGET: The 'content' field must be an absolute mega ultimate guide of about 1500 to 2500+ words. Provide fully fleshed-out details, backgrounds, deep technical explanations, best practices, and thorough breakdowns for every section.";
  } else {
    // Default: 'long'
    lengthRequirement = "CRITICAL LENGTH & DEPTH TARGET: The 'content' field MUST be a deep-dive long-form article consisting of at least 1000 to 1500+ words. Do NOT write a brief summary. Write extensive, authoritative paragraphs with high informational value.";
  }

  const prompt = `Write an extremely detailed, comprehensive, and exhaustive search-engine-optimized (SEO) blog post about: "${topic}".
Tone of writing: ${tone}.
Primary Language: ${language} (if set to Bengali, write content elegantly in high-scoring, grammatically perfect Bengali text).

CRITICAL INSTRUCTION: Since this software is proudly Indian, whenever you interact, analyze, or generate content (especially in Bengali), you MUST adopt the persona of an Indian assistant. Speak as an Indian (using Indian context, examples, and terminology like "জল" instead of "পানি") and NEVER as a Bangladeshi assistant.

${lengthRequirement}

The blog content should include:
1. An introduction that states the search intent and captures attention.
2. Multiple detailed sub-sections under appropriate H2 and H3 markdown heading tags.
3. Step-by-step instructions or lists where appropriate to make it actionable.
4. An illustrative explanation or practical examples.
5. A concluding section summarizing the take-aways.

You MUST write the response exactly as a JSON object matching this schema. Do NOT wrap the JSON output with markdown indicators (like \`\`\`json). Output raw, unformatted clean JSON text ONLY.
Schema:
{
  "title": "A highly catchy, search-optimized title/headline for the blog post (65 characters maximum, incorporating focus keywords naturally for maximum CTR)",
  "slug": "url-friendly-slug-in-english-only-lowercase-dash-separated (e.g., how-to-compress-pdfs)",
  "excerpt": "A short, engaging summary or excerpt of the blog for lists and cards (120-150 characters)",
  "content": "The actual complete deep-dive blog post in beautifully written GitHub-flavored Markdown. MUST COMPLY STRICTLY with the word limit specified above. Use headings H2 and H3, robust paragraphs, step-by-step guides, bullet points, and high-value instructions.",
  "seoTitle": "Optimized Page Title for Google (ideally 50-60 characters ending with ' | e-District WB')",
  "seoDescription": "A robust, click-worthy search engine Meta Description (under 160 characters)"
}`;

  if (provider === 'groq' || provider === 'openrouter') {
    const isGroq = provider === 'groq';
    const apiUrl = isGroq 
      ? "https://api.groq.com/openai/v1/chat/completions" 
      : "https://openrouter.ai/api/v1/chat/completions";

    const defaultModel = isGroq ? "llama-3.3-70b-versatile" : "meta-llama/llama-3.3-70b-instruct";
    const selectedModel = model || defaultModel;
    const keyToUse = apiKey || (isGroq ? process.env.GROQ_API_KEY : process.env.OPENROUTER_API_KEY) || '';

    if (!keyToUse) {
      throw new Error(`API key is missing for provider: ${provider}. Please configure it in global settings.`);
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${keyToUse}`
    };

    if (!isGroq) {
      headers["HTTP-Referer"] = "https://ai.studio/build";
      headers["X-Title"] = "West Bengal Tech Portal Router";
    }

    const payload: any = {
      model: selectedModel,
      messages: [{ role: "user", content: prompt }]
    };

    payload.response_format = { type: "json_object" };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Provider ${provider} failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    let rawText = (data?.choices?.[0]?.message?.content || "").trim();
    if (rawText.includes("```")) {
      rawText = rawText.replace(/```json\s*/i, "").replace(/```\s*/, "");
    }
    rawText = rawText.trim();
    return JSON.parse(rawText);
  } else {
    // defaults to Google Gemini
    const keyToUse = apiKey || process.env.GEMINI_API_KEY || '';
    const activeAi = apiKey ? new GoogleGenAI({ apiKey }) : ai;
    
    const response = await activeAi.models.generateContent({
      model: model || "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "slug", "excerpt", "content", "seoTitle", "seoDescription"],
          properties: {
            title: { type: Type.STRING },
            slug: { type: Type.STRING },
            excerpt: { type: Type.STRING },
            content: { type: Type.STRING },
            seoTitle: { type: Type.STRING },
            seoDescription: { type: Type.STRING }
          }
        }
      }
    });

    const textOutput = response.text || "{}";
    return JSON.parse(textOutput);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set("trust proxy", 1); // Trust first proxy (required for rate limiting behind Cloud Run/Nginx)
  
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { error: "অতিরিক্ত রিকোয়েস্ট করা হয়েছে, অনুগ্রহ করে ১৫ মিনিট পর আবার চেষ্টা করুন (Too many requests, please try again later)." }
  });

  app.use(express.json());
  
  // Apply rate limiter to API routes
  app.use("/api/", apiLimiter);

  // Dynamic Google/Bin SEO compliant XML Sitemap generator route
  app.get("/sitemap.xml", async (req, res) => {
    const host = req.get('host') || "localhost:3000";
    const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    let urls = [
      { loc: `${baseUrl}/`, changefreq: 'daily', priority: '1.0' },
      { loc: `${baseUrl}/blog`, changefreq: 'daily', priority: '0.8' },
      { loc: `${baseUrl}/news`, changefreq: 'daily', priority: '0.8' },
      { loc: `${baseUrl}/faq`, changefreq: 'monthly', priority: '0.4' },
    ];

    try {
      const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/posts?key=${firebaseConfig.apiKey}`;
      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        const documents = data.documents || [];
        for (const docObj of documents) {
          const fields = docObj.fields || {};
          const status = fields.status?.stringValue || 'draft';
          const slug = fields.slug?.stringValue || '';
          if (status === 'published' && slug) {
            urls.push({
              loc: `${baseUrl}/blog/${slug}`,
              changefreq: 'weekly',
              priority: '0.7'
            });
          }
        }
      }
    } catch (err: any) {
      console.error("Failed to query posts for sitemap.xml, using static defaults:", err.message || err);
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    for (const entry of urls) {
      xml += `  <url>\n`;
      xml += `    <loc>${entry.loc}</loc>\n`;
      xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
      xml += `    <priority>${entry.priority}</priority>\n`;
      xml += `  </url>\n`;
    }
    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  });

  // API endpoint for AI Blog Post Generation
  app.post("/api/generate-blog", async (req, res) => {
    try {
      const { topic, tone, language, length } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "Topic/prompt description is required" });
      }

      const activeSettings = await getGlobalSettings();
      const { aiProvider, aiApiKey, aiModel } = activeSettings;

      console.log(`[AI Blog Generator] Invoking provider: ${aiProvider} for topic: "${topic.substring(0, 40)}..." with length target: ${length || 'long'}`);
      
      const generated = await generateBlogWithAI(
        aiProvider || 'gemini',
        aiApiKey || '',
        aiModel || '',
        {
          topic,
          tone: tone || 'professional',
          language: language || 'Bengali',
          length: length || 'long'
        }
      );

      return res.json({ status: "ok", blog: generated });
    } catch (err: any) {
      console.error("[AI Blog Generation Failed]", err.message || err);
      return res.status(500).json({ error: err.message || "Failed to generate blog with the configured AI provider." });
    }
  });

  // API Route for News utilizing server-side Gemini 2.5 Flash / 3.5 Flash
  app.get("/api/news", async (req, res) => {
    const category = (req.query.category as string) || "technology";
    const search = ((req.query.search as string) || "").trim();
    const cacheKey = `${category}:${search.toLowerCase()}`;

    // Large diversified, rich pre-defined fallback news articles in Bengali, matched per category
    const serverFallbackArticles: Record<string, any[]> = {
      technology: [
        {
          sourceName: "Bengal Tech Desk",
          author: "অনন্যা ব্যানার্জী",
          title: "পশ্চিমবঙ্গ ই-ডিস্ট্রিক্ট পোর্টাল ২.০-এর নতুন সিকিউরিটি ফিচার চালু",
          description: "ডিজিটাল সিগনেচার ও অনলাইন সার্টিফিকেট ভেরিফিকেশনের জন্য ই-ডিস্ট্রিক্ট পোর্টালে যুক্ত হলো নতুন টু-ফ্যাক্টর অথেন্টিকেশন সিস্টেম। এর ফলে সাধারণ নাগরিকদের ডেটা থাকবে সম্পূর্ণ নিরাপদ।",
          url: "https://edistrict.wb.gov.in/welcome.portal",
          publishedAt: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          sourceName: "বাংলারভূমি ইনফো",
          author: "অভিষেক রায়",
          title: "বাংলারভূমি মানচিত্র ও খতিয়ান অনুসন্ধানের জন্য নতুন মোবাইল অ্যাপের আপডেট",
          description: "অ্যাপের মাধ্যমে আরও সহজে পিডিএফ ফরমেটে মৌজা ম্যাপ এবং খতিয়ান স্ট্যাটাস ডাউনলোড করা যাবে। সার্ভারের অতিরিক্ত ট্রাফিক প্রতিরোধে নতুন ক্যাшением পলিসি প্রয়োগ করা হয়েছে।",
          url: "https://banglarbhumi.gov.in",
          publishedAt: new Date(Date.now() - 3600000 * 12).toISOString()
        },
        {
          sourceName: "অফিস প্রো টিপস",
          author: "সায়ন গুপ্ত",
          title: "স্ক্যান করা পিডিএফ দ্রুত কমপ্রেস করার ৩টি সেরা আধুনিক উপায়",
          description: "সরকারি কাজের ক্ষেত্রে পিডিএফ ফাইলের সাইজ ২ এমবি-র কম রাখা বাধ্যতামূলক। জানুন কীভাবে রেজ্যুলেশন নষ্ট না করে ইমেজ থেকে পিডিএফ ফাইলের ওজন হ্রাস করবেন সহায়ক সফটওয়্যার দিয়ে।",
          url: "/",
          publishedAt: new Date(Date.now() - 3600000 * 24).toISOString()
        },
        {
          sourceName: "ডিজিটাল উইটনেস",
          author: "রূপক দত্ত",
          title: "ডিজিটাল সিগনেচার দিয়ে স্বয়ংক্রিয়ভাবে ইনভয়েস ও চুক্তিপত্র তৈরির আধুনিক উপায়",
          description: "নতুন ক্রেম এক্সটেনশনের মাধ্যমে যেকোনো ব্রাউজারে বসেই তাৎক্ষণিক পিডিএফ এডিট ও ডিজিটাল সিগনেচার যুক্ত করা সম্ভব হচ্ছে। যেকোনো ব্যবসার ক্ষেত্রে এটি বড় ধরনের কাগজি জটলা এড়াতে সাহায্য করছে।",
          url: "/",
          publishedAt: new Date(Date.now() - 3600000 * 36).toISOString()
        },
        {
          sourceName: "বাংলা পোর্টাল গাইড",
          author: "তনুশ্রী ঘোষ",
          title: "মোবাইল দিয়ে যেকোনো কাগজের ফর্ম স্ক্যান করে ই-ডিস্ট্রিক্ট কম্প্যাটিবল ফাইলে রূপান্তর করার ট্রিকস",
          description: "ক্যামেরা দিয়ে তুলে কীভাবে সঠিক কনট্রাস্ট রেঞ্জ বজায় রেখে জেপিইজি থেকে পিডিএফ এবং ফাইল সাইজিং নিখুঁত করবেন তার পূর্ণাঙ্গ নির্দেশাবলী জানুন এই রিডার সহায়িকায়।",
          url: "/",
          publishedAt: new Date(Date.now() - 3600000 * 48).toISOString()
        },
        {
          sourceName: "কলকাতা স্টার্টআপ নিউজ",
          author: "অভিষেক চ্যাটার্জী",
          title: "বাংলার নতুন প্রযুক্তি স্টার্টআপদের সহায়তায় বিশেষ ইনকিউবেশন ও অনুদান তহবিল ঘোষণা",
          description: "আইটি হাব সেক্টর ৫-এ রাজ্যের নতুন আইটি অ্যান্ড ইলেকট্রনিক্স ডিপার্টমেন্ট দ্বারা চালুকৃত গ্র্যান্ট স্কিমে অংশ নিতে ই-মেইলের মাধ্যমে সরাসরি প্রজেক্ট ড্রাফট জমা দেওয়ার আহ্বান জানানো হয়েছে।",
          url: "/",
          publishedAt: new Date(Date.now() - 3600000 * 72).toISOString()
        }
      ],
      general: [
        {
          sourceName: "প্রযুক্তি নিউজ ২৪",
          author: "রাজীব সেন",
          title: "গ্রামাঞ্চলে কমন সার্ভিস সেন্টার (CSC)গুলোতে ইন্টারনেট সংযোগের গতি দ্বিগুণ করার উদ্যোগ",
          description: "পশ্চিমবঙ্গের প্রায় প্রতিটি পঞ্চায়েতে অবস্থিত সিএসসিগুলোতে ব্রডব্যান্ড নেটওয়ার্ক উন্নয়নের মাধ্যমে ই-ডিস্ট্রিক্ট সেবা এবং অনলাইন খতিয়ান তোলার সময় উল্লেখযোগ্যভাবে হ্রাস পাবে।",
          url: "https://www.digitalindia.gov.in/",
          publishedAt: new Date(Date.now() - 3600000 * 4).toISOString()
        },
        {
          sourceName: "ডিজিটাল ইন্ডিয়া রিপোর্ট",
          author: "অনুপম সরকার",
          title: "আধার কার্ড ও ওটিপি ভেরিফিকেশনে নতুন নিয়মের সংযোজন",
          description: "ডিজিটাল সার্ভিস ব্যবহারে আধার লিঙ্কের মাধ্যমে তাৎক্ষণিক পিডিএফ ফাইল স্বাক্ষর সম্পন্ন করতে পারবেন। আইটি আইনের অধীনে সমস্ত সরকারি সাইটে এই সুবিধা যুক্ত হচ্ছে।",
          url: "https://uidai.gov.in/",
          publishedAt: new Date(Date.now() - 3600000 * 18).toISOString()
        },
        {
          sourceName: "ট্যাক্স গাইড ইন্ডিয়া",
          author: "প্রিয়াঙ্কা সেনগুপ্ত",
          title: "ভারত জুড়ে প্যান ডেটা পোর্টাল ২.০ চালুর মাধ্যমে সহজ হলো ব্যক্তিগত ট্যাক্স ফাইল সংশোধন",
          description: "প্যান কার্ড হোল্ডাররা এখন ঘরে বসেই ওটিপি ব্যবহার করে পিডিএফ ডকুমেন্ট অনলাইনে আপলোড করে ভুল নাম বা জন্মতারিখ সংশোধন করতে পারবেন। বাড়তি সার্ভিস চার্জ ছাড়াই এটি করা সম্ভব।",
          url: "/",
          publishedAt: new Date(Date.now() - 3600000 * 30).toISOString()
        },
        {
          sourceName: "ডিজিটাল বাংলার আলো",
          author: "সুদীপ্ত চৌধুরী",
          title: "ডিজিটাল আইডি কার্ড বা e-EPIC ডাউনলোড করার গাইড বুক ২০২৩-২০২৬",
          description: "ভোটার হিসেবে নিবন্ধিত যেকোনো নাগরিক ন্যাশনাল ভোটার সার্ভিস পোর্টাল থেকে সিকিউরড পিডিএফ ফরমেটে ইউনিকোড বারকোড সংবলিত ডিজিটাল কার্ডটি সহজে ডাউনলোড করতে পারবেন।",
          url: "/",
          publishedAt: new Date(Date.now() - 3600000 * 42).toISOString()
        },
        {
          sourceName: "কৃষক মিত্র বাংলা",
          author: "প্রসেনজিৎ ঘোষ",
          title: "কৃষকদের জন্য ই-ডিস্ট্রিক্ট পোর্টালে নতুন পরিষেবা: সার ও বীজের ভর্তুকি আবেদন",
          description: "কৃষকরা এখন জমি খতিয়ান পরচা স্ক্যান করে ই-ডিস্ট্রিক্ট অ্যাপের মাধ্যমে তাৎক্ষণিক সার ও উন্নত মানের বীজ বুকিং করতে পারবেন এবং সরকারি ভর্তুকির সুবিধা সরাসরি ব্যাংকে পাবেন।",
          url: "/",
          publishedAt: new Date(Date.now() - 3600000 * 56).toISOString()
        },
        {
          sourceName: "কেরিয়ার ফোরাম",
          author: "শেখর দত্ত",
          title: "যেকোনো সরকারি পরীক্ষা প্রস্তুতির জন্য অত্যন্ত দরকারী ৫টি বাংলা ডিজিটাল প্ল্যাটফর্ম",
          description: "অনলাইন ফ্রি মক টেস্ট দেওয়ার পাশাপাশি বিগত বছরের প্রশ্নপত্রের পিডিএফ এবং স্টাডি নোটস ডাউনলোডের সবচেয়ে সেরা রিসোর্সগুলো নিয়ে বিশেষ বিশ্লেষণমূলক তালিকা।",
          url: "/",
          publishedAt: new Date(Date.now() - 3600000 * 96).toISOString()
        }
      ],
      business: [
        {
          sourceName: "বাণিজ্য dukan",
          author: "কৌশিক চক্রবর্তী",
          title: "ডিজিটাল ডকুমেন্টেশন ও পেপারলেস ফাইলিংয়ের মাধ্যমে ক্ষুদ্র ব্যবসার খরচ হ্রাস",
          description: "কাগজ প্রিন্টিং ও ম্যানুয়াল স্টোরেজের বদলে ক্লাউড বেসড পিডিএফ আর্কাইভের কারণে ভারতীয় স্টার্টআপ ও ছোট ব্যবসায়ী মহলে খরচ কমেছে গড়ে ৩০ শতাংশ পর্যন্ত।",
          url: "/",
          publishedAt: new Date(Date.now() - 3600000 * 6).toISOString()
        },
        {
          sourceName: "বাংলার কারিগর নিউজ",
          author: "মিতালি বসু",
          title: "বাংলার ক্ষুদ্র হস্ত ও কুটির শিল্পীদের জন্য সহজে অনলাইন পেমেন্ট ও আন্তর্জাতিক শিপিং গেটওয়ে সংযোজন",
          description: "পশ্চিমবঙ্গ সরকারের সমবায় দপ্তরের সহায়তায় ছোট ব্যবসায়ীদের জন্য তৈরি হয়েছে বিশেষ পোর্টাল যেখানে ডিজিটাল পেপারওয়ার্ক সম্পন্ন করে পণ্য সরাসরি বিদেশে পাঠানো যাবে।",
          url: "/",
          publishedAt: new Date(Date.now() - 3600000 * 16).toISOString()
        },
        {
          sourceName: "ফিনটেক টুডে",
          author: "রনি সেনগুপ্ত",
          title: "নতুন ইউপিআই (UPI) লাইট ২.০: ইন্টারনেট সংযোগ ছাড়াই তাৎক্ষণিক পেমেন্ট সুবিধা",
          description: "কম ইন্টারনেট বা অফলাইন এরিয়াতেও কিউআর কোড স্ক্যান করে সর্বোচ্চ ৫০০ টাকা পর্যন্ত লেনদেন করার সুযোগ দিচ্ছে রির্জাভ ব্যাংক। প্রত্যন্ত পঞ্চায়েত অঞ্চলে এটি ব্যবহারের নিয়ম বিস্তারিত জানুন।",
          url: "/",
          publishedAt: new Date(Date.now() - 3600000 * 28).toISOString()
        },
        {
          sourceName: "MSME বাংলা নিউজ",
          author: "অর্ণব দত্ত",
          title: "ক্ষুদ্র ও মাঝারি শিল্প উদ্যোক্তাদের সহায়তায় বিশেষ রাজ্য ঋণ মেলা ২৫-২৬ মে",
          description: "জেলা স্তরে সিডবি ও রাষ্ট্রায়ত্ত ব্যাংকগুলোর মাধ্যমে পেপারলেস প্রোফাইল তৈরি করার ২৪ ঘণ্টার মধ্যে সিগনেচার আপলোড করে স্বল্প সুদে ৫ লক্ষ টাকা ঋণ মঞ্জুর করার সুযোগ।",
          url: "/",
          publishedAt: new Date(Date.now() - 3600000 * 44).toISOString()
        },
        {
          sourceName: "অফিস টেকনোলজি রিপোর্ট",
          author: "সুব্রত গাঙ্গুলি",
          title: "স্মার্ট পিডিএফ এডিটর ও সিগনেচার সফটওয়্যার যা আধুনিক অফিসের খরচ কমাবে",
          description: "দামী লাইসেন্স কেনা ছাড়াই অত্যন্ত সহজে সরকারি ও ব্যবসায়ীক ফর্মগুলোতে ফ্রি-তে নিখুঁত টাইপিং এবং এডিটিং সম্পন্ন করার একাধিক ফ্রি ওপেন সোর্স সলিউশন ব্যবহারের হ্যান্ডবুক।",
          url: "/",
          publishedAt: new Date(Date.now() - 3600000 * 64).toISOString()
        },
        {
          sourceName: "বাণিজ্যিক দর্পণ",
          author: "স্নিগ্ধা বোস",
          title: "ডিজিটাল ট্রান্সফরমেশন ২০২৬: করপোরেট ও আইটি সেক্টরে বাংলা ইউনিকোড ব্যবহারের নতুন সরকারি নির্দেশিকা",
          description: "অফিসিয়াল নথিপত্র এবং অনলাইন চ্যাটিং সিস্টেমে বাংলা ভাষাকে সহজভাবে ব্যবহার করতে ও সঠিক কিবোর্ড ফন্ট সেট করার জন্য বিশেষ ফ্রিতে ডাউনলোডযোগ্য হ্যান্ডবুক।",
          url: "/",
          publishedAt: new Date(Date.now() - 3600000 * 80).toISOString()
        }
      ]
    };

    // 1. Check if we have cached data for this key, and the cache is still valid
    if (newsCache[cacheKey]) {
      const isExpired = Date.now() - newsCache[cacheKey].timestamp > CACHE_TTL;
      if (!isExpired) {
        console.log(`[Cache Hit] Serving cached news for key: "${cacheKey}"`);
        return res.json({ status: "ok", articles: newsCache[cacheKey].data });
      }
    }

    // 2. Active safety valve for Cooldown (avoid calling API if it failed repeatedly recently)
    const isInCooldown = Date.now() - lastApiFailedAt < API_COOLDOWN_TTL;
    if (isInCooldown) {
      console.log(`[Cooldown Active] Serving elegant curated local fallback news for category "${category}"`);
      const fallbackList = serverFallbackArticles[category] || serverFallbackArticles['technology'];
      const formattedArticles = fallbackList.map((art: any, idx: number) => ({
        source: {
          id: art.sourceName ? art.sourceName.toLowerCase().replace(/\s+/g, '-') : 'news-desk',
          name: art.sourceName || 'Bengal News Desk'
        },
        author: art.author || 'স্টাফ রিপোর্টার',
        title: art.title,
        description: art.description,
        url: art.url || '#',
        urlToImage: getDiverseNewsImage(art.title, category, idx),
        publishedAt: art.publishedAt || new Date().toISOString()
      }));
      return res.json({ status: "ok", articles: formattedArticles });
    }

    try {
      const queryMap: Record<string, string> = {
        general: "West Bengal OR কলকাতা",
        technology: "প্রযুক্তি OR Technology",
        business: "ব্যবসা OR Business"
      };
      const rssQuery = search.trim() || queryMap[category] || "India";
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(rssQuery)}&hl=bn&gl=IN&ceid=IN:bn`;
      
      console.log(`[RSS Fetch] Fetching real news from: ${rssUrl}`);
      const feed = await rssParser.parseURL(rssUrl);
      
      const articles = feed.items.slice(0, 8).map((item: any, idx: number) => ({
        source: {
          id: item.creator ? item.creator.toLowerCase().replace(/\s+/g, '-') : 'news-desk',
          name: item.creator || item.source || feed.title || 'Bengal News Desk'
        },
        author: item.creator || 'স্টাফ রিপোর্টার',
        title: item.title,
        description: item.contentSnippet || item.content || 'বিস্তারিত খবর পোর্টালে পড়ুন',
        url: item.link || '#',
        urlToImage: getDiverseNewsImage(item.title || '', category, idx),
        publishedAt: item.isoDate || item.pubDate || new Date().toISOString()
      }));

      // Store successfully generated articles in cache
      newsCache[cacheKey] = {
        timestamp: Date.now(),
        data: articles
      };
      console.log(`[Cache Write] Cache written successfully for key: "${cacheKey}" with ${articles.length} RSS articles`);

      return res.json({ status: "ok", articles });
    } catch (error: any) {
      console.warn("Gemini generation failed or reached limits. Activating 15 minutes Cooldown to avoid 429 errors. Serving high-quality fallback news:", error.message || error);
      
      // Set failed timestamp to activate API cooldown
      lastApiFailedAt = Date.now();

      // Serve top high-quality pre-defined fallback news
      const fallbackList = serverFallbackArticles[category] || serverFallbackArticles['technology'];
      
      const formattedArticles = fallbackList.map((art: any, idx: number) => ({
        source: {
          id: art.sourceName ? art.sourceName.toLowerCase().replace(/\s+/g, '-') : 'news-desk',
          name: art.sourceName || 'Bengal News Desk'
        },
        author: art.author || 'স্টাফ রিপোর্টার',
        title: art.title,
        description: art.description,
        url: art.url || '#',
        urlToImage: getDiverseNewsImage(art.title, category, idx),
        publishedAt: art.publishedAt || new Date().toISOString()
      }));

      // Store fallback articles in cache to temporarily avoid any API attempts
      newsCache[cacheKey] = {
        timestamp: Date.now(),
        data: formattedArticles
      };

      return res.json({ status: "ok", articles: formattedArticles });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
