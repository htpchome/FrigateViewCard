const isEnglishBaseline = (locale) => locale === "en" || locale === "en-US";

export const resolveDisplayHour12 = (locale, timeFormat) => {
  const preference = String(timeFormat ?? "").trim();
  if (preference === "12") return true;
  if (preference === "24") return false;
  return isEnglishBaseline(locale) ? true : undefined;
};

export const formatLocalizedTime = (
  timestamp,
  { locale = "en", timeFormat = "", formatter },
) => {
  const hour12 = resolveDisplayHour12(locale, timeFormat);
  const options = {
    hour: "numeric",
    minute: "2-digit",
    ...(hour12 === false
      ? { hourCycle: "h23" }
      : hour12 === true
        ? { hour12: true }
        : {}),
  };
  const text = formatter("time", locale, options).format(
    new Date(timestamp * 1000),
  );
  return isEnglishBaseline(locale) ? text.toLowerCase() : text;
};

export const formatLocalizedMonthDay = (
  timestamp,
  {
    locale = "en",
    numeric = false,
    ordinal = false,
    formatter,
    ordinalize = (day) => day,
  },
) => {
  const date = new Date(timestamp * 1000);
  const options = {
    month: numeric ? "numeric" : "short",
    day: "numeric",
  };
  const dateFormatter = formatter(
    numeric ? "month-day-numeric" : "month-day",
    locale,
    options,
  );
  if (!isEnglishBaseline(locale)) return dateFormatter.format(date);
  const parts = dateFormatter.formatToParts(date);
  const month = parts.find((part) => part.type === "month")?.value || "";
  const day = Number(parts.find((part) => part.type === "day")?.value || 0);
  if (numeric) return `${month}/${day}`;
  return `${month} ${ordinal ? ordinalize(day) : day}`.trim();
};
