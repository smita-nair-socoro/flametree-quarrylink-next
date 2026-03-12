'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SignatureProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function Signature({
  value = '',
  onChange,
  className,
}: SignatureProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const isDrawingRef = React.useRef(false);
  const hasDrawnRef = React.useRef(false);
  const lastInternalValueRef = React.useRef('');

  const resizeCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = canvas.getBoundingClientRect();
    const nextWidth = Math.floor(rect.width * ratio);
    const nextHeight = Math.floor(rect.height * ratio);

    if (canvas.width === nextWidth && canvas.height === nextHeight) return;

    const previousData = hasDrawnRef.current ? canvas.toDataURL() : '';

    canvas.width = nextWidth;
    canvas.height = nextHeight;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.scale(ratio, ratio);
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#111827';

    if (previousData) {
      const image = new Image();
      image.onload = () => {
        context.drawImage(image, 0, 0, rect.width, rect.height);
      };
      image.src = previousData;
    }
  }, []);

  const clearCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawnRef.current = false;
  }, []);

  const getPoint = React.useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }, []);

  const startDrawing = React.useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      const point = getPoint(event);

      if (!canvas || !context || !point) return;

      event.preventDefault();
      canvas.setPointerCapture(event.pointerId);
      isDrawingRef.current = true;
      context.beginPath();
      context.moveTo(point.x, point.y);
    },
    [getPoint],
  );

  const draw = React.useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return;

      const context = canvasRef.current?.getContext('2d');
      const point = getPoint(event);

      if (!context || !point) return;

      event.preventDefault();
      context.lineTo(point.x, point.y);
      context.stroke();
      hasDrawnRef.current = true;
    },
    [getPoint],
  );

  const endDrawing = React.useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return;

      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      if (!canvas || !context) return;

      event.preventDefault();
      isDrawingRef.current = false;
      context.closePath();
      const nextValue = hasDrawnRef.current ? canvas.toDataURL('image/png') : '';
      lastInternalValueRef.current = nextValue;
      onChange?.(nextValue);
    },
    [onChange],
  );

  React.useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [resizeCanvas]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    if (value === lastInternalValueRef.current) {
      return;
    }

    if (!value) {
      clearCanvas();
      lastInternalValueRef.current = '';
      return;
    }

    const image = new Image();
    image.onload = () => {
      clearCanvas();
      const rect = canvas.getBoundingClientRect();
      context.drawImage(image, 0, 0, rect.width, rect.height);
      hasDrawnRef.current = true;
      lastInternalValueRef.current = value;
    };
    image.src = value;
  }, [clearCanvas, value]);

  return (
    <div
      className={cn(
        'overflow-hidden rounded-md border border-[#D1D5DB] bg-white',
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        className="block h-[140px] w-full touch-none"
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={endDrawing}
        onPointerLeave={endDrawing}
      />
    </div>
  );
}
