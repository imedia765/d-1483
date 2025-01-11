import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card } from '@/components/ui/card';

interface WebMetricsD3Props {
  data: Array<{ metric: string; value: string }>;
}

export const WebMetricsD3 = ({ data }: WebMetricsD3Props) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Filter and transform data for visualization
    const numericData = data
      .filter(d => !isNaN(parseFloat(d.value.replace(/[^0-9.-]/g, '')))
      && !d.value.includes('Present') && !d.value.includes('Missing'))
      .map(d => ({
        metric: d.metric,
        value: parseFloat(d.value.replace(/[^0-9.-]/g, ''))
      }));

    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleBand()
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .range([height, 0]);

    x.domain(numericData.map(d => d.metric));
    y.domain([0, d3.max(numericData, d => d.value) || 0]);

    // Add bars
    svg.selectAll('.bar')
      .data(numericData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.metric) || 0)
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.value))
      .attr('height', d => height - y(d.value))
      .attr('fill', 'hsl(var(--primary))')
      .attr('opacity', 0.8);

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .style('fill', 'hsl(var(--foreground))');

    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('fill', 'hsl(var(--foreground))');

  }, [data]);

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Performance Metrics Visualization (D3)</h3>
      <svg ref={svgRef} className="w-full h-[300px]" />
    </Card>
  );
};