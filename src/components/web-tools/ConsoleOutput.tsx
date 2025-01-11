import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ConsoleOutputProps {
  logs: string[];
}

export const ConsoleOutput = ({ logs }: ConsoleOutputProps) => {
  const formatLogEntry = (log: string) => {
    // Check if log entry contains a timestamp
    const timestampMatch = log.match(/\[\d{1,2}:\d{2}:\d{2}\s[AP]M\]/);
    if (timestampMatch) {
      const [timestamp] = timestampMatch;
      const message = log.replace(timestamp, '').trim();
      return (
        <>
          <span className="text-gray-500">{timestamp}</span>
          <span className="ml-2">{message}</span>
        </>
      );
    }
    return log;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Console Output</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          {logs.map((log, index) => (
            <div
              key={index}
              className="text-sm font-mono whitespace-pre-wrap mb-2 leading-relaxed"
            >
              {formatLogEntry(log)}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};