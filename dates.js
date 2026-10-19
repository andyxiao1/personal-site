// Both dates use fixed EST (UTC−05:00), without daylight saving.
const NON_COMPETE_END = [2027, 1, 18];
const POTATO_BIRTHDAY = [2022, 9, 2];
const HOUR_MS = 60 * 60 * 1000;
const DAY_SECONDS = 24 * 60 * 60;

function addMonths(timestamp, months) {
  const start = new Date(timestamp);
  const target = new Date(timestamp);

  target.setUTCDate(1);
  target.setUTCMonth(target.getUTCMonth() + months);

  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();

  target.setUTCDate(Math.min(start.getUTCDate(), lastDay));
  return target.getTime();
}

function getDuration(start, end) {
  if (end <= start) return [0, 0, 0, 0, 0, 0];

  const from = new Date(start);
  const to = new Date(end);
  let months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    to.getUTCMonth() - from.getUTCMonth();

  if (addMonths(start, months) > end) months--;

  let seconds = Math.floor((end - addMonths(start, months)) / 1000);
  const days = Math.floor(seconds / DAY_SECONDS);
  seconds %= DAY_SECONDS;

  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;

  const minutes = Math.floor(seconds / 60);

  return [
    Math.floor(months / 12),
    months % 12,
    days,
    hours,
    minutes,
    seconds % 60,
  ];
}

function getDateValues(now = new Date()) {
  // Shift to fixed EST calendar fields, independent of the visitor's time zone.
  const currentEst = Math.floor(now.getTime() / 1000) * 1000 - 5 * HOUR_MS;
  const [birthYear, birthMonth, birthDay] = POTATO_BIRTHDAY;
  const [endYear, endMonth, endDay] = NON_COMPETE_END;
  const birthday = Date.UTC(birthYear, birthMonth - 1, birthDay);
  const nonCompeteEnd = Date.UTC(endYear, endMonth - 1, endDay);

  return {
    age: getDuration(birthday, currentEst),
    remaining: getDuration(currentEst, nonCompeteEnd),
    finished: currentEst >= nonCompeteEnd,
  };
}

function renderAge([years, months]) {
  const yearLabel = years === 1 ? 'year' : 'years';
  const monthLabel = months === 1 ? 'month' : 'months';
  const accessibleLabel = `${years} ${yearLabel}, ${months} ${monthLabel}`;

  return `<span class="counter" role="img" aria-label="${accessibleLabel}"><span class="counter-unit">${years}yr</span> <span class="counter-unit">${months}mo</span></span>`;
}

const ageElement = document.getElementById('potato-age');
const nonCompeteElement = document.getElementById('non-compete');

if (ageElement && nonCompeteElement) {
  let ticker;
  let previousAge;

  function renderTicker(remaining) {
    const values = [remaining[0] * 12 + remaining[1], ...remaining.slice(2)];
    const units = ['mo', 'd', 'h', 'm', 's'];
    const names = ['months', 'days', 'hours', 'minutes', 'seconds'];

    if (!ticker) {
      nonCompeteElement.textContent = 'at least until my non-compete runs out in ';
      ticker = document.createElement('span');
      ticker.className = 'countdown';
      ticker.setAttribute('role', 'img');
      ticker.innerHTML = units
        .map(
          (unit) =>
            `<span class="countdown-part" aria-hidden="true"><span class="countdown-value"></span><span class="countdown-label">${unit}</span></span>`,
        )
        .join(' ');
      nonCompeteElement.append(ticker);
    }

    ticker.setAttribute(
      'aria-label',
      values.map((value, index) => `${value} ${names[index]}`).join(', '),
    );

    ticker.querySelectorAll('.countdown-value').forEach((element, index) => {
      const value = String(values[index]);
      element.textContent = index < 2 ? value : value.padStart(2, '0');
    });
  }

  function update() {
    const { age, remaining, finished } = getDateValues();
    const ageKey = `${age[0]}-${age[1]}`;

    if (ageKey !== previousAge) {
      ageElement.innerHTML = renderAge(age);
      previousAge = ageKey;
    }

    if (finished) {
      nonCompeteElement.textContent = 'my non-compete was scheduled to end on January 18, 2027';
      ticker = undefined;
    } else {
      renderTicker(remaining);
    }
  }

  update();
  setInterval(update, 1000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) update();
  });
}
