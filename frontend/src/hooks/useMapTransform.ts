import { useEffect, useRef } from "react";

export function useMapTransform() {
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const isClicked = useRef<boolean>(false);
  const isMapMoved = useRef<boolean>(false);

  const coords = useRef<{
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
  }>({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
  });
  const scale = useRef<number>(1);

  useEffect(() => {
    if (!mapRef.current || !inputContainerRef.current) return;

    const map = mapRef.current;
    const container = inputContainerRef.current;

    const sensitivity = 0.05;
    const maxZoom = 3;
    const minZoom = 0.5;

    const onMouseDown = (e: MouseEvent) => {
      isClicked.current = true;
      isMapMoved.current = false;
      coords.current.startX = e.clientX;
      coords.current.startY = e.clientY;
    };

    const onMouseUp = () => {
      isClicked.current = false;
      coords.current.lastX = map.offsetLeft;
      coords.current.lastY = map.offsetTop;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isClicked.current) return;

      const offsetX = e.clientX - coords.current.startX;
      const offsetY = e.clientY - coords.current.startY;

      if (Math.abs(offsetX) > 0 || Math.abs(offsetY) > 0)
        isMapMoved.current = true;

      const nextX = offsetX + coords.current.lastX;
      const nextY = offsetY + coords.current.lastY;

      map.style.left = `${nextX}px`;
      map.style.top = `${nextY}px`;
    };

    const onScroll = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const dir = Math.sign(e.deltaY);
      const speedEqualizer = Math.max(scale.current, 1);

      const zoomAmount = -dir * speedEqualizer * sensitivity;
      let newScale = scale.current + zoomAmount;

      if (newScale > maxZoom) newScale = maxZoom;
      else if (newScale < minZoom) newScale = minZoom;

      let xPos = Number(map.style.left.replace("px", ""));
      let yPos = Number(map.style.top.replace("px", ""));
      const x = (e.clientX - xPos) / scale.current;
      const y = (e.clientY - yPos) / scale.current;
      xPos = e.clientX - x * newScale;
      yPos = e.clientY - y * newScale;

      coords.current.lastX = xPos;
      coords.current.lastY = yPos;
      scale.current = newScale;

      map.style.left = `${xPos}px`;
      map.style.top = `${yPos}px`;
      map.style.scale = `${newScale}`;
    };

    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mouseup", onMouseUp);
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseUp);
    container.addEventListener("wheel", onScroll, { passive: false });

    const cleanup = () => {
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseUp);
      container.removeEventListener("wheel", onScroll);
    };

    return cleanup;
  }, []);
  return {
    mapContainer: mapRef,
    inputContainer: inputContainerRef,
    hasMoved: isMapMoved,
  };
}
