import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Card } from '@/components/ui/card';

interface WebMetricsHighchartsProps {
  data: Array<{ metric: string; value: string }>;
}

export const WebMetricsHighcharts = ({ data }: WebMetricsHighchartsProps) => {
  const presenceData = data.filter(d => 
    d.value === 'Present' || d.value === 'Missing' || d.value === 'Yes' || d.value === 'No'
  ).map(d => ({
    name: d.metric,
    y: d.value === 'Present' || d.value === 'Yes' ? 1 : 0,
    color: d.value === 'Present' || d.value === 'Yes' ? '#4ade80' : '#ef4444'
  }));

  const options: Highcharts.Options = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent'
    },
    title: {
      text: 'Feature Presence Analysis',
      style: { color: 'hsl(var(--foreground))' }
    },
    tooltip: {
      pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
    },
    accessibility: {
      point: {
        valueSuffix: '%'
      }
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>',
          style: {
            color: 'hsl(var(--foreground))'
          }
        }
      }
    },
    series: [{
      type: 'pie',
      name: 'Features',
      data: presenceData
    }]
  };

  return (
    <Card className="p-4">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </Card>
  );
};