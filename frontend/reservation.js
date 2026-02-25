/**
 * reservation.js
 * Multi-step flight reservation UI (frontend only — no real payments/booking).
 *
 * Steps:
 *   1. Destination  — country → city → auto airline
 *   2. Seat map     — click to select/deselect our reserved seats
 *   3. Passengers   — one form block per selected seat
 *   4. Payment      — choose payment method + summary
 *   Confirmation    — success screen
 */

/* Data */

/**
 * @typedef {object} City
 * @property {string} name
 * @property {string} airline  - Auto-assigned airline for this city.
 * @property {number} price    - Price per seat in EUR.
 */

/**
 * @typedef {object} Country
 * @property {string} name
 * @property {City[]} cities
 */

/** @type {Country[]} */
const DESTINATIONS = [
  {
    name: 'США',
    cities: [
      { name: 'Нью-Йорк',     airline: 'Air Serbia + Delta Air Lines',    price: 620 },
      { name: 'Лос-Анджелес', airline: 'Air Serbia + United Airlines',     price: 680 },
      { name: 'Майами',       airline: 'Turkish Airlines + American',      price: 710 },
      { name: 'Чикаго',       airline: 'Lufthansa + United Airlines',      price: 590 },
    ],
  },
  {
    name: 'Канада',
    cities: [
      { name: 'Торонто',  airline: 'Air Serbia + Air Canada',  price: 540 },
      { name: 'Ванкувер', airline: 'Lufthansa + Air Canada',   price: 610 },
      { name: 'Монреаль', airline: 'Air France + Air Canada',  price: 520 },
    ],
  },
  {
    name: 'Ирландия',
    cities: [
      { name: 'Дублин',  airline: 'Ryanair',                 price: 180 },
      { name: 'Корк',    airline: 'Aer Lingus',              price: 195 },
      { name: 'Шеннон',  airline: 'Ryanair',                 price: 175 },
    ],
  },
  {
    name: 'Англия',
    cities: [
      { name: 'Лондон',    airline: 'Air Serbia + British Airways', price: 210 },
      { name: 'Манчестер', airline: 'Wizz Air',                     price: 185 },
    ],
  },
  {
    name: 'Австралия',
    cities: [
      { name: 'Сидней',   airline: 'Emirates + Qantas',       price: 1100 },
      { name: 'Мельбурн', airline: 'Singapore Airlines + Qantas', price: 1150 },
    ],
  },
  {
    name: 'Новая Зеландия',
    cities: [
      { name: 'Окленд',     airline: 'Singapore Airlines + Air NZ', price: 1250 },
      { name: 'Веллингтон', airline: 'Emirates + Air NZ',           price: 1280 },
    ],
  },
  {
    name: 'Мальта',
    cities: [
      { name: 'Валлетта', airline: 'Ryanair', price: 145 },
    ],
  },
  {
    name: 'Сингапур',
    cities: [
      { name: 'Сингапур', airline: 'Singapore Airlines', price: 760 },
    ],
  },
  {
    name: 'Шотландия',
    cities: [
      { name: 'Эдинбург',  airline: 'Wizz Air',   price: 190 },
      { name: 'Глазго',    airline: 'Ryanair',     price: 175 },
      { name: 'Инвернесс', airline: 'easyJet',     price: 200 },
    ],
  },
];

/**
 * Seat configuration.
 * Our company pre-purchases rows 5–10 (seats A–F).
 * Some seats within those rows are pre-marked as taken (demo).
 */
const SEAT_CONFIG = {
  totalRows:   20,
  cols:        ['A', 'B', 'C', 'D', 'E', 'F'],
  /** Rows owned by Natalia's Birds (1-indexed). */
  ourRows:     [5, 6, 7, 8, 9, 10],
  /** Seats already booked — format "rowCol", e.g. "5B". */
  takenSeats:  ['5A', '6C', '7F', '8B', '9D', '10A', '10E'],
};

