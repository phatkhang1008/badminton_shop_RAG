interface ProductRichTextProps {
  html: string;
  fallback: string;
}

/**
 * Product HTML is sanitized by the catalog API before it is persisted.
 * Keeping the rendering boundary here makes that contract explicit and
 * prevents pages from handling raw rich-text markup themselves.
 */
export function ProductRichText({ html, fallback }: ProductRichTextProps) {
  if (!html.trim()) return <p>{fallback}</p>;

  return <div className="store-rich-description" dangerouslySetInnerHTML={{ __html: html }} />;
}
