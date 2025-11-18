import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Damage, BoundingBox, getSeverityColor } from '../../types/damageReview';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ImageCanvasProps {
  imageUrl: string;
  damages: Damage[];
  selectedDamageId: string | null;
  onDamageClick: (damage: Damage) => void;
  onDrawComplete?: (boundingBox: BoundingBox) => void;
  isDrawingMode?: boolean;
}

export const ImageCanvas: React.FC<ImageCanvasProps> = ({
  imageUrl,
  damages,
  selectedDamageId,
  onDamageClick,
  onDrawComplete,
  isDrawingMode = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDraw, setCurrentDraw] = useState<BoundingBox | null>(null);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      setImageSize({ width: img.width, height: img.height });
      fitToContainer(img);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const fitToContainer = useCallback((img: HTMLImageElement) => {
    if (!containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const scaleX = container.width / img.width;
    const scaleY = container.height / img.height;
    const newScale = Math.min(scaleX, scaleY, 1);

    setScale(newScale);
    setOffset({
      x: (container.width - img.width * newScale) / 2,
      y: (container.height - img.height * newScale) / 2
    });
  }, []);

  // Draw canvas
  useEffect(() => {
    if (!canvasRef.current || !image || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = containerRef.current.getBoundingClientRect();
    canvas.width = container.width;
    canvas.height = container.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(
      image,
      offset.x,
      offset.y,
      image.width * scale,
      image.height * scale
    );

    // Draw damages
    damages.forEach(damage => {
      const bbox = damage.boundingBox;
      const x = offset.x + bbox.x * scale;
      const y = offset.y + bbox.y * scale;
      const width = bbox.width * scale;
      const height = bbox.height * scale;

      const isSelected = damage.id === selectedDamageId;
      const color = getSeverityColor(damage.severity);

      ctx.strokeStyle = color;
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.strokeRect(x, y, width, height);

      if (isSelected) {
        ctx.fillStyle = color + '20';
        ctx.fillRect(x, y, width, height);
      }

      // Draw severity badge
      const badgeSize = 24;
      ctx.fillStyle = color;
      ctx.fillRect(x, y - badgeSize, badgeSize, badgeSize);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(damage.severity.toString(), x + badgeSize / 2, y - badgeSize / 2);
    });

    // Draw current drawing box
    if (currentDraw && isDrawingMode) {
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        offset.x + currentDraw.x * scale,
        offset.y + currentDraw.y * scale,
        currentDraw.width * scale,
        currentDraw.height * scale
      );
      ctx.setLineDash([]);
    }
  }, [image, damages, selectedDamageId, scale, offset, currentDraw, isDrawingMode]);

  // Handle zoom
  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(0.1, Math.min(5, prev + delta)));
  };

  const handleZoomIn = () => handleZoom(0.2);
  const handleZoomOut = () => handleZoom(-0.2);
  const handleFit = () => {
    if (image) fitToContainer(image);
  };

  // Handle mouse events
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const screenToImageCoords = (screenX: number, screenY: number) => {
    return {
      x: (screenX - offset.x) / scale,
      y: (screenY - offset.y) / scale
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (isDrawingMode) {
      const imageCoords = screenToImageCoords(pos.x, pos.y);
      setDrawStart(imageCoords);
      setCurrentDraw({ x: imageCoords.x, y: imageCoords.y, width: 0, height: 0 });
    } else {
      // Check if clicked on a damage
      const clickedDamage = damages.find(damage => {
        const bbox = damage.boundingBox;
        const x = offset.x + bbox.x * scale;
        const y = offset.y + bbox.y * scale;
        const width = bbox.width * scale;
        const height = bbox.height * scale;

        return (
          pos.x >= x &&
          pos.x <= x + width &&
          pos.y >= y &&
          pos.y <= y + height
        );
      });

      if (clickedDamage) {
        onDamageClick(clickedDamage);
      } else {
        // Start dragging
        setIsDragging(true);
        setDragStart({ x: pos.x - offset.x, y: pos.y - offset.y });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (isDrawingMode && drawStart && currentDraw) {
      const imageCoords = screenToImageCoords(pos.x, pos.y);
      setCurrentDraw({
        x: Math.min(drawStart.x, imageCoords.x),
        y: Math.min(drawStart.y, imageCoords.y),
        width: Math.abs(imageCoords.x - drawStart.x),
        height: Math.abs(imageCoords.y - drawStart.y)
      });
    } else if (isDragging) {
      setOffset({
        x: pos.x - dragStart.x,
        y: pos.y - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    if (isDrawingMode && currentDraw && drawStart) {
      if (currentDraw.width > 10 && currentDraw.height > 10) {
        onDrawComplete?.(currentDraw);
      }
      setDrawStart(null);
      setCurrentDraw(null);
    }
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    handleZoom(delta);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gray-900">
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${isDrawingMode ? 'cursor-crosshair' : isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleFit}
          className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
          title="Fit to Screen"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute top-4 right-4 px-3 py-1 bg-black bg-opacity-75 text-white rounded-lg text-sm">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
};
