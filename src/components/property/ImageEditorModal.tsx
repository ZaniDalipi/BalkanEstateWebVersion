// ImageEditorModal - Standalone image editor with drawing capabilities
// Extracted from PropertyDetailsPage for better modularity

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Property } from '../../../types';
import { useAppContext } from '../../../context/AppContext';
import { createConversation, sendMessage, uploadMessageImage } from '../../../services/apiService';
import { ArrowUturnLeftIcon, XMarkIcon, PencilIcon, ArrowDownTrayIcon } from '../../../constants';

type Point = { x: number; y: number };
type Path = { points: Point[]; color: string; lineWidth: number };

interface ImageEditorModalProps {
  imageUrl: string;
  property: Property;
  onClose: () => void;
}

/**
 * Image Editor Modal for property images
 *
 * Features:
 * - Drawing with multiple colors
 * - Zoom and pan
 * - Save and send to agent
 * - Download annotated image
 *
 * Usage:
 * ```tsx
 * <ImageEditorModal
 *   imageUrl={property.images[0]}
 *   property={property}
 *   onClose={() => setShowEditor(false)}
 * />
 * ```
 */
export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ imageUrl, property, onClose }) => {
  const { dispatch, state } = useAppContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<Path[]>([]);
  const [currentPath, setCurrentPath] = useState<Path | null>(null);
  const [color, setColor] = useState('#FF0000'); // Red
  const [lineWidth, setLineWidth] = useState(5);
  const [showToast, setShowToast] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;
    if (!canvas || !ctx || !img.src) return;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);
    ctx.drawImage(img, 0, 0);

    [...paths, currentPath].forEach(path => {
      if (!path) return;
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      path.points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    });

    ctx.restore();
  }, [zoom, offset, paths, currentPath]);

  useEffect(() => {
    const img = imageRef.current;
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        // Fit image to canvas initially
        const canvasAspect = canvas.clientWidth / canvas.clientHeight;
        const imgAspect = img.width / img.height;
        const initialZoom = canvasAspect > imgAspect
          ? canvas.clientHeight / img.height
          : canvas.clientWidth / img.width;
        setZoom(initialZoom);
        setOffset({
          x: (canvas.clientWidth - img.width * initialZoom) / 2,
          y: (canvas.clientHeight - img.height * initialZoom) / 2,
        });
      }
    };
  }, [imageUrl]);

  useEffect(() => {
    draw();
  }, [draw]);

  const getCanvasPoint = (e: React.MouseEvent | React.Touch): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / zoom;
    const y = (e.clientY - rect.top - offset.y) / zoom;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const point = getCanvasPoint(e);
    if (point) {
      setIsDrawing(true);
      setCurrentPath({ points: [point], color, lineWidth });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !currentPath) return;
    const point = getCanvasPoint(e);
    if (point) {
      setCurrentPath(prev => prev ? { ...prev, points: [...prev.points, point] } : null);
    }
  };

  const handleMouseUp = () => {
    if (currentPath) {
      setPaths(prev => [...prev, currentPath]);
      setCurrentPath(null);
    }
    setIsDrawing(false);
  };

  const handleUndo = () => {
    setPaths(prev => prev.slice(0, -1));
  };

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `property-${property.id}-annotated.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleSendToAgent = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Create blob from canvas
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        // Find or create conversation
        let conversationId = state.conversations.find(c => c.property.id === property.id)?.id;

        if (!conversationId) {
          const newConv = await createConversation(property.id);
          conversationId = newConv.id;
        }

        // Upload image
        const file = new File([blob], 'annotated-image.png', { type: 'image/png' });
        const imageUrl = await uploadMessageImage(conversationId, file);

        // Send message with image
        await sendMessage(conversationId, {
          text: 'I have some questions about this property. Please see my annotations:',
          imageUrl,
          sender: state.currentUser?.id || '',
          timestamp: Date.now(),
        });

        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }, 'image/png');
    } catch (error) {
      console.error('Failed to send to agent:', error);
      alert('Failed to send annotated image. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-900 p-4 flex items-center justify-between gap-4">
        <button onClick={onClose} className="text-white hover:text-gray-300">
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4">
          {/* Color picker */}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />

          {/* Line width */}
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-32"
          />

          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={paths.length === 0}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          >
            <ArrowUturnLeftIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Download
          </button>

          <button
            onClick={handleSendToAgent}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Send to Agent
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full cursor-crosshair"
        />
      </div>

      {/* Toast */}
      {showToast && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
          ✓ Sent to agent successfully!
        </div>
      )}
    </div>
  );
};
