import React from 'react';
import { WebView } from 'react-native-webview';

// Live preview of the learner's HTML page (phone). The page has no access to the app.
export default function HtmlPreview({ html }: { html: string }) {
  return (
    <WebView
      source={{ html }}
      originWhitelist={['*']}
      style={{ flex: 1, backgroundColor: '#ffffff' }}
      javaScriptEnabled
      accessibilityLabel="Page preview"
    />
  );
}
