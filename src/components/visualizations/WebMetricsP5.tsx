import { useEffect, useRef } from 'react';
import Sketch from 'react-p5';
import p5Types from 'p5';
import { Card } from '@/components/ui/card';

interface WebMetricsP5Props {
  data: Array<{ metric: string; value: string }>;
}

interface ColorTuple {
  r: number;
  g: number;
  b: number;
}

export const WebMetricsP5 = ({ data }: WebMetricsP5Props) => {
  const circles: Array<{
    angle: number;
    radius: number;
    category: string;
    value: string;
    pulseOffset: number;
  }> = [];

  const categories = {
    performance: ['Page Load Time', 'Page Size', 'Largest Contentful Paint'],
    seo: ['Meta Description', 'H1 Tag', 'Canonical Tag'],
    security: ['HTTPS', 'Content Security Policy'],
    accessibility: ['Image Alt Tags', 'ARIA Labels']
  };

  const categoryColors: Record<string, ColorTuple> = {
    performance: { r: 252, g: 82, b: 74 },
    seo: { r: 56, g: 189, b: 248 },
    security: { r: 34, g: 197, b: 94 },
    accessibility: { r: 168, g: 85, b: 247 }
  };

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(600, 400).parent(canvasParentRef);
    p5.angleMode(p5.RADIANS);

    // Initialize circles based on metrics
    let angleStep = (2 * Math.PI) / data.length;
    data.forEach((metric, i) => {
      let category = Object.entries(categories).find(([_, metrics]) =>
        metrics.includes(metric.metric)
      )?.[0] || 'other';

      circles.push({
        angle: i * angleStep,
        radius: metric.value === 'Present' || metric.value === 'Yes' ? 100 : 70,
        category,
        value: metric.value,
        pulseOffset: p5.random(0, 2 * Math.PI)
      });
    });
  };

  const draw = (p5: p5Types) => {
    p5.background(20, 25, 35);
    p5.translate(p5.width / 2, p5.height / 2);

    // Draw connecting lines
    p5.stroke(40, 45, 55);
    p5.strokeWeight(1);
    circles.forEach((circle, i) => {
      let nextCircle = circles[(i + 1) % circles.length];
      p5.line(
        Math.cos(circle.angle) * circle.radius,
        Math.sin(circle.angle) * circle.radius,
        Math.cos(nextCircle.angle) * nextCircle.radius,
        Math.sin(nextCircle.angle) * nextCircle.radius
      );
    });

    // Draw circles and labels
    circles.forEach((circle) => {
      let x = Math.cos(circle.angle) * circle.radius;
      let y = Math.sin(circle.angle) * circle.radius;
      
      // Pulse effect
      let pulseSize = p5.sin(p5.frameCount * 0.05 + circle.pulseOffset) * 5;
      
      // Draw outer glow for present/yes values
      if (circle.value === 'Present' || circle.value === 'Yes') {
        const color = categoryColors[circle.category] || { r: 150, g: 150, b: 150 };
        p5.noStroke();
        p5.fill(color.r, color.g, color.b, 50);
        p5.circle(x, y, 40 + pulseSize);
      }

      // Draw main circle
      p5.noStroke();
      const color = categoryColors[circle.category] || { r: 150, g: 150, b: 150 };
      p5.fill(color.r, color.g, color.b, 200);
      p5.circle(x, y, 30);

      // Draw label
      p5.fill(255);
      p5.textSize(10);
      p5.textAlign(p5.CENTER);
      let label = data.find((_, i) => circles[i] === circle)?.metric || '';
      p5.push();
      p5.translate(x, y + 25);
      p5.rotate(circle.angle > Math.PI / 2 && circle.angle < 3 * Math.PI / 2 ? Math.PI : 0);
      p5.text(label, 0, 0);
      p5.pop();
    });

    // Draw center circle
    p5.noStroke();
    p5.fill(252, 82, 74, 100);
    p5.circle(0, 0, 50 + p5.sin(p5.frameCount * 0.05) * 5);
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Interactive Metrics Visualization</h3>
      <Sketch setup={setup} draw={draw} />
    </Card>
  );
};