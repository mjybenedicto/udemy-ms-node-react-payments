import mongoose from "mongoose"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedEvent, OrderStatus } from "@mjybtickets/common"
import { Message } from "node-nats-streaming"
import { OrderCreatedListener } from "../order-created-listener"
import { Order } from "../../../models/order"


const setup = async () => {
    // creates an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // create a fake data event 
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        expiresAt: 'asdfg',
        userId: 'asdfg',
        status: OrderStatus.Created,
        ticket: {
            id: 'asdfg',
            price: 10
        },
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg };
}

it('replicates the order info', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // write assertions to make sure ticket was created
    const order = await Order.findById(data.id);

    expect(order).toBeDefined();
    expect(order!.price).toEqual(data.ticket.price);
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // write assertions to make sure ack function was called
    expect(msg.ack).toHaveBeenCalled();
})
