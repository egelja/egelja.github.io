import type { ComponentChildren } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  EventBus,
  PDFLinkService,
  PDFViewer,
} from "pdfjs-dist/web/pdf_viewer.mjs";
import "pdfjs-dist/web/pdf_viewer.css";

// client:only="preact" — never runs server-side
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

interface Props {
  src: string;
  title?: string;
  /** Rendered when the PDF fails to load. Pass an action (e.g. <Link download>). */
  children?: ComponentChildren;
}

type State = "loading" | "rendered" | "error";

const SCALE_MODES = ["page-width", "page-fit", "auto"] as const;
type ScaleMode = (typeof SCALE_MODES)[number];

function formatScale(presetValue: string | undefined, scale: number): string {
  if (presetValue === "page-width") return "Fit Width";
  if (presetValue === "page-fit") return "Fit Page";
  if (presetValue === "auto") return "Auto";
  return Math.round(scale * 100) + "%";
}

import flowbiteIcons from "@iconify-json/flowbite/icons.json";

function FlowbiteIcon({ name }: { name: string }) {
  const icon = (flowbiteIcons.icons as Record<string, { body: string }>)[name];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox={`0 0 ${flowbiteIcons.width} ${flowbiteIcons.height}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}

export default function PdfViewerComponent({ src, title, children }: Props) {
  const [state, setState] = useState<State>("loading");
  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [scaleLabel, setScaleLabel] = useState("Fit Width");
  const [scaleModeIdx, setScaleModeIdx] = useState(0);
  const [fakeFullscreen, setFakeFullscreen] = useState(false);

  const outerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerDivRef = useRef<HTMLDivElement>(null);
  const pdfViewerRef = useRef<PDFViewer | null>(null);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const pinchRef = useRef<{
    startDist: number;
    startScale: number;
    midX: number;
    midY: number;
    startScrollLeft: number;
    startScrollTop: number;
  } | null>(null);

  // Init viewer + load PDF
  useEffect(() => {
    const container = containerRef.current;
    const viewerDiv = viewerDivRef.current;
    if (!container || !viewerDiv) return;

    const eventBus = new EventBus();
    const linkService = new PDFLinkService({ eventBus });
    const pdfViewer = new PDFViewer({
      container,
      viewer: viewerDiv,
      eventBus,
      linkService,
      textLayerMode: 1, // TextLayerMode.ENABLE
      annotationMode: pdfjsLib.AnnotationMode.ENABLE,
    } as any);
    linkService.setViewer(pdfViewer);
    pdfViewerRef.current = pdfViewer;

    eventBus.on(
      "pagechanging",
      ({ pageNumber }: { pageNumber: number }) => setPageNum(pageNumber),
    );
    eventBus.on("pagesloaded", () => {
      (pdfViewer as any).currentScaleValue = "page-width";
      setState("rendered");
    });
    eventBus.on(
      "scalechanging",
      ({ presetValue, scale }: { presetValue?: string; scale: number }) => {
        setScaleLabel(formatScale(presetValue, scale));
      },
    );

    setState("loading");
    const task = pdfjsLib.getDocument(src);
    task.promise
      .then((pdf) => {
        pdfDocRef.current = pdf;
        pdfViewer.setDocument(pdf);
        linkService.setDocument(pdf, null);
        setPageCount(pdf.numPages);
      })
      .catch(() => setState("error"));

    return () => {
      task.destroy?.();
      pdfViewer.cleanup?.();
      pdfDocRef.current?.destroy();
      pdfDocRef.current = null;
      pdfViewerRef.current = null;
    };
  }, [src]);

  // Ctrl+scroll zoom toward mouse cursor
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const v = pdfViewerRef.current as any;
    const container = containerRef.current;
    if (!v || !container) return;

    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 16;
    if (e.deltaMode === 2) delta *= 400;

    const oldScale = v.currentScale;
    const newScale = Math.max(0.1, Math.min(10, oldScale * Math.exp(-delta / 600)));

    // Mouse position in viewport-relative coords
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const preScrollLeft = container.scrollLeft;
    const preScrollTop = container.scrollTop;

    v.currentScale = newScale;

    // After pdfjs re-layouts pages, shift scroll so the point under the mouse stays fixed
    requestAnimationFrame(() => {
      const ratio = newScale / oldScale;
      container.scrollLeft = (preScrollLeft + mouseX) * ratio - mouseX;
      container.scrollTop = (preScrollTop + mouseY) * ratio - mouseY;
    });
  }, []);

  // Pinch-to-zoom
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 2) return;
    const container = containerRef.current;
    const v = pdfViewerRef.current as any;
    if (!container || !v) return;
    const [t1, t2] = [e.touches[0], e.touches[1]];
    const rect = container.getBoundingClientRect();
    pinchRef.current = {
      startDist: Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY),
      startScale: v.currentScale,
      midX: (t1.clientX + t2.clientX) / 2 - rect.left,
      midY: (t1.clientY + t2.clientY) / 2 - rect.top,
      startScrollLeft: container.scrollLeft,
      startScrollTop: container.scrollTop,
    };
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 2 || !pinchRef.current) return;
    e.preventDefault();
    const container = containerRef.current;
    const v = pdfViewerRef.current as any;
    if (!container || !v) return;
    const [t1, t2] = [e.touches[0], e.touches[1]];
    const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    const { startDist, startScale, midX, midY, startScrollLeft, startScrollTop } = pinchRef.current;
    const newScale = Math.max(0.1, Math.min(10, startScale * (dist / startDist)));
    v.currentScale = newScale;
    requestAnimationFrame(() => {
      const ratio = newScale / startScale;
      container.scrollLeft = (startScrollLeft + midX) * ratio - midX;
      container.scrollTop = (startScrollTop + midY) * ratio - midY;
    });
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.touches.length < 2) pinchRef.current = null;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

  const closeFullscreen = useCallback(() => setFakeFullscreen(false), []);

  const toggleFullscreen = useCallback(
    () => setFakeFullscreen((f) => !f),
    [],
  );

  // Body scroll lock + Escape key when in fake fullscreen
  useEffect(() => {
    if (!fakeFullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFullscreen();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [fakeFullscreen, closeFullscreen]);

  // Toolbar handlers
  const zoomOut = () => {
    const v = pdfViewerRef.current as any;
    if (v) v.currentScale = Math.max(0.1, v.currentScale / 1.1);
  };
  const zoomIn = () => {
    const v = pdfViewerRef.current as any;
    if (v) v.currentScale = Math.min(10, v.currentScale * 1.1);
  };
  const cycleScaleMode = () => {
    const next = (scaleModeIdx + 1) % SCALE_MODES.length;
    setScaleModeIdx(next);
    const v = pdfViewerRef.current as any;
    if (v) v.currentScaleValue = SCALE_MODES[next];
  };
  const prevPage = () => {
    const v = pdfViewerRef.current as any;
    if (v && v.currentPageNumber > 1) v.currentPageNumber--;
  };
  const nextPage = () => {
    const v = pdfViewerRef.current as any;
    if (v && v.currentPageNumber < pageCount) v.currentPageNumber++;
  };

  const btnClass =
    "p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-40 transition-colors";

  return (
    <div
      ref={outerRef}
      class="flex flex-col rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900"
      style={
        fakeFullscreen
          ? { position: "fixed", inset: 0, zIndex: 50, borderRadius: 0 }
          : { height: "calc(100vh - 220px)", minHeight: "500px" }
      }
      role="region"
      aria-label={title ?? "PDF viewer"}
    >
      {/* Toolbar */}
      <div class="flex-none flex items-center gap-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 text-sm">
        <button
          onClick={prevPage}
          disabled={state !== "rendered" || pageNum <= 1}
          class={btnClass}
          aria-label="Previous page"
        >
          ‹
        </button>
        <span class="text-gray-600 dark:text-gray-400 tabular-nums px-1 min-w-[5rem] text-center">
          {state === "rendered" ? `${pageNum} / ${pageCount}` : "–"}
        </span>
        <button
          onClick={nextPage}
          disabled={state !== "rendered" || pageNum >= pageCount}
          class={btnClass}
          aria-label="Next page"
        >
          ›
        </button>

        <span class="flex-1" />

        <button
          onClick={zoomOut}
          disabled={state !== "rendered"}
          class={btnClass}
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={cycleScaleMode}
          disabled={state !== "rendered"}
          class={`${btnClass} px-2 min-w-[5.5rem] text-xs text-center font-medium`}
          aria-label="Cycle zoom mode"
        >
          {scaleLabel}
        </button>
        <button
          onClick={zoomIn}
          disabled={state !== "rendered"}
          class={btnClass}
          aria-label="Zoom in"
        >
          +
        </button>

        <span class="w-1" />

        <button
          onClick={toggleFullscreen}
          class={btnClass}
          aria-label={fakeFullscreen ? "Exit full screen" : "Full screen"}
        >
          <FlowbiteIcon name={fakeFullscreen ? "compress-outline" : "expand-outline"} />
        </button>
      </div>

      {/* Content area */}
      <div class="relative flex-1 min-h-0">
        {/* PDF scroll container — always in DOM for PDFViewer sizing */}
        <div
          ref={containerRef}
          class="absolute inset-0 overflow-auto bg-gray-100 dark:bg-gray-800"
          style={{ visibility: state === "rendered" ? "visible" : "hidden" }}
        >
          <div ref={viewerDivRef} class="pdfViewer" />
        </div>

        {/* Loading overlay */}
        {state === "loading" && (
          <div class="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
            <div
              class="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-accent animate-spin"
              role="status"
              aria-label="Loading PDF"
            />
          </div>
        )}

        {/* Error overlay */}
        {state === "error" && (
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center bg-white dark:bg-gray-900">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Unable to load PDF.
            </p>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
