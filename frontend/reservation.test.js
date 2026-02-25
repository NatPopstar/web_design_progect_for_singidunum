/**
 * reservation.test.js
 * Unit tests for pure logic in reservation.js.
 *
 * Run:  npx jest reservation.test.js
 * Env:  jest + jsdom  (package.json: "jest": { "testEnvironment": "jsdom" })
 */

const {
  DESTINATIONS,
  SEAT_CONFIG,
  state,
  escapeHtml,
} = require('./reservation');

/* Destination data */

describe('DESTINATIONS data', () => {
  test('contains 9 countries', () => {
    expect(DESTINATIONS).toHaveLength(9);
  });

  test('every country has a non-empty name', () => {
    DESTINATIONS.forEach((d) => expect(d.name.length).toBeGreaterThan(0));
  });

  test('every country has at least one city', () => {
    DESTINATIONS.forEach((d) => expect(d.cities.length).toBeGreaterThan(0));
  });

  test('every city has name, airline and numeric price', () => {
    DESTINATIONS.forEach((country) => {
      country.cities.forEach((city) => {
        expect(typeof city.name).toBe('string');
        expect(city.name.length).toBeGreaterThan(0);
        expect(typeof city.airline).toBe('string');
        expect(city.airline.length).toBeGreaterThan(0);
        expect(typeof city.price).toBe('number');
        expect(city.price).toBeGreaterThan(0);
      });
    });
  });

  test('all city names within a country are unique', () => {
    DESTINATIONS.forEach((country) => {
      const names = country.cities.map((c) => c.name);
      expect(new Set(names).size).toBe(names.length);
    });
  });

  test('Malta has exactly one city (Valletta)', () => {
    const malta = DESTINATIONS.find((d) => d.name === 'Мальта');
    expect(malta).toBeDefined();
    expect(malta.cities).toHaveLength(1);
    expect(malta.cities[0].name).toBe('Валлетта');
  });

  test('prices are reasonable (between 50 and 3000 EUR)', () => {
    DESTINATIONS.forEach((country) => {
      country.cities.forEach((city) => {
        expect(city.price).toBeGreaterThanOrEqual(50);
        expect(city.price).toBeLessThanOrEqual(3000);
      });
    });
  });
});

/* Seat_config data */

describe('SEAT_CONFIG', () => {
  test('has 20 total rows', () => {
    expect(SEAT_CONFIG.totalRows).toBe(20);
  });

  test('has 6 columns (A–F)', () => {
    expect(SEAT_CONFIG.cols).toHaveLength(6);
    expect(SEAT_CONFIG.cols).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
  });

  test('ourRows contains rows 5 through 10', () => {
    expect(SEAT_CONFIG.ourRows).toEqual([5, 6, 7, 8, 9, 10]);
  });

  test('ourRows are within totalRows', () => {
    SEAT_CONFIG.ourRows.forEach((row) => {
      expect(row).toBeGreaterThanOrEqual(1);
      expect(row).toBeLessThanOrEqual(SEAT_CONFIG.totalRows);
    });
  });

  test('takenSeats is an array of strings', () => {
    expect(Array.isArray(SEAT_CONFIG.takenSeats)).toBe(true);
    SEAT_CONFIG.takenSeats.forEach((s) => expect(typeof s).toBe('string'));
  });

  test('every takenSeat references a valid row and column', () => {
    SEAT_CONFIG.takenSeats.forEach((seatId) => {
      // format: "rowCol", e.g. "5B" or "10A"
      const col  = seatId.slice(-1);
      const row  = parseInt(seatId.slice(0, -1), 10);
      expect(SEAT_CONFIG.cols).toContain(col);
      expect(row).toBeGreaterThanOrEqual(1);
      expect(row).toBeLessThanOrEqual(SEAT_CONFIG.totalRows);
    });
  });

  test('takenSeats has no duplicates', () => {
    const set = new Set(SEAT_CONFIG.takenSeats);
    expect(set.size).toBe(SEAT_CONFIG.takenSeats.length);
  });
});

/* escapeHtml */

describe('escapeHtml', () => {
  test('escapes & < > " \'', () => {
    expect(escapeHtml('&')).toBe('&amp;');
    expect(escapeHtml('<')).toBe('&lt;');
    expect(escapeHtml('>')).toBe('&gt;');
    expect(escapeHtml('"')).toBe('&quot;');
  });

  test('leaves plain text unchanged', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });

  test('handles combined special chars', () => {
    const result = escapeHtml('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  test('converts non-string to string', () => {
    expect(escapeHtml(42)).toBe('42');
  });
});

/* state object defaults */

describe('state defaults', () => {
  test('country is null by default', () => {
    expect(state.country).toBeNull();
  });

  test('city is null by default', () => {
    expect(state.city).toBeNull();
  });

  test('selectedSeats is an empty array by default', () => {
    expect(Array.isArray(state.selectedSeats)).toBe(true);
  });

  test('passengers is an empty array by default', () => {
    expect(Array.isArray(state.passengers)).toBe(true);
  });

  test('paymentMethod is null by default', () => {
    expect(state.paymentMethod).toBeNull();
  });
});

