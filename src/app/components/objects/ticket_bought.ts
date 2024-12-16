export class TicketBought {
    id: string;
    date: string;
    event: object;
    user: object;
    quantity: number;
    total: number;
  

    constructor(id: string, date: string, event: object, user: object, quantity: number, total: number) {
        this.id = id;
        this.date = date;
        this.event = event;
        this.user = user;
        this.quantity = quantity;
        this.total = total;
    }

    get getId() {
        return this.id;
    }

    get getDate() {
        return this.date;
    }

    get getEvent() {
        return this.event;
    }

    get getUser() {
        return this.user;
    }

    get getQuantity() {
        return this.quantity;
    }

    get getTotal() {
        return this.total;
    }

    set setId(id: string) {
        this.id = id;
    }

    set setDate(date: string) {
        this.date = date;
    }

    set setEvent(event: object) {
        this.event = event;
    }

    set setUser(user: object) {
        this.user = user;
    }

    set setQuantity(quantity: number) {
        this.quantity = quantity;
    }

    set setTotal(total: number) {
        this.total = total;
    }

    toString() {
        return `TicketBought: { id: ${this.id}, date: ${this.date}, event: ${this.event}, user: ${this.user}, quantity: ${this.quantity}, total: ${this.total} }`;
    }

}