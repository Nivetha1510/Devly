// Native stub. On web, certificatePdf.web.ts renders and downloads the PDF directly.
export async function saveHtmlAsPdf(_html: string, _fileName: string): Promise<void> {
  throw new Error('Direct PDF download is only used on web.');
}