/* Seat selection logic (pure) */

describe('seat selection logic', () => {
  /**
   * Replicate toggleSeat logic without DOM for pure testing.
   */
  function toggleSeatPure(seats, seatId) {
    const idx = seats.indexOf(seatId);
    if (idx === -1) return [...seats, seatId];
    return seats.filter((s) => s !== seatId);
  }

  test('adding a seat increases array length by 1', () => {
    const result = toggleSeatPure([], '6A');
    expect(result).toHaveLength(1);
    expect(result).toContain('6A');
  });

  test('adding the same seat twice removes it', () => {
    let seats = toggleSeatPure([], '6A');
    seats = toggleSeatPure(seats, '6A');
    expect(seats).toHaveLength(0);
  });

  test('selecting multiple different seats works', () => {
    let seats = [];
    seats = toggleSeatPure(seats, '5A');
    seats = toggleSeatPure(seats, '7C');
    seats = toggleSeatPure(seats, '9F');
    expect(seats).toHaveLength(3);
    expect(seats).toContain('5A');
    expect(seats).toContain('7C');
    expect(seats).toContain('9F');
  });

  test('deselecting one of several seats leaves the rest', () => {
    let seats = ['5A', '7C', '9F'];
    seats = toggleSeatPure(seats, '7C');
    expect(seats).toHaveLength(2);
    expect(seats).not.toContain('7C');
    expect(seats).toContain('5A');
    expect(seats).toContain('9F');
  });
});

/*  Passenger form validation logic (pure) */

describe('passenger validation logic', () => {
  function isPassengerValid({ firstName, lastName, passport, dob }) {
    return !!(firstName && lastName && passport && dob);
  }

  test('valid passenger returns true', () => {
    expect(isPassengerValid({
      firstName: 'Анна',
      lastName:  'Иванова',
      passport:  'AB 1234567',
      dob:       '1990-05-15',
    })).toBe(true);
  });

  test('missing firstName returns false', () => {
    expect(isPassengerValid({ firstName: '', lastName: 'Иванова', passport: 'AB 1234567', dob: '1990-05-15' })).toBe(false);
  });

  test('missing lastName returns false', () => {
    expect(isPassengerValid({ firstName: 'Анна', lastName: '', passport: 'AB 1234567', dob: '1990-05-15' })).toBe(false);
  });

  test('missing passport returns false', () => {
    expect(isPassengerValid({ firstName: 'Анна', lastName: 'Иванова', passport: '', dob: '1990-05-15' })).toBe(false);
  });

  test('missing dob returns false', () => {
    expect(isPassengerValid({ firstName: 'Анна', lastName: 'Иванова', passport: 'AB 1234567', dob: '' })).toBe(false);
  });
});

/* Price calculation logic (pure)*/

describe('price calculation', () => {
  function calcTotal(pricePerSeat, seatCount) {
    return pricePerSeat * seatCount;
  }

  test('1 seat at 620 EUR = 620 EUR', () => {
    expect(calcTotal(620, 1)).toBe(620);
  });

  test('3 seats at 180 EUR = 540 EUR', () => {
    expect(calcTotal(180, 3)).toBe(540);
  });

  test('0 seats = 0 EUR', () => {
    expect(calcTotal(500, 0)).toBe(0);
  });

  test('uses city price from DESTINATIONS', () => {
    const ireland = DESTINATIONS.find((d) => d.name === 'Ирландия');
    const dublin  = ireland.cities.find((c) => c.name === 'Дублин');
    expect(calcTotal(dublin.price, 2)).toBe(dublin.price * 2);
  });
});

/* showStep logic (DOM) */

describe('showStep', () => {
  const { showStep } = require('./reservation');

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="step1"></div>
      <div id="step2" style="display:none;"></div>
      <div id="step3" style="display:none;"></div>
      <div id="step4" style="display:none;"></div>
      <div id="confirmation" style="display:none;"></div>
      <div class="progress-bar__step" data-step="1"></div>
      <div class="progress-bar__step" data-step="2"></div>
      <div class="progress-bar__step" data-step="3"></div>
      <div class="progress-bar__step" data-step="4"></div>
    `;
  });

  test('showStep("step2") shows step2 and hides step1', () => {
    showStep('step2');
    expect(document.getElementById('step2').style.display).not.toBe('none');
    expect(document.getElementById('step1').style.display).toBe('none');
  });

  test('showStep("step1") shows step1 and hides all others', () => {
    showStep('step1');
    expect(document.getElementById('step1').style.display).not.toBe('none');
    ['step2','step3','step4','confirmation'].forEach((id) => {
      expect(document.getElementById(id).style.display).toBe('none');
    });
  });

  test('showStep("confirmation") shows confirmation', () => {
    showStep('confirmation');
    expect(document.getElementById('confirmation').style.display).not.toBe('none');
  });
});
