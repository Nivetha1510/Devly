import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import { Certificate, certificateFileName, certificateHtml } from '../data/practice';
import { saveHtmlAsPdf } from './certificatePdf';

// A4 landscape at 72 dpi.
const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;

export type DownloadResult = 'shared' | 'downloaded' | 'print-dialog';

// Native: renders the certificate to a PDF file and opens the share sheet (Save to Files, Drive, etc).
// Web: builds the PDF in the browser and downloads it straight away. If that fails, it falls back to
// opening the certificate in its own tab with the print dialog ("Save as PDF").
// (expo-print's web version would print the whole app page instead.)
export async function downloadCertificate(cert: Certificate): Promise<DownloadResult> {
  const html = certificateHtml(cert);
  const fileName = certificateFileName(cert.course_title);

  if (Platform.OS === 'web') {
    try {
      await saveHtmlAsPdf(html, fileName);
      return 'downloaded';
    } catch {
      // fall through to the print dialog
    }
    const win = window.open('', '_blank');
    if (!win) throw new Error('Your browser blocked the new tab. Allow pop-ups for this site and try again.');
    win.document.open();
    win.document.write(html);
    win.document.title = fileName.replace(/\.pdf$/, '');
    win.document.close();
    win.focus();
    // Give the new document a moment to lay out before printing.
    setTimeout(() => win.print(), 300);
    return 'print-dialog';
  }

  const { uri } = await Print.printToFileAsync({ html, width: PAGE_WIDTH, height: PAGE_HEIGHT });

  // Give the file a readable name where we can; otherwise share it under its generated name.
  let shareUri = uri;
  try {
    const named = new File(Paths.cache, fileName);
    if (named.exists) named.delete();
    await new File(uri).copy(named);
    shareUri = named.uri;
  } catch {
    shareUri = uri;
  }

  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device.');
  await Sharing.shareAsync(shareUri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Save or share your certificate' });
  return 'shared';
}
