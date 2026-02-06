/**
 * HTML Parser utility for blog content
 * Extracts tags, links, images, and other elements from HTML content
 */

export interface TextSegment {
  text: string;
  styles?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    code?: boolean;
  };
}

export interface ParsedElement {
  type: 'text' | 'heading' | 'paragraph' | 'link' | 'image' | 'youtube' | 'tag' | 'formattedText';
  content: string;
  segments?: TextSegment[]; // for formatted text with inline formatting
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
    // Standard YouTube formats
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    // YouTube nocookie domain (privacy-enhanced mode)
    /(?:youtube-nocookie\.com\/embed\/)([^&\n?#]+)/,
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
  return /youtube\.com|youtu\.be|youtube-nocookie\.com/.test(url);
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
  
  const inlineFormattingTagNames = ['strong', 'b', 'em', 'i', 'u', 'code'];

  while (i < html.length && iterations < maxIterations) {
    iterations++;
    // Check for opening tags
    if (html[i] === '<') {
      const tagEnd = html.indexOf('>', i);
      if (tagEnd === -1) {
        currentText += html[i];
        i++;
        continue;
      }
      const tagContent = html.substring(i + 1, tagEnd);
      const tagMatch = tagContent.match(/^(\/?)(\w+)/);
      const isClosing = tagMatch?.[1] === '/';
      const tagName = tagMatch?.[2]?.toLowerCase();

      // Closing inline tag: add to currentText and do NOT flush, so "<u>quarter</u>" stays in one node
      if (tagMatch && isClosing && tagName && inlineFormattingTagNames.includes(tagName)) {
        currentText += html.substring(i, tagEnd + 1);
        i = tagEnd + 1;
        continue;
      }

      // Flush accumulated text before handling any other tag
      if (currentText.trim()) {
        const textWithYouTube = processTextForYouTube(currentText.trim());
        elements.push(...textWithYouTube);
        currentText = '';
      }

      if (tagMatch) {
        if (isClosing) {
          // Handle other closing tags (p, div, br)
          if (['p', 'div', 'br'].includes(tagName || '')) {
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
              
              // Regular link - parse inline formatting (e.g. <u>, <strong>) in link text so tags are not shown
              const linkContent = linkText || href;
              const linkSegments = parseInlineFormatting(linkContent);
              const strippedContent = linkSegments.map((s) => s.text).join('');
              elements.push({
                type: 'link',
                content: decodeHtmlEntities(strippedContent),
                href,
                ...(linkSegments.length > 0 ? { segments: linkSegments } : undefined),
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
          
          case 'iframe': {
            // Extract src attribute
            const srcMatch = tagContent.match(/src\s*=\s*["']([^"']+)["']/i);
            const src = srcMatch ? srcMatch[1] : '';
            
            // Check if it's a YouTube iframe
            if (src && isYouTubeUrl(src)) {
              const youtubeId = extractYouTubeId(src);
              if (youtubeId) {
                // Check if iframe is self-closing (ends with />)
                const isSelfClosing = tagContent.trim().endsWith('/') || html[tagEnd - 1] === '/';
                
                if (isSelfClosing) {
                  // Self-closing iframe
                  elements.push({
                    type: 'youtube',
                    content: '',
                    href: src,
                    youtubeId,
                  });
                  i = tagEnd + 1;
                  continue;
                } else {
                  // Iframe with closing tag
                  const closingTag = '</iframe>';
                  const closingIndex = html.indexOf(closingTag, tagEnd);
                  
                  elements.push({
                    type: 'youtube',
                    content: '',
                    href: src,
                    youtubeId,
                  });
                  
                  if (closingIndex !== -1) {
                    i = closingIndex + closingTag.length;
                  } else {
                    i = tagEnd + 1;
                  }
                  continue;
                }
              }
            }
            // If not YouTube, skip the iframe
            const isSelfClosing = tagContent.trim().endsWith('/') || html[tagEnd - 1] === '/';
            if (isSelfClosing) {
              i = tagEnd + 1;
            } else {
              const closingTag = '</iframe>';
              const closingIndex = html.indexOf(closingTag, tagEnd);
              if (closingIndex !== -1) {
                i = closingIndex + closingTag.length;
              } else {
                i = tagEnd + 1;
              }
            }
            continue;
          }
        }
        
        // Handle opening inline formatting tags - preserve in text for later parsing
        if (tagName && inlineFormattingTagNames.includes(tagName)) {
          currentText += html.substring(i, tagEnd + 1);
          i = tagEnd + 1;
          continue;
        }
      }
      
      // For unrecognized tags, skip them (don't add to text)
      i = tagEnd + 1;
    } else {
      currentText += html[i];
      i++;
    }
  }
  
  // Add any remaining text
  if (currentText.trim()) {
    // Check for YouTube URLs in plain text and split them
    const textWithYouTube = processTextForYouTube(currentText.trim());
    elements.push(...textWithYouTube);
  }
  
  // Process all text elements to parse inline formatting (strips tags like </strong> from display)
  return elements.map(element => {
    if (element.type === 'text' || element.type === 'heading') {
      const segments = parseInlineFormatting(element.content);
      // Always use segments so that any raw HTML tags in content are stripped and never shown
      if (segments.length > 0) {
        return {
          ...element,
          type: element.type === 'text' ? 'formattedText' : element.type,
          segments,
        };
      }
    }
    return element;
  });
}

/**
 * Parse inline formatting tags (strong, b, em, i, u, code) from text content
 */
function parseInlineFormatting(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let i = 0;
  let currentText = '';
  let currentStyles: TextSegment['styles'] = {};
  const styleStack: Array<TextSegment['styles']> = [{}];
  
  while (i < text.length) {
    if (text[i] === '<') {
      // Save current text if any
      if (currentText) {
        segments.push({
          text: decodeHtmlEntities(currentText),
          styles: { ...currentStyles },
        });
        currentText = '';
      }
      
      const tagEnd = text.indexOf('>', i);
      if (tagEnd === -1) {
        currentText += text[i];
        i++;
        continue;
      }
      
      const tagContent = text.substring(i + 1, tagEnd);
      const tagMatch = tagContent.match(/^(\/?)(\w+)/);
      
      if (tagMatch) {
        const isClosing = tagMatch[1] === '/';
        const tagName = tagMatch[2].toLowerCase();
        
        if (isClosing) {
          // Handle closing tags - pop style from stack
          if (['strong', 'b', 'em', 'i', 'u', 'code'].includes(tagName)) {
            styleStack.pop();
            currentStyles = styleStack[styleStack.length - 1] || {};
          }
        } else {
          // Handle opening tags - push style to stack
          if (['strong', 'b'].includes(tagName)) {
            currentStyles = { ...currentStyles, bold: true };
            styleStack.push(currentStyles);
          } else if (['em', 'i'].includes(tagName)) {
            currentStyles = { ...currentStyles, italic: true };
            styleStack.push(currentStyles);
          } else if (tagName === 'u') {
            currentStyles = { ...currentStyles, underline: true };
            styleStack.push(currentStyles);
          } else if (tagName === 'code') {
            currentStyles = { ...currentStyles, code: true };
            styleStack.push(currentStyles);
          }
        }
      }
      
      i = tagEnd + 1;
    } else {
      currentText += text[i];
      i++;
    }
  }
  
  // Add remaining text
  if (currentText) {
    segments.push({
      text: decodeHtmlEntities(currentText),
      styles: { ...currentStyles },
    });
  }
  
  // If no formatting was found, return single segment (strip any raw tags so they never show)
  if (segments.length === 0) {
    const decoded = decodeHtmlEntities(text).replace(/<[^>]*>/g, '');
    segments.push({
      text: decoded,
    });
  }
  
  return segments;
}

/**
 * Process text content to detect and extract YouTube URLs
 * Splits text around YouTube URLs and creates separate elements
 */
function processTextForYouTube(text: string): ParsedElement[] {
  const elements: ParsedElement[] = [];
  
  // Pattern to match YouTube URLs in various formats (including youtube-nocookie.com)
  const youtubePattern = /(https?:\/\/(?:www\.)?(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s]*)?)/gi;
  
  let lastIndex = 0;
  let match;
  
  while ((match = youtubePattern.exec(text)) !== null) {
    const url = match[0];
    const videoId = match[2];
    const matchIndex = match.index;
    
    // Add text before the YouTube URL
    if (matchIndex > lastIndex) {
      const textBefore = text.substring(lastIndex, matchIndex).trim();
      if (textBefore) {
        elements.push({
          type: 'text',
          content: textBefore,
        });
      }
    }
    
    // Add YouTube element
    if (videoId) {
      elements.push({
        type: 'youtube',
        content: url,
        href: url,
        youtubeId: videoId,
      });
    }
    
    lastIndex = matchIndex + url.length;
  }
  
  // Add remaining text after the last YouTube URL
  if (lastIndex < text.length) {
    const textAfter = text.substring(lastIndex).trim();
    if (textAfter) {
      elements.push({
        type: 'text',
        content: textAfter,
      });
    }
  }
  
  // If no YouTube URLs were found, return the text as-is
  if (elements.length === 0) {
    elements.push({
      type: 'text',
      content: text,
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

