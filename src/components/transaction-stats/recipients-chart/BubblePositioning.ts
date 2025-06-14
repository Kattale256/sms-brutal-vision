
interface BubbleData {
  x: number;
  y: number;
  radius: number;
  name: string;
  value: number;
  size: number;
  color: string;
}

interface Position {
  x: number;
  y: number;
  radius: number;
}

export class BubblePositioning {
  private isMobile: boolean;
  private padding: number;
  private chartBounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };

  constructor(isMobile: boolean) {
    this.isMobile = isMobile;
    this.padding = isMobile ? 3 : 5;
    this.chartBounds = {
      minX: 15,
      maxX: 85,
      minY: 15,
      maxY: 85
    };
  }

  public generateNonOverlappingPositions(bubbles: BubbleData[]): BubbleData[] {
    const positions: Position[] = [];
    const maxAttempts = 200;
    
    // Sort bubbles by size (largest first) for better packing
    const sortedBubbles = [...bubbles].sort((a, b) => b.radius - a.radius);
    
    sortedBubbles.forEach((bubble, index) => {
      let positioned = false;
      let attempts = 0;
      
      while (!positioned && attempts < maxAttempts) {
        let x, y;
        
        if (index === 0) {
          // Place first (largest) bubble in center
          x = 50;
          y = 50;
        } else if (index === 1 && positions.length > 0) {
          // Place second bubble to the right of first
          const firstBubble = positions[0];
          x = Math.min(this.chartBounds.maxX - bubble.radius, 
               firstBubble.x + firstBubble.radius + bubble.radius + this.padding);
          y = firstBubble.y;
        } else if (index === 2 && positions.length > 1) {
          // Place third bubble to the left of first
          const firstBubble = positions[0];
          x = Math.max(this.chartBounds.minX + bubble.radius, 
               firstBubble.x - firstBubble.radius - bubble.radius - this.padding);
          y = firstBubble.y;
        } else {
          // For remaining bubbles, try different strategies
          const { x: newX, y: newY } = this.getPositionByStrategy(attempts, bubble, positions, index);
          x = newX;
          y = newY;
        }
        
        // Ensure bubble stays within chart bounds
        x = Math.max(this.chartBounds.minX + bubble.radius, 
            Math.min(this.chartBounds.maxX - bubble.radius, x));
        y = Math.max(this.chartBounds.minY + bubble.radius, 
            Math.min(this.chartBounds.maxY - bubble.radius, y));
        
        // Check for overlaps with existing bubbles
        const hasOverlap = this.checkForOverlaps(x, y, bubble.radius, positions);
        
        if (!hasOverlap) {
          positions.push({ x, y, radius: bubble.radius });
          bubble.x = x;
          bubble.y = y;
          positioned = true;
        }
        
        attempts++;
      }
      
      // Final fallback: place at a safe location even if not optimal
      if (!positioned) {
        console.warn(`Could not find optimal position for bubble ${index}, using fallback`);
        const { x: fallbackX, y: fallbackY } = this.getFallbackPosition(index, bubble.radius);
        
        bubble.x = fallbackX;
        bubble.y = fallbackY;
        positions.push({ x: fallbackX, y: fallbackY, radius: bubble.radius });
      }
    });
    
    return bubbles;
  }

  private getPositionByStrategy(attempts: number, bubble: BubbleData, positions: Position[], index: number): { x: number; y: number } {
    if (attempts < 50) {
      // Strategy 1: Random placement within safe bounds
      const safeMargin = bubble.radius + this.padding;
      const x = safeMargin + Math.random() * (100 - 2 * safeMargin);
      const y = safeMargin + Math.random() * (100 - 2 * safeMargin);
      return { x, y };
    } else if (attempts < 100) {
      // Strategy 2: Try placing around existing bubbles
      if (positions.length > 0) {
        const randomExisting = positions[Math.floor(Math.random() * positions.length)];
        const angle = Math.random() * 2 * Math.PI;
        const distance = randomExisting.radius + bubble.radius + this.padding + 5;
        let x = randomExisting.x + Math.cos(angle) * distance;
        let y = randomExisting.y + Math.sin(angle) * distance;
        
        // Clamp to bounds
        x = Math.max(this.chartBounds.minX + bubble.radius, 
            Math.min(this.chartBounds.maxX - bubble.radius, x));
        y = Math.max(this.chartBounds.minY + bubble.radius, 
            Math.min(this.chartBounds.maxY - bubble.radius, y));
        return { x, y };
      } else {
        return { x: 50, y: 50 };
      }
    } else {
      // Strategy 3: Grid-based fallback
      return this.getGridPosition(index, bubble.radius);
    }
  }

  private getGridPosition(index: number, radius: number): { x: number; y: number } {
    const gridSize = Math.ceil(Math.sqrt(index + 1));
    const cellWidth = (this.chartBounds.maxX - this.chartBounds.minX) / gridSize;
    const cellHeight = (this.chartBounds.maxY - this.chartBounds.minY) / gridSize;
    const gridX = (index - 1) % gridSize;
    const gridY = Math.floor((index - 1) / gridSize);
    
    let x = this.chartBounds.minX + gridX * cellWidth + cellWidth / 2;
    let y = this.chartBounds.minY + gridY * cellHeight + cellHeight / 2;
    
    // Ensure bubble fits within cell
    x = Math.max(this.chartBounds.minX + radius, 
        Math.min(this.chartBounds.maxX - radius, x));
    y = Math.max(this.chartBounds.minY + radius, 
        Math.min(this.chartBounds.maxY - radius, y));
    
    return { x, y };
  }

  private getFallbackPosition(index: number, radius: number): { x: number; y: number } {
    let fallbackX = 20 + (index * 15) % 60;
    let fallbackY = 20 + Math.floor(index / 4) * 20;
    
    // Ensure fallback position is within bounds
    fallbackX = Math.max(this.chartBounds.minX + radius, 
                Math.min(this.chartBounds.maxX - radius, fallbackX));
    fallbackY = Math.max(this.chartBounds.minY + radius, 
                Math.min(this.chartBounds.maxY - radius, fallbackY));
    
    return { x: fallbackX, y: fallbackY };
  }

  private checkForOverlaps(x: number, y: number, radius: number, positions: Position[]): boolean {
    for (const existing of positions) {
      const distance = Math.sqrt(Math.pow(x - existing.x, 2) + Math.pow(y - existing.y, 2));
      const minDistance = radius + existing.radius + this.padding;
      
      if (distance < minDistance) {
        return true;
      }
    }
    return false;
  }
}
