import mongoose from "mongoose"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledEvent, OrderStatus } from "@mjybtickets/common"
import { Message } from "node-nats-streaming"
import { Order } from "../../../models/order"
import { OrderCancelledListener } from "../order-cancelled-listener"

const setup = async () => {
    // creates an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        version: 0,
        userId: 'asdfg',
        price: 10
    });
    await order.save();

    // create a fake data event 
    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: 'asdfg',
        },
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, order, data, msg };
}

it('updates the status of the order to cancelled', async () => {
    const { listener, data, order, msg } = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // write assertions to make sure ticket was created
    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder).toBeDefined();
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // write assertions to make sure ack function was called
    expect(msg.ack).toHaveBeenCalled();
})
