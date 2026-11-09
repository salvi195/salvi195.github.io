'use strict';

/* LD11. Kontaktų forma */
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
  const fields = [...contactForm.querySelectorAll('input')];
  const sendButton = contactForm.querySelector('[type="submit"]');
  const result = document.querySelector('#form-result');

  function checkField(field) {
    const value = field.value.trim();
    let error = '';
    if (!value) error = 'Užpildykite šį lauką.';
    else if (['firstName', 'lastName'].includes(field.name) && !/^\p{L}+$/u.test(value)) error = 'Naudokite tik raides.';
    else if (field.type === 'email' && (field.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value.includes('..') || value.startsWith('.') || value.includes('.@'))) error = 'Įveskite tinkamą el. paštą.';
    else if (field.name === 'phone' && !/^\+370 6\d{2} \d{5}$/.test(value)) error = 'Įveskite 8 skaitmenis, prasidedančius 6.';
    else if (field.type === 'number' && (!Number.isInteger(Number(value)) || Number(value) < 1 || Number(value) > 10)) error = 'Įveskite sveiką skaičių nuo 1 iki 10.';
    return error;
  }

  function updateForm() {
    sendButton.disabled = fields.some(field => checkField(field));
  }

  function showError(field) {
    const error = checkField(field);
    document.getElementById(field.id + '-error').textContent = error;
    field.setAttribute('aria-invalid', String(Boolean(error)));
  }

  function formatPhone(field) {
    let digits = field.value.replace(/\D/g, '');
    if (digits.startsWith('370')) digits = digits.slice(3);
    if (digits.startsWith('0')) digits = digits.slice(1);
    digits = digits.slice(0, 8);
    field.value = digits ? '+370 ' + digits.slice(0, 3) + (digits.length > 3 ? ' ' + digits.slice(3) : '') : '';
  }

  fields.forEach(field => {
    field.addEventListener('input', () => {
      if (field.name === 'phone') formatPhone(field);
      showError(field);
      updateForm();
      result.replaceChildren();
    });
    field.addEventListener('blur', () => showError(field));
  });

  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    if (fields.some(field => checkField(field))) {
      fields.forEach(showError);
      updateForm();
      return;
    }
    const data = Object.fromEntries(fields.map(field => [field.name, field.type === 'number' ? Number(field.value) : field.value.trim()]));
    console.log(data);
    result.replaceChildren();
    fields.forEach(field => {
      const line = document.createElement('p');
      line.textContent = field.dataset.label + ': ' + data[field.name];
      result.append(line);
    });
    const average = (data.rating1 + data.rating2 + data.rating3) / 3;
    const line = document.createElement('p');
    line.className = 'rating-average';
    line.textContent = data.firstName + ' ' + data.lastName + ': ' + average.toFixed(2);
    result.append(line);
  });

  contactForm.addEventListener('reset', () => {
    fields.forEach(field => {
      field.removeAttribute('aria-invalid');
      document.getElementById(field.id + '-error').textContent = '';
    });
    result.replaceChildren();
    sendButton.disabled = true;
  });
  updateForm();
}

