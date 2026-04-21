import type { HTMLAttributes, ReactNode } from "react";
import type { SkeletonProps } from "react-loading-skeleton";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

type RenderValueOptions = {
  skeletonProps?: SkeletonProps;
  noDataProps?: HTMLAttributes<HTMLSpanElement>;
};

export function renderValue<T>(
  value: T | null | undefined,
  noData: ReactNode = "–",
  render?: (value: T) => ReactNode,
  options?: RenderValueOptions,
): ReactNode {
  if (value === undefined) return <Skeleton {...options?.skeletonProps} />;
  if (value === null)
    return (
      <span {...(options?.noDataProps ?? { className: "no-data" })}>
        {noData}
      </span>
    );
  return render ? render(value) : String(value);
}
