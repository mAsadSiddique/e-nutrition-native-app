/**
 * HTML Parser utility for blog content
 * Extracts tags, links, images, and other elements from HTML content
 */

export interface ParsedElement {
  type: 'text' | 'heading' | 'paragraph' | 'link' | 'image' | 'youtube' | 'tag';
  content: string;
  level?: number; // for headings (1-6)
  href?: string; // for links
  src?: string; // for images
  id?: string; // for image tags with IDs
  youtubeId?: string; // for YouTube videos
  tagName?: string; // for HTML tags
}

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Check if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url);
}

/**
 * Get YouTube thumbnail URL
 */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * Parse HTML content and extract elements
 */
export function parseHtmlContent(html: string, media?: any): ParsedElement[] {
  if (!html || typeof html !== 'string') return [];
  
  const elements: ParsedElement[] = [];
  let currentText = '';
  let i = 0;
  const maxIterations = html.length * 2; // Safety limit to prevent infinite loops
  let iterations = 0;
  
  // Build media map: key -> url
  // Map by: full key, last part after splitting by _, and all parts
  const mediaMap: Record<string, string> = {};
  if (media?.images && typeof media.images === 'object') {
    Object.keys(media.images).forEach((key) => {
      const url = media.images[key];
      // Map the full key
      mediaMap[key] = url;
      
      // Split by _ and map each part as potential ID
      const parts = key.split('_').filter(p => p.length > 0);
      if (parts.length > 0) {
        // Priority: Map the last part as ID (most common case - e.g., "image_123" -> id="123")
        const lastPart = parts[parts.length - 1];
        if (lastPart) {
          mediaMap[lastPart] = url;
        }
        
        // Also map all individual parts for flexibility
        parts.forEach((part) => {
          if (part && part !== lastPart) {
            // Only map if not already mapped (last part takes priority)
            if (!mediaMap[part]) {
              mediaMap[part] = url;
            }
          }
        });
      }
    });
  }
  
  while (i < html.length && iterations < maxIterations) {
    iterations++;
    // Check for opening tags
    if (html[i] === '<') {
      // Save any accumulated text
      if (currentText.trim()) {
        elements.push({
          type: 'text',
          content: currentText.trim(),
        });
        currentText = '';
      }
      
      const tagEnd = html.indexOf('>', i);
      if (tagEnd === -1) {
        currentText += html[i];
        i++;
        continue;
      }
      
      const tagContent = html.substring(i + 1, tagEnd);
      const tagMatch = tagContent.match(/^(\/?)(\w+)/);
      
      if (tagMatch) {
        const isClosing = tagMatch[1] === '/';
        const tagName = tagMatch[2].toLowerCase();
        
        if (isClosing) {
          // Handle closing tags
          if (['p', 'div', 'br'].includes(tagName)) {
            // Paragraph or div closing - add newline context
          }
          i = tagEnd + 1;
          continue;
        }
        
        // Handle opening tags
        switch (tagName) {
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6': {
            const level = parseInt(tagName[1]);
            const closingTag = `</${tagName}>`;
            const closingIndex = html.indexOf(closingTag, tagEnd);
            
            if (closingIndex !== -1) {
              const headingText = html.substring(tagEnd + 1, closingIndex);
              elements.push({
                type: 'heading',
                content: decodeHtmlEntities(headingText),
                level,
              });
              i = closingIndex + closingTag.length;
              continue;
            }
            break;
          }
          
          case 'p':
          case 'div': {
            const closingTag = `</${tagName}>`;
            const closingIndex = html.indexOf(closingTag, tagEnd);
            
            if (closingIndex !== -1) {
              const paraContent = html.substring(tagEnd + 1, closingIndex);
              // Parse nested content
              const nestedElements = parseHtmlContent(paraContent, media);
              elements.push(...nestedElements);
              i = closingIndex + closingTag.length;
              continue;
            }
            break;
          }
          
          case 'br': {
            // Handle both <br> and <br/>
            elements.push({
              type: 'text',
              content: '\n',
            });
            i = tagEnd + 1;
            continue;
          }
          
          case 'a': {
            // Extract href
            const hrefMatch = tagContent.match(/href=["']([^"']+)["']/);
            const href = hrefMatch ? hrefMatch[1] : '';
            
            const closingTag = '</a>';
            const closingIndex = html.indexOf(closingTag, tagEnd);
            
            if (closingIndex !== -1) {
              const linkText = html.substring(tagEnd + 1, closingIndex);
              
              // Check if it's a YouTube link
              if (isYouTubeUrl(href)) {
                const youtubeId = extractYouTubeId(href);
                if (youtubeId) {
                  elements.push({
                    type: 'youtube',
                    content: linkText || href,
                    href,
                    youtubeId,
                  });
                  i = closingIndex + closingTag.length;
                  continue;
                }
              }
              
              // Regular link
              elements.push({
                type: 'link',
                content: decodeHtmlEntities(linkText || href),
                href,
              });
              i = closingIndex + closingTag.length;
              continue;
            }
            break;
          }
          
          case 'img': {
            // Extract src and id - handle both single and double quotes
            const srcMatch = tagContent.match(/src\s*=\s*["']([^"']+)["']/i);
            const idMatch = tagContent.match(/id\s*=\s*["']([^"']+)["']/i);
            const src = srcMatch ? srcMatch[1] : '';
            const id = idMatch ? idMatch[1] : '';
            
            // Try to find image in media map by ID
            let imageUrl = src;
            
            // Priority 1: Match by exact ID from image tag (this is the main requirement)
            // The image tag has an id, and we match it with media keys split by "_"
            if (id && mediaMap[id]) {
              imageUrl = mediaMap[id];
            } 
            // Priority 2: If ID doesn't match directly, try to find in media keys
            // by checking if any media key's last part (after splitting by _) matches the ID
            else if (id && media?.images && typeof media.images === 'object') {
              // Check all media keys to see if any split part matches the ID
              for (const key of Object.keys(media.images)) {
                const parts = key.split('_').filter(p => p.length > 0);
                if (parts.includes(id)) {
                  imageUrl = media.images[key];
                  break;
                }
              }
            }
            // Priority 3: Try to extract ID from src attribute (if it's a placeholder)
            else if (src && !src.startsWith('http')) {
              // Check if src contains an ID pattern
              const srcIdMatch = src.match(/(\d+)/);
              if (srcIdMatch && mediaMap[srcIdMatch[1]]) {
                imageUrl = mediaMap[srcIdMatch[1]];
              }
            }
            
            // Only add image if we have a valid URL
            if (imageUrl) {
              elements.push({
                type: 'image',
                content: '',
                src: imageUrl,
                id: id || undefined,
              });
            }
            i = tagEnd + 1;
            continue;
          }
        }
      }
      
      i = tagEnd + 1;
    } else {
      currentText += html[i];
      i++;
    }
  }
  
  // Add any remaining text
  if (currentText.trim()) {
    elements.push({
      type: 'text',
      content: currentText.trim(),
    });
  }
  
  return elements;
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
}

/**
 * Extract all tags from HTML (like <p>, <h1>, etc.)
 */
export function extractTags(html: string): string[] {
  if (!html) return [];
  
  const tags = new Set<string>();
  const tagRegex = /<(\w+)[^>]*>/g;
  let match;
  
  while ((match = tagRegex.exec(html)) !== null) {
    const tagName = match[1].toLowerCase();
    if (!['html', 'head', 'body', 'script', 'style'].includes(tagName)) {
      tags.add(tagName);
    }
  }
  
  return Array.from(tags);
}

/**
 * Extract all links from HTML
 */
export function extractLinks(html: string): Array<{ text: string; href: string }> {
  if (!html) return [];
  
  const links: Array<{ text: string; href: string }> = [];
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const text = decodeHtmlEntities(match[2] || href);
    links.push({ text, href });
  }
  
  return links;
}

