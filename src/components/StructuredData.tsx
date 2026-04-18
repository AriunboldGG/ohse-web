type StructuredDataProps = {
  data: object;
};

/**
 * Component to add structured data (JSON-LD) to pages
 * Used for SEO - helps search engines understand the content
 */
export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
