const DateTimeNow = () => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");

    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const thisMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01T00:00`;
    const lastMonth = `${now.getFullYear()}-${pad(now.getMonth())}-01T00:00`;
    const thisYear = `${now.getFullYear()}-01-01T00:00`;
    const lastYear = `${now.getFullYear() - 1}-01-01T00:00`;

    const thisTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    return { today, thisMonth, lastMonth, thisYear, lastYear, thisTime };
};

export default DateTimeNow;
