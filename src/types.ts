export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string; // Markdown content
  excerpt: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  status: 'published' | 'draft';
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: string;
}

export interface Feedback {
  id: string;
  userId?: string;
  userEmail?: string;
  type: 'bug' | 'feature' | 'general';
  message: string;
  screenshotBase64?: string;
  createdAt: string;
  status: 'new' | 'reviewed' | 'resolved';
}
