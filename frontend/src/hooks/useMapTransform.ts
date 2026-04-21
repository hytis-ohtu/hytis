import { useEffect, useRef } from "react";

export const WHEEL_SENSITIVITY = 0.05;
export const BUTTON_SENSITIVITY = 0.25;
export const MAX_ZOOM = 4;
export const MIN_ZOOM = 0.75;
export const DEFAULT_SCALE = 0.9;
export const MOVE_THRESHOLD = 20;

export function getLeftBound(): number {
  return window.innerWidth / 8;
}
export function getRightBound(): number {
  return (window.innerWidth / 4) * 3;
}
export function getTopBound(): number {
  return window.innerHeight / 2;
}
export function getBottomBound(): number {
  return window.innerHeight / 2;
}

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
  const scale = useRef<number>(DEFAULT_SCALE);

  function handleButtonZoom(zoom: boolean) {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const speedEqualizer = Math.max(scale.current, 1);
    const zoomAmount = zoom
      ? speedEqualizer * BUTTON_SENSITIVITY
      : -speedEqualizer * BUTTON_SENSITIVITY;

    let newScale = scale.current + zoomAmount;

    newScale = Math.min(Math.max(newScale, MIN_ZOOM), MAX_ZOOM);

    let xPos = Number(map.style.left.replace("px", ""));
    let yPos = Number(map.style.top.replace("px", ""));
    const x = (centerX - xPos) / scale.current;
    const y = (centerY - yPos) / scale.current;
    xPos = centerX - x * newScale;
    yPos = centerY - y * newScale;

    scale.current = newScale;

    const width = window.innerWidth * scale.current;
    const height = window.innerHeight * scale.current;

    if (xPos > getLeftBound()) {
      xPos = getLeftBound();
    } else if (xPos + width < getRightBound()) {
      xPos = getRightBound() - width;
    }

    if (yPos > getTopBound()) {
      yPos = getTopBound();
    } else if (yPos + height < getBottomBound()) {
      yPos = getBottomBound() - height;
    }

    coords.current.lastX = xPos;
    coords.current.lastY = yPos;

    map.style.left = `${xPos}px`;
    map.style.top = `${yPos}px`;
    map.style.scale = `${newScale}`;
  }

  function setHover(state: boolean) {
    const roomElements = document.querySelectorAll("path[data-room]");

    for (const element of roomElements) {
      if (!(element instanceof SVGElement)) continue;

      if (state) element.style.pointerEvents = `all`;
      else element.style.pointerEvents = `none`;
    }
  }

  useEffect(() => {
    if (!mapRef.current || !inputContainerRef.current) return;

    const map = mapRef.current;
    const container = inputContainerRef.current;
    map.style.left = `${0}px`;
    map.style.top = `${0}px`;
    map.style.scale = `${DEFAULT_SCALE}`;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;

      isClicked.current = true;
      isMapMoved.current = false;
      coords.current.startX = e.clientX;
      coords.current.startY = e.clientY;
    };

    const onMouseUp = () => {
      if (!isClicked) return;

      isClicked.current = false;
      coords.current.lastX = map.offsetLeft;
      coords.current.lastY = map.offsetTop;

      setHover(true);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isClicked.current) return;

      e.preventDefault();
      e.stopPropagation();

      const offsetX = e.clientX - coords.current.startX;
      const offsetY = e.clientY - coords.current.startY;

      if (!isMapMoved.current) {
        const dist = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
        if (dist > MOVE_THRESHOLD) {
          setHover(false);
          isMapMoved.current = true;
        }
      }

      let nextX = offsetX + coords.current.lastX;
      let nextY = offsetY + coords.current.lastY;

      const width = window.innerWidth * scale.current;
      const height = window.innerHeight * scale.current;

      if (nextX > getLeftBound()) {
        coords.current.lastX -= nextX - getLeftBound();
        nextX = getLeftBound();
      } else if (nextX + width < getRightBound()) {
        coords.current.lastX -= nextX + width - getRightBound();
        nextX = getRightBound() - width;
      }

      if (nextY > getTopBound()) {
        coords.current.lastY -= nextY - getTopBound();
        nextY = getTopBound();
      } else if (nextY + height < getBottomBound()) {
        coords.current.lastY -= nextY + height - getBottomBound();
        nextY = getBottomBound() - height;
      }

      map.style.left = `${nextX}px`;
      map.style.top = `${nextY}px`;
    };

    const onScroll = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const dir = Math.sign(e.deltaY);
      const speedEqualizer = Math.max(scale.current, 1);

      const zoomAmount = -dir * speedEqualizer * WHEEL_SENSITIVITY;
      let newScale = scale.current + zoomAmount;

      if (newScale > MAX_ZOOM) newScale = MAX_ZOOM;
      else if (newScale < MIN_ZOOM) newScale = MIN_ZOOM;

      let xPos = Number(map.style.left.replace("px", ""));
      let yPos = Number(map.style.top.replace("px", ""));
      const x = (e.clientX - xPos) / scale.current;
      const y = (e.clientY - yPos) / scale.current;
      xPos = e.clientX - x * newScale;
      yPos = e.clientY - y * newScale;

      scale.current = newScale;

      const width = window.innerWidth * scale.current;
      const height = window.innerHeight * scale.current;

      if (xPos > getLeftBound()) {
        xPos = getLeftBound();
      } else if (xPos + width < getRightBound()) {
        xPos = getRightBound() - width;
      }

      if (yPos > getTopBound()) {
        yPos = getTopBound();
      } else if (yPos + height < getBottomBound()) {
        yPos = getBottomBound() - height;
      }

      coords.current.lastX = xPos;
      coords.current.lastY = yPos;

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
    handleZoom: handleButtonZoom,
  };
}
