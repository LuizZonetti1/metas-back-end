type Period = "daily" | "weekly" | "monthly";

export function getDateRange(period: Period) {
  const now = new Date();

  let startDate: Date;
  let endDate: Date;

  if (period === "daily") {
    startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);
  }

  else if (period === "weekly") {
    const day = now.getDay(); // 0 = domingo
    const diff = now.getDate() - day;

    startDate = new Date(now.setDate(diff));
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  }

  else {
    // monthly
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
}
