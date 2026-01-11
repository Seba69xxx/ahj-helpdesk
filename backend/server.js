const Koa = require('koa');
const { koaBody } = require('koa-body');
const cors = require('@koa/cors');
const { v4: uuidv4 } = require('uuid');

const app = new Koa();

app.use(cors());
app.use(koaBody({
  urlencoded: true,
  multipart: true,
  json: true,
}));

const tickets = [
  {
    id: uuidv4(),
    name: 'Поменять картридж в принтере',
    description: 'Принтер в бухгалтерии (HP LaserJet 1020) начал печатать полосы.',
    status: false,
    created: Date.now(),
  },
];

app.use(async (ctx) => {
  const { method, id } = ctx.request.query;

  if (ctx.request.method === 'GET') {
    if (method === 'allTickets') {
      ctx.response.body = tickets.map(t => ({
        id: t.id,
        name: t.name,
        status: t.status,
        created: t.created
      }));
      return;
    }

    if (method === 'ticketById' && id) {
      const ticket = tickets.find(t => t.id === id);
      if (ticket) {
        ctx.response.body = ticket;
      } else {
        ctx.response.status = 404;
      }
      return;
    }

    if (method === 'deleteById' && id) {
        const index = tickets.findIndex(t => t.id === id);
        if (index !== -1) {
            tickets.splice(index, 1);
            ctx.response.status = 204;
        } else {
            ctx.response.status = 404;
        }
        return;
    }
  }

  if (ctx.request.method === 'POST') {
    if (method === 'createTicket') {
      const { name, description } = ctx.request.body;
      const newTicket = {
        id: uuidv4(),
        name,
        description: description || '',
        status: false,
        created: Date.now(),
      };
      tickets.push(newTicket);
      ctx.response.body = newTicket;
      return;
    }

    if (method === 'updateById' && id) {
      const { name, description, status } = ctx.request.body;
      const ticket = tickets.find(t => t.id === id);
      if (ticket) {
        if (name) ticket.name = name;
        if (description) ticket.description = description;
        if (status !== undefined) ticket.status = status;
        ctx.response.body = ticket;
      } else {
        ctx.response.status = 404;
      }
      return;
    }
  }

  ctx.response.status = 404;
});

const port = 7070;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});