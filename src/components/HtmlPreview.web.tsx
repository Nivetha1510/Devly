import React, { createElement } from 'react';

// Live preview of the learner's HTML page (web), in a sandboxed iframe with no access to the app.
export default function HtmlPreview({ html }: { html: string }) {
  return createElement('iframe', {
    title: 'Page preview',
    sandbox: 'allow-scripts',
    srcDoc: html,
    style: { flex: 1, width: '100%', height: '100%', border: 0, backgroundColor: '#ffffff' },
  });
}
