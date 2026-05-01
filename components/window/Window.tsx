'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindows, AppId, WindowState } from '@/context/WindowContext';

interface WindowProps {
  windowState: WindowState;
  children: React.ReactNode;
}

const MIN_WIDTH = 380;
const MIN_HEIGHT = 280;

export default function Window({ windowState, children }: WindowProps) {
  const { id, title, icon, isMaximized, zIndex, position, size } = windowState;
  const { closeWindow, minimizeWindow, maximizeWindow, bringToFront, updatePosition, updateSize } = useWindows();

  const windowRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, w: 0, h: 0 });

  const [pos, setPos] = useState(position);
  const [sz, setSz] = useState(size);
  const [isSnapped, setIsSnapped] = useState<'left' | 'right' | null>(null);

  // Sync with context when maximized changes
  useEffect(() => {
    if (!isMaximized) {
      setPos(position);
      setSz(size);
    }
  }, [isMaximized]);

  // ────── Drag Logic ──────
  const onDragMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    isDragging.current = true;
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, winX: pos.x, winY: pos.y };
    bringToFront(id);
  }, [isMaximized, pos, id, bringToFront]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging.current) {
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;
      const newX = Math.max(0, dragStart.current.winX + dx);
      const newY = Math.max(0, dragStart.current.winY + dy);

      // Snap detection
      const snapThreshold = 20;
      if (e.clientX < snapThreshold) setIsSnapped('left');
      else if (e.clientX > window.innerWidth - snapThreshold) setIsSnapped('right');
      else setIsSnapped(null);

      setPos({ x: newX, y: newY });
    }

    if (isResizing.current) {
      const dx = e.clientX - resizeStart.current.mouseX;
      const dy = e.clientY - resizeStart.current.mouseY;
      const newW = Math.max(MIN_WIDTH, resizeStart.current.w + dx);
      const newH = Math.max(MIN_HEIGHT, resizeStart.current.h + dy);
      setSz({ width: newW, height: newH });
    }
  }, []);

  const onMouseUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      // Apply snap
      if (isSnapped === 'left') {
        const snappedPos = { x: 0, y: 0 };
        const snappedSize = { width: window.innerWidth / 2, height: window.innerHeight - 48 };
        setPos(snappedPos);
        setSz(snappedSize);
        updatePosition(id, snappedPos);
        updateSize(id, snappedSize);
        setIsSnapped(null);
        return;
      }
      if (isSnapped === 'right') {
        const snappedPos = { x: window.innerWidth / 2, y: 0 };
        const snappedSize = { width: window.innerWidth / 2, height: window.innerHeight - 48 };
        setPos(snappedPos);
        setSz(snappedSize);
        updatePosition(id, snappedPos);
        updateSize(id, snappedSize);
        setIsSnapped(null);
        return;
      }
      updatePosition(id, pos);
    }
    if (isResizing.current) {
      isResizing.current = false;
      updateSize(id, sz);
    }
  }, [id, pos, sz, isSnapped, updatePosition, updateSize]);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // ────── Resize Logic ──────
  const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = true;
    resizeStart.current = { mouseX: e.clientX, mouseY: e.clientY, w: sz.width, h: sz.height };
  }, [sz]);

  const windowStyle: React.CSSProperties = isMaximized
    ? {
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100vw',
        height: 'calc(100vh - 48px)',
        zIndex,
        borderRadius: 0,
      }
    : {
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: sz.width,
        height: sz.height,
        zIndex,
        borderRadius: '12px',
      };

  return (
    <motion.div
      ref={windowRef}
      style={{
        ...windowStyle,
        pointerEvents: 'auto',
        background: 'rgba(5, 8, 22, 0.88)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(99, 179, 237, 0.2)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 30 }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      onClick={() => bringToFront(id)}
    >
      {/* Snap Preview */}
      <AnimatePresence>
        {isSnapped && (
          <motion.div
            className="fixed inset-y-0 pointer-events-none"
            style={{
              left: isSnapped === 'left' ? 0 : '50%',
              width: '50%',
              background: 'rgba(0,212,255,0.08)',
              border: '2px solid rgba(0,212,255,0.3)',
              zIndex: 9998,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Title Bar */}
      <div
        className="window-drag-handle flex items-center justify-between px-4"
        style={{
          height: 40,
          minHeight: 40,
          background: 'linear-gradient(90deg, rgba(0,212,255,0.06), rgba(168,85,247,0.06))',
          borderBottom: '1px solid rgba(99,179,237,0.12)',
          cursor: isMaximized ? 'default' : 'grab',
        }}
        onMouseDown={onDragMouseDown}
        onDoubleClick={() => maximizeWindow(id)}
      >
        {/* Traffic light buttons */}
        <div className="flex items-center gap-2" onMouseDown={e => e.stopPropagation()}>
          <button
            onClick={() => closeWindow(id)}
            className="w-3.5 h-3.5 rounded-full flex items-center justify-center group transition-all hover:scale-110"
            style={{ background: '#ff5f57', boxShadow: '0 0 6px rgba(255,95,87,0.5)' }}
            title="Close"
          >
            <span className="opacity-0 group-hover:opacity-100 text-[9px] font-bold text-red-900">✕</span>
          </button>
          <button
            onClick={() => minimizeWindow(id)}
            className="w-3.5 h-3.5 rounded-full flex items-center justify-center group transition-all hover:scale-110"
            style={{ background: '#febc2e', boxShadow: '0 0 6px rgba(254,188,46,0.5)' }}
            title="Minimize"
          >
            <span className="opacity-0 group-hover:opacity-100 text-[9px] font-bold text-yellow-900">−</span>
          </button>
          <button
            onClick={() => maximizeWindow(id)}
            className="w-3.5 h-3.5 rounded-full flex items-center justify-center group transition-all hover:scale-110"
            style={{ background: '#28c840', boxShadow: '0 0 6px rgba(40,200,64,0.5)' }}
            title="Maximize"
          >
            <span className="opacity-0 group-hover:opacity-100 text-[9px] font-bold text-green-900">⊞</span>
          </button>
        </div>

        {/* Title */}
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'rgba(226,232,240,0.85)' }}>
          <span>{icon}</span>
          <span>{title}</span>
        </div>

        <div className="w-16" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative selectable">
        {children}
      </div>

      {/* Resize Handle */}
      {!isMaximized && (
        <div
          className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          style={{ zIndex: 10 }}
          onMouseDown={onResizeMouseDown}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14 6L6 14M14 10L10 14" stroke="rgba(99,179,237,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      )}
    </motion.div>
  );
}
