import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WebMetricsD3 } from "@/components/visualizations/WebMetricsD3";
import { WebMetricsP5 } from "@/components/visualizations/WebMetricsP5";
import { WebMetricsHighcharts } from "@/components/visualizations/WebMetricsHighcharts";

interface MetricsDisplayProps {
  metrics: Array<{ metric: string; value: string }>;
}

export const MetricsDisplay = ({ metrics }: MetricsDisplayProps) => {
  const getMetricsByCategory = () => {
    const categories = {
      Performance: ["Page Load Time", "Page Size", "Images Count", "Largest Contentful Paint", "First Input Delay", "Cumulative Layout Shift"],
      "Basic SEO": ["Mobile Viewport", "Meta Description", "Favicon", "H1 Tag", "Canonical Tag"],
      "Technical SEO": ["HTTPS", "Robots.txt", "Sitemap", "Schema Markup"],
      "Social Media": ["Open Graph Tags", "Twitter Cards"],
      Accessibility: ["Image Alt Tags", "HTML Lang Attribute", "ARIA Labels", "Skip Links"],
      "Advanced Technical": ["Structured Data", "AMP Version", "Web App Manifest"],
      Security: ["Content Security Policy", "X-Frame-Options", "X-Content-Type-Options"],
    };

    return Object.entries(categories).map(([category, metricNames]) => ({
      category,
      metrics: metrics.filter((m) => metricNames.includes(m.metric)),
    }));
  };

  const getStatusColor = (value: string) => {
    if (value === "Present" || value === "Yes") return "text-green-500";
    if (value === "Missing" || value === "No") return "text-red-500";
    return "text-blue-500";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Website Analysis Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getMetricsByCategory().map(({ category, metrics: categoryMetrics }) => (
              <Card key={category} className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categoryMetrics.map((metric) => (
                      <div
                        key={metric.metric}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="font-medium">{metric.metric}</span>
                        <span className={getStatusColor(metric.value)}>
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WebMetricsD3 data={metrics} />
        <WebMetricsHighcharts data={metrics} />
      </div>
      
      <WebMetricsP5 data={metrics} />
    </div>
  );
};