/* State */

const state = {
  country:       null,   // Country object
  city:          null,   // City object
  selectedSeats: [],     // Array of seat ids, e.g. ["6A", "7C"]
  passengers:    [],     // Array of { firstName, lastName, passport, dob }
  paymentMethod: null,   // string
};

/* Utility */

/**
 * Show one step section, hide all others.
 * @param {string} stepId - id of the section to show.
 */
function showStep(stepId) {
  ['step1','step2','step3','step4','confirmation'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === stepId ? '' : 'none';
  });
  updateProgressBar(stepId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Mark progress bar steps as active / done.
 * @param {string} currentStepId
 */
function updateProgressBar(currentStepId) {
  const stepNumber = { step1: 1, step2: 2, step3: 3, step4: 4 };
  const current = stepNumber[currentStepId] ?? 0;

  document.querySelectorAll('.progress-bar__step').forEach((el) => {
    const n = parseInt(el.dataset.step, 10);
    el.classList.toggle('progress-bar__step--active', n === current);
    el.classList.toggle('progress-bar__step--done',   n < current);
  });
}

/**
 * Escape HTML to prevent XSS when injecting user text.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* Step 1 - destination */

function initStep1() {
  const countrySelect  = document.getElementById('selectCountry');
  const cityWrapper    = document.getElementById('cityFieldWrapper');
  const citySelect     = document.getElementById('selectCity');
  const airlineCard    = document.getElementById('airlineCard');
  const airlineName    = document.getElementById('airlineName');
  const nextBtn        = document.getElementById('step1Next');

  if (!countrySelect) return;

  // Populate country options
  DESTINATIONS.forEach((dest) => {
    const opt = document.createElement('option');
    opt.value = dest.name;
    opt.textContent = dest.name;
    countrySelect.appendChild(opt);
  });

  countrySelect.addEventListener('change', () => {
    const found = DESTINATIONS.find((d) => d.name === countrySelect.value);
    state.country = found ?? null;
    state.city    = null;

    // Reset city select
    citySelect.innerHTML = '<option value="">— выберите город —</option>';
    airlineCard.style.display = 'none';
    nextBtn.disabled = true;

    if (!found) {
      cityWrapper.style.display = 'none';
      return;
    }

    found.cities.forEach((city) => {
      const opt = document.createElement('option');
      opt.value = city.name;
      opt.textContent = city.name;
      citySelect.appendChild(opt);
    });
    cityWrapper.style.display = '';
  });

  citySelect.addEventListener('change', () => {
    const cityData = state.country?.cities.find((c) => c.name === citySelect.value) ?? null;
    state.city = cityData;

    if (cityData) {
      airlineName.textContent   = cityData.airline;
      airlineCard.style.display = '';
      nextBtn.disabled          = false;
    } else {
      airlineCard.style.display = 'none';
      nextBtn.disabled          = true;
    }
  });

  nextBtn.addEventListener('click', () => {
    renderSeatMap();
    showStep('step2');
  });
}

/* Step 2 -seat */

/**
 * Build the full seat map and inject it into #seatMap.
 */
function renderSeatMap() {
  const container = document.getElementById('seatMap');
  if (!container) return;

  const { totalRows, cols, ourRows, takenSeats } = SEAT_CONFIG;

  // Column headers row
  const headerRow = document.createElement('div');
  headerRow.className = 'seatmap__col-headers';
  // empty space for row-number column
  const spacer = document.createElement('div');
  spacer.style.width = '22px';
  headerRow.appendChild(spacer);

  cols.forEach((col, i) => {
    if (i === 3) {
      const aisle = document.createElement('div');
      aisle.className = 'seatmap__aisle';
      headerRow.appendChild(aisle);
    }
    const lbl = document.createElement('div');
    lbl.className = 'seatmap__col-label';
    lbl.textContent = col;
    headerRow.appendChild(lbl);
  });
  container.innerHTML = '';
  container.appendChild(headerRow);

  // Seat rows
  for (let row = 1; row <= totalRows; row++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'seatmap__row';

    const rowLbl = document.createElement('div');
    rowLbl.className = 'seatmap__row-label';
    rowLbl.textContent = row;
    rowEl.appendChild(rowLbl);

    cols.forEach((col, i) => {
      if (i === 3) {
        const aisle = document.createElement('div');
        aisle.className = 'seatmap__aisle';
        rowEl.appendChild(aisle);
      }

      const seatId = `${row}${col}`;
      const isOurs  = ourRows.includes(row);
      const isTaken = takenSeats.includes(seatId);

      const btn = document.createElement('button');
      btn.className = 'seat';
      btn.textContent = col;
      btn.dataset.seatId = seatId;
      btn.setAttribute('aria-label', `Место ${seatId}`);

      if (isTaken) {
        btn.classList.add('seat--taken');
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
      } else if (isOurs) {
        btn.classList.add('seat--ours');
        btn.addEventListener('click', () => toggleSeat(seatId, btn));
      } else {
        btn.classList.add('seat--other');
        btn.disabled = true;
        btn.title = 'Место не входит в пул Natalia\'s Birds';
      }

      rowEl.appendChild(btn);
    });

    container.appendChild(rowEl);
  }
}

/**
 * Toggle a seat's selected state.
 * @param {string} seatId
 * @param {HTMLElement} btn
 */
function toggleSeat(seatId, btn) {
  const idx = state.selectedSeats.indexOf(seatId);
  if (idx === -1) {
    state.selectedSeats.push(seatId);
    btn.classList.remove('seat--ours');
    btn.classList.add('seat--selected');
  } else {
    state.selectedSeats.splice(idx, 1);
    btn.classList.remove('seat--selected');
    btn.classList.add('seat--ours');
  }

  updateSeatSummary();
  document.getElementById('step2Next').disabled = state.selectedSeats.length === 0;
}

/** Update the "Selected: ..." text below the seat map. */
function updateSeatSummary() {
  const el = document.getElementById('selectedSeatsSummary');
  if (!el) return;
  el.textContent = state.selectedSeats.length
    ? `Выбрано: ${state.selectedSeats.sort().join(', ')}`
    : '';
}

function initStep2() {
  document.getElementById('step2Back')?.addEventListener('click', () => showStep('step1'));
  document.getElementById('step2Next')?.addEventListener('click', () => {
    renderPassengerForms();
    showStep('step3');
  });
}

/* Step 3 - passenger forms */

function renderPassengerForms() {
  const container = document.getElementById('passengerForms');
  if (!container) return;

  container.innerHTML = state.selectedSeats.sort().map((seat, i) => `
    <div class="passenger-block" id="passenger-block-${i}">
      <h3 class="passenger-block__heading">
        Пассажир ${i + 1} — место ${seat}
      </h3>
      <div class="passenger-block__grid">
        <div class="res-field">
          <label class="res-field__label" for="p${i}firstName">Имя</label>
          <input class="res-field__input" id="p${i}firstName" type="text" placeholder="Имя" required />
        </div>
        <div class="res-field">
          <label class="res-field__label" for="p${i}lastName">Фамилия</label>
          <input class="res-field__input" id="p${i}lastName" type="text" placeholder="Фамилия" required />
        </div>
        <div class="res-field">
          <label class="res-field__label" for="p${i}passport">Номер паспорта</label>
          <input class="res-field__input" id="p${i}passport" type="text" placeholder="AB 1234567" required />
        </div>
        <div class="res-field">
          <label class="res-field__label" for="p${i}dob">Дата рождения</label>
          <input class="res-field__input" id="p${i}dob" type="date" required />
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Collect passenger data from forms.
 * @returns {{ valid: boolean, passengers: object[] }}
 */
function collectPassengers() {
  const passengers = [];
  let valid = true;

  state.selectedSeats.sort().forEach((seat, i) => {
    const firstName = document.getElementById(`p${i}firstName`)?.value.trim();
    const lastName  = document.getElementById(`p${i}lastName`)?.value.trim();
    const passport  = document.getElementById(`p${i}passport`)?.value.trim();
    const dob       = document.getElementById(`p${i}dob`)?.value;

    if (!firstName || !lastName || !passport || !dob) valid = false;

    passengers.push({ seat, firstName, lastName, passport, dob });
  });

  return { valid, passengers };
}

function initStep3() {
  document.getElementById('step3Back')?.addEventListener('click', () => showStep('step2'));
  document.getElementById('step3Next')?.addEventListener('click', () => {
    const { valid, passengers } = collectPassengers();
    if (!valid) {
      alert('Пожалуйста, заполните все поля для каждого пассажира.');
      return;
    }
    state.passengers = passengers;
    renderBookingSummary();
    showStep('step4');
  });
}

/* Step 4 - payment */

function renderBookingSummary() {
  const container = document.getElementById('bookingSummary');
  if (!container || !state.city) return;

  const count     = state.selectedSeats.length;
  const unitPrice = state.city.price;
  const total     = count * unitPrice;

  container.innerHTML = `
    <div class="booking-summary__row">
      <span>Направление</span>
      <span>${escapeHtml(state.country.name)} — ${escapeHtml(state.city.name)}</span>
    </div>
    <div class="booking-summary__row">
      <span>Авиакомпания</span>
      <span>${escapeHtml(state.city.airline)}</span>
    </div>
    <div class="booking-summary__row">
      <span>Места</span>
      <span>${state.selectedSeats.sort().join(', ')}</span>
    </div>
    <div class="booking-summary__row">
      <span>Пассажиров</span>
      <span>${count}</span>
    </div>
    <div class="booking-summary__row">
      <span>Цена за место</span>
      <span>${unitPrice} EUR</span>
    </div>
    <div class="booking-summary__row">
      <span>Итого</span>
      <span>${total} EUR</span>
    </div>
  `;
}

function initStep4() {
  const reserveBtn = document.getElementById('reserveBtn');

  // Enable reserve button only when payment method selected
  document.querySelectorAll('.payment-card__radio').forEach((radio) => {
    radio.addEventListener('change', () => {
      state.paymentMethod = radio.value;
      if (reserveBtn) reserveBtn.disabled = false;
    });
  });

  document.getElementById('step4Back')?.addEventListener('click', () => showStep('step3'));

  reserveBtn?.addEventListener('click', () => {
    showConfirmation();
  });
}

/* Confirmation */

function showConfirmation() {
  const el = document.getElementById('confirmationText');
  if (el && state.city && state.passengers.length) {
    const firstName = escapeHtml(state.passengers[0].firstName);
    const seats     = state.selectedSeats.sort().join(', ');
    const method    = escapeHtml(state.paymentMethod ?? '');
    el.innerHTML = `
      Дорогой(-ая) <strong>${firstName}</strong>!<br/>
      Ваш запрос на резервирование мест <strong>${seats}</strong>
      рейсом <strong>${escapeHtml(state.city.airline)}</strong>
      до <strong>${escapeHtml(state.city.name)}, ${escapeHtml(state.country.name)}</strong>
      принят.<br/>
      Способ оплаты: <strong>${method}</strong>.<br/><br/>
      Наш менеджер свяжется с вами в ближайшее время для подтверждения.
    `;
  }
  showStep('confirmation');
}

/* Bootstrap */

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('step1')) return;
  initStep1();
  initStep2();
  initStep3();
  initStep4();
  showStep('step1');
});

/* Exports */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DESTINATIONS,
    SEAT_CONFIG,
    state,
    escapeHtml,
    toggleSeat,
    updateSeatSummary,
    collectPassengers,
    showStep,
  };
}
