
// A4 landscape at 96 dpi (297mm x 210mm).
const PAGE_W = 1123;
const PAGE_H = 794;

// Renders the certificate HTML in a hidden frame, captures it and saves it as an A4 landscape PDF
// straight to the browser's downloads. Using the browser's own text rendering keeps any language
// in the learner's name intact.
export async function saveHtmlAsPdf(html: string, fileName: string): Promise<void> {
  // Loaded on demand: these libraries are large and only needed when a certificate is downloaded.
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${PAGE_W}px;height:${PAGE_H}px;border:0;`;
  document.body.appendChild(frame);

  try {
    await new Promise<void>((resolve) => {
      frame.onload = () => resolve();
      frame.srcdoc = html;
    });
    const doc = frame.contentDocument;
    const page = doc?.querySelector('.page') as HTMLElement | null;
    if (!doc || !page) throw new Error('Could not prepare the certificate.');
    // Make sure web fonts/system fonts are ready before capturing.
    if (doc.fonts?.ready) await doc.fonts.ready;

    const canvas = await html2canvas(page, { scale: 2, backgroundColor: '#ffffff', width: PAGE_W, height: PAGE_H, windowWidth: PAGE_W, windowHeight: PAGE_H });
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 297, 210);
    pdf.save(fileName);
  } finally {
    document.body.removeChild(frame);
  }
}
