export type ContractDateState =
  | "invalid"
  | "openEnded"
  | "upcoming"
  | "active"
  | "ended";

export interface ContractDateMeta {
  startDate: Date | null;
  endDate: Date | null;
  daysUntilStart: number | null;
  daysUntilEnd: number | null;
  state: ContractDateState;
  progress: number;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function toStartOfDayTimestamp(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

function parseContractDate(dateString: string): Date | null {
  const parsedDate = new Date(dateString);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function calculateDaysUntil(
  targetDate: Date | null,
  nowTimestamp: number,
): number | null {
  if (targetDate === null) {
    return null;
  }

  const targetTimestamp = toStartOfDayTimestamp(targetDate);
  return Math.floor((targetTimestamp - nowTimestamp) / MS_PER_DAY);
}

function getTimelineProgress(
  startDate: Date | null,
  endDate: Date | null,
): number {
  if (startDate === null || endDate === null) {
    return 0;
  }

  const startTimestamp = toStartOfDayTimestamp(startDate);
  const endTimestamp = toStartOfDayTimestamp(endDate);
  const totalDuration = endTimestamp - startTimestamp;

  if (totalDuration <= 0) {
    return 0;
  }

  const now = Date.now();
  const elapsedDuration = now - startTimestamp;

  return Math.min(1, Math.max(0, elapsedDuration / totalDuration));
}

function getContractDateState(
  daysUntilStart: number | null,
  daysUntilEnd: number | null,
  hasStartDate: boolean,
  hasEndDate: boolean,
): ContractDateState {
  if (
    hasStartDate &&
    hasEndDate &&
    daysUntilStart !== null &&
    daysUntilEnd !== null
  ) {
    if (daysUntilStart > 0) {
      return "upcoming";
    }
    if (daysUntilEnd < 0) {
      return "ended";
    }
    return "active";
  }

  if (!hasStartDate && !hasEndDate) {
    return "invalid";
  }

  if (!hasEndDate) {
    if (daysUntilStart !== null && daysUntilStart > 0) {
      return "upcoming";
    }
    return "openEnded";
  }

  if (!hasStartDate && daysUntilEnd !== null) {
    return daysUntilEnd < 0 ? "ended" : "active";
  }

  return "invalid";
}

export function getContractDateMeta(
  startDateString: string | null,
  endDateString: string | null,
  now: Date = new Date(),
): ContractDateMeta {
  const startDate =
    startDateString !== null ? parseContractDate(startDateString) : null;
  const endDate =
    endDateString !== null ? parseContractDate(endDateString) : null;
  const nowTimestamp = toStartOfDayTimestamp(now);

  const daysUntilStart = calculateDaysUntil(startDate, nowTimestamp);
  const daysUntilEnd = calculateDaysUntil(endDate, nowTimestamp);
  const state = getContractDateState(
    daysUntilStart,
    daysUntilEnd,
    startDate !== null,
    endDate !== null,
  );

  const progress = getTimelineProgress(startDate, endDate);

  return {
    startDate,
    endDate,
    daysUntilStart,
    daysUntilEnd,
    state,
    progress,
  };
}

export function formatContractDate(
  date: Date | null,
  locale = "fi-FI",
): string {
  if (date === null) {
    return "--.--.----";
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatContractStatus(meta: ContractDateMeta): string {
  const { daysUntilStart, daysUntilEnd, state } = meta;

  if (daysUntilStart !== null && daysUntilStart === 0) {
    return "Alkaa tänään";
  }

  if (state === "upcoming" && daysUntilStart !== null) {
    return `Alkaa ${daysUntilStart} pv kuluttua`;
  }

  if (state === "active" && daysUntilEnd !== null) {
    if (daysUntilEnd === 0) {
      return "Päättyy tänään";
    }

    if (daysUntilEnd > 0) {
      return `Päättyy ${daysUntilEnd} pv kuluttua`;
    }
  }

  if (state === "ended" && daysUntilEnd !== null) {
    return `Päättyi ${Math.abs(daysUntilEnd)} pv sitten`;
  }

  if (daysUntilStart !== null && daysUntilStart < 0) {
    return `Alkanut ${Math.abs(daysUntilStart)} pv sitten`;
  }

  return "Voimassa toistaiseksi";
}
