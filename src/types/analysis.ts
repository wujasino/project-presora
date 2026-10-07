export interface AnalysisResult {
  id: string;
  brandName: string;
  timestamp: string;
  trustScore: number;
  dimensions: {
    authority: number;
    sentiment: number;
    accuracy: number;
    mentions: number;
    recency: number;
  };
  sources: SourceResult[];
  sentimentTrend: { date: string; score: number }[];
  sourceBreakdown: { name: string; value: number; color: string }[];
  status: 'brewing' | 'completed' | 'failed';
}

export interface SourceResult {
  model: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  association: string;
  confidence: number;
}

export interface PricingTier {
  name: string;
  price: string;
  monthlyPrice?: string;
  yearlyPrice?: string;
  periodKey: string;
  descriptionKey: string;
  featureKeys: string[];
  highlighted?: boolean;
}
