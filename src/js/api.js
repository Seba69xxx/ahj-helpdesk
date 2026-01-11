export default class TicketService {
  constructor() {
    this.url = 'http://localhost:7070'; 
  }

  async list() {
    const response = await fetch(`${this.url}?method=allTickets`);
    return await response.json();
  }

  async get(id) {
    const response = await fetch(`${this.url}?method=ticketById&id=${id}`);
    return await response.json();
  }

  async create(data) {
    const response = await fetch(`${this.url}?method=createTicket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  async update(id, data) {
    const response = await fetch(`${this.url}?method=updateById&id=${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  async delete(id) {
    await fetch(`${this.url}?method=deleteById&id=${id}`);
  }
}