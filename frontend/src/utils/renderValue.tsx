import type { ReactNode } from "react";
import type { SkeletonProps } from "react-loading-skeleton";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

type RenderValueOptions = {
  skeletonProps?: SkeletonProps;
};

export function renderValue<T>(
  value: T | null | undefined,
  render: (value: T) => ReactNode,
  noData: ReactNode = "-",
  options?: RenderValueOptions,
): ReactNode {
  if (value === undefined) return <Skeleton {...options?.skeletonProps} />;
  if (value === null) return noData;
  return render(value);
}
