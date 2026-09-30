import React from 'react';
import { marked } from 'marked';

marked.setOptions({
  breaks: true,
  gfm: true
});

export default function MarkdownRenderer({ content }) {
  const handleCopy = (e) => {
    if (e.target.classList.contains('code-copy-btn')) {
      const pre = e.target.closest('pre') || e.target.nextElementSibling;
      const codeBlock = pre?.querySelector('code') || pre;
      
      if (codeBlock) {
        navigator.clipboard.writeText(codeBlock.innerText);
        const originalText = e.target.innerText;
        e.target.innerText = 'Copied!';
        setTimeout(() => {
          e.target.innerText = originalText;
        }, 2000);
      }
    }
  };

  const htmlContent = marked.parse(content || '');

  return (
    <div 
      className="markdown-content" 
      onClick={handleCopy}
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
}
