import { promises as fs } from 'fs';
import path from 'path';
import QuoteReviewPreview from './quote-review-preview';

async function loadStaticSvg() {
  const svgAbsolutePath = path.join(process.cwd(), 'app', 'svg1.svg');

  try {
    return await fs.readFile(svgAbsolutePath, 'utf8');
  } catch (error) {
    console.error('Unable to read quote review SVG:', error);
    return null;
  }
}

export default async function QuoteReviewPage() {
  const svgMarkup = await loadStaticSvg();
  return (
    <QuoteReviewPreview svgMarkup={svgMarkup ?? undefined} />
  );
}
