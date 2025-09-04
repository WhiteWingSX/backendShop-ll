import ticketModel from '../dao/models/ticketModel.js';

class TicketsRepository {
    create(data)     { return ticketModel.create(data); }
    getByCode(code)  { return ticketModel.findOne({ code }); }
}

export default new TicketsRepository();