/* LD12. Įgūdžių pažanga */
const board = document.querySelector('#skill-board');
if (board) {
  const states = ['Planuojama', 'Mokomasi', 'Atlikta'];
  const skills = [
    {name: 'Semantinis HTML', status: 'Atlikta', xp: 30},
    {name: 'CSS išdėstymas', status: 'Mokomasi', xp: 40},
    {name: 'JavaScript pagrindai', status: 'Mokomasi', xp: 50},
    {name: 'DOM valdymas', status: 'Planuojama', xp: 60},
    {name: 'Formų validacija', status: 'Planuojama', xp: 40},
    {name: 'Git ir GitHub', status: 'Atlikta', xp: 30},
    {name: 'Duomenų analizė su Python', status: 'Planuojama', xp: 70},
    {name: 'MATLAB grafikai', status: 'Mokomasi', xp: 50}
  ];
  const storageKey = 'salvija-skill-statuses';
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(saved)) skills.forEach(skill => {
      const item = saved.find(item => item && item.name === skill.name);
      if (item && states.includes(item.status)) skill.status = item.status;
    });
  } catch (error) { console.warn('Nepavyko atkurti pažangos.', error); }

  function saveProgress() {
    try { localStorage.setItem(storageKey, JSON.stringify(skills.map(({name, status}) => ({name, status})))); }
    catch (error) { console.warn('Nepavyko išsaugoti pažangos.', error); }
  }

  function renderSkills() {
    board.replaceChildren();
    states.forEach(state => {
      const column = document.createElement('section');
      column.className = 'skill-column';
      const title = document.createElement('h3');
      title.textContent = state;
      column.append(title);
      skills.forEach((skill, index) => {
        if (skill.status !== state) return;
        const card = document.createElement('article');
        card.className = 'skill-card';
        card.dataset.color = index;
        const heading = document.createElement('h4');
        heading.textContent = skill.name;
        const xp = document.createElement('p');
        xp.textContent = skill.xp + ' XP';
        const select = document.createElement('select');
        select.className = 'form-control';
        select.dataset.skill = index;
        select.setAttribute('aria-label', skill.name + ' – būsena');
        states.forEach(value => {
          const option = document.createElement('option');
          option.value = option.textContent = value;
          select.append(option);
        });
        select.value = skill.status;
        select.addEventListener('change', () => {
          skill.status = select.value;
          saveProgress();
          renderSkills();
          updateProgress();
          board.querySelector('[data-skill="' + index + '"]').focus();
        });
        card.append(heading, xp, select);
        column.append(card);
      });
      board.append(column);
    });
  }

  function updateAvatar(level) {
    let file;
    if (level === 1) file = 'level-1.svg';
    else if (level === 2) file = 'level-2.svg';
    else if (level === 3) file = 'level-3.svg';
    else file = 'level-4.svg';
    const avatar = document.querySelector('#level-avatar');
    avatar.src = 'assets/img/' + file + '?v=avatar-svg-1';
    avatar.alt = 'Avataras – ' + level + ' lygis';
  }

  function updateProgress() {
    const completed = skills.filter(skill => skill.status === 'Atlikta');
    const xp = completed.reduce((sum, skill) => sum + skill.xp, 0);
    let level, rank, start, next;
    if (xp < 50) { level = 1; rank = 'Pradedantysis'; start = 0; next = 50; }
    else if (xp < 150) { level = 2; rank = 'Praktikantas'; start = 50; next = 150; }
    else if (xp < 300) { level = 3; rank = 'Specialistas'; start = 150; next = 300; }
    else { level = 4; rank = 'Profesionalas'; }
    document.querySelector('#xp-total').textContent = xp + ' XP';
    document.querySelector('#rank').textContent = level + ' lygis · ' + rank;
    const percent = level === 4 ? 100 : (xp - start) / (next - start) * 100;
    document.querySelector('#xp-bar').value = percent;
    document.querySelector('#xp-description').textContent = level === 4 ? 'Pasiektas aukščiausias lygis.' : 'Iki kito lygio: ' + (next - xp) + ' XP';
    document.querySelector('#skill-statistics').textContent = 'Iš viso: ' + skills.length + ' · Atlikta: ' + completed.length + ' · ' + Math.round(completed.length / skills.length * 100) + '%';
    updateAvatar(level);
    const conditions = [completed.length >= 1, completed.length >= 4, level === 4];
    document.querySelectorAll('.achievement').forEach((card, index) => {
      card.classList.toggle('unlocked', conditions[index]);
      card.querySelector('span').textContent = conditions[index] ? 'Atrakinta' : 'Neatrakinta';
    });
  }
  renderSkills();
  updateProgress();
}
