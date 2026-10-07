import { Globe2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SeoAuditPanel } from '@/components/seo/SeoAuditPanel';
import { SeoTagGenerator } from '@/components/seo/SeoTagGenerator';

/**
 * /google-visibility — a second, complementary lens to /brand-visibility.
 * That page asks "what do AI models say about this brand"; this one asks
 * "is this page even set up to be found by Google in the first place" —
 * classic on-page SEO signals, not an AI-model opinion. No Google account
 * or API key involved on purpose: the audit reads the page itself, and the
 * generator just prepares tags for you to publish yourself.
 */
const GoogleVisibility = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Globe2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Google visibility</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Check whether a page is set up to be found and understood by Google, and
            generate the meta tags and structured data to fix what's missing. This
            looks at the page itself — no Google account or Search Console access
            needed.
          </p>
        </div>
      </div>

      <Tabs defaultValue="audit">
        <TabsList className="mb-5">
          <TabsTrigger value="audit">Audit a page</TabsTrigger>
          <TabsTrigger value="generate">Generate tags</TabsTrigger>
        </TabsList>
        <TabsContent value="audit">
          <SeoAuditPanel />
        </TabsContent>
        <TabsContent value="generate">
          <SeoTagGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoogleVisibility;
