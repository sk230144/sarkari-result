/**
 * pdf-parse's published entry point (index.js) runs a debug block that
 * reads one of the package's own test fixtures whenever it's loaded via
 * ESM dynamic import — see the comment in src/lib/resume-text.ts. We import
 * its inner module directly instead, which has no ambient types of its own.
 */
declare module "pdf-parse/lib/pdf-parse.js" {
  import type { PDFData, Options } from "pdf-parse";

  function PdfParse(dataBuffer: Buffer, options?: Options): Promise<PDFData>;
  export default PdfParse;
}
