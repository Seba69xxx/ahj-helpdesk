import TicketService from './api';

const api = new TicketService();
const listElement = document.getElementById('ticket-list');
let currentDeleteId = null;
let currentEditId = null;

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
  }).replace(',', '');
}

function renderTicket(ticket) {
  const ticketEl = document.createElement('div');
  ticketEl.classList.add('ticket-wrapper');
  
  ticketEl.innerHTML = `
    <div class="ticket" data-id="${ticket.id}">
      <div class="ticket-status ${ticket.status ? 'done' : ''}"></div>
      <div class="ticket-content">
        <div class="ticket-name">${ticket.name}</div>
      </div>
      <div class="ticket-date">${formatDate(ticket.created)}</div>
      <div class="ticket-actions">
        <button class="action-btn edit-btn">✎</button>
        <button class="action-btn delete-btn">x</button>
      </div>
    </div>
    <div class="ticket-details" id="details-${ticket.id}"></div>
  `;
  return ticketEl;
}

async function loadTickets() {
  listElement.innerHTML = '';
  try {
    const tickets = await api.list();
    tickets.forEach(ticket => {
      listElement.appendChild(renderTicket(ticket));
    });
  } catch (e) {
    console.error('Server error', e);
  }
}

listElement.addEventListener('click', async (e) => {
  const ticketEl = e.target.closest('.ticket');
  if (!ticketEl) return;
  const id = ticketEl.dataset.id;

  if (e.target.classList.contains('ticket-status')) {
    e.stopPropagation();
    const isDone = e.target.classList.contains('done');
    await api.update(id, { status: !isDone });
    loadTickets();
    return;
  }

  if (e.target.classList.contains('edit-btn')) {
    e.stopPropagation();
    currentEditId = id;
    const ticket = await api.get(id);
    document.getElementById('modal-title').textContent = 'Изменить тикет';
    document.getElementById('ticket-name').value = ticket.name;
    document.getElementById('ticket-description').value = ticket.description;
    document.getElementById('ticket-modal').style.display = 'flex';
    return;
  }

  if (e.target.classList.contains('delete-btn')) {
    e.stopPropagation();
    currentDeleteId = id;
    document.getElementById('delete-modal').style.display = 'flex';
    return;
  }

  const detailsEl = document.getElementById(`details-${id}`);
  if (detailsEl.style.display === 'block') {
    detailsEl.style.display = 'none';
  } else {
    if (!detailsEl.textContent) {
      const fullTicket = await api.get(id);
      detailsEl.textContent = fullTicket.description;
    }
    detailsEl.style.display = 'block';
  }
});

const ticketModal = document.getElementById('ticket-modal');
const ticketForm = document.getElementById('ticket-form');

document.getElementById('add-ticket-btn').addEventListener('click', () => {
  currentEditId = null;
  document.getElementById('modal-title').textContent = 'Добавить тикет';
  ticketForm.reset();
  ticketModal.style.display = 'flex';
});

document.getElementById('modal-cancel').addEventListener('click', () => {
  ticketModal.style.display = 'none';
});

ticketForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('ticket-name').value;
  const description = document.getElementById('ticket-description').value;

  if (currentEditId) {
    await api.update(currentEditId, { name, description });
  } else {
    await api.create({ name, description });
  }

  ticketModal.style.display = 'none';
  loadTickets();
});

const deleteModal = document.getElementById('delete-modal');

document.getElementById('delete-cancel').addEventListener('click', () => {
  deleteModal.style.display = 'none';
  currentDeleteId = null;
});

document.getElementById('delete-confirm').addEventListener('click', async () => {
  if (currentDeleteId) {
    await api.delete(currentDeleteId);
    loadTickets();
  }
  deleteModal.style.display = 'none';
});

loadTickets();