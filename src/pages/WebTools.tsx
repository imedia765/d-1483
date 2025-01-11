import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { WebMetricsForm } from "@/components/web-tools/WebMetricsForm";
import { MetricsDisplay } from "@/components/web-tools/MetricsDisplay";
import { ConsoleOutput } from "@/components/web-tools/ConsoleOutput";

const WebTools = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<Array<{ metric: string; value: string }>>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    try {
      // Mock data for demonstration - replace with actual API call
      const mockMetrics = [
        { metric: "Page Load Time", value: "2.3s" },
        { metric: "Page Size", value: "1.2MB" },
        { metric: "Meta Description", value: "Present" },
        { metric: "H1 Tag", value: "Present" },
        { metric: "HTTPS", value: "Yes" },
        { metric: "Image Alt Tags", value: "Present" }
      ];
      
      setMetrics(mockMetrics);
      setLogs([`[${new Date().toLocaleTimeString()}] Analyzing ${url}...`]);
    } catch (error) {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error: ${error}`]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Web Development Tools</h1>
              <SidebarTrigger className="md:hidden" />
            </div>
            <div className="grid gap-6">
              <WebMetricsForm onAnalyze={handleAnalyze} isLoading={isLoading} />
              <MetricsDisplay metrics={metrics} />
              <ConsoleOutput logs={logs} />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default WebTools;