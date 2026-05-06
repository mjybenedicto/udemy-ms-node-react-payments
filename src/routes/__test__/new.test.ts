import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../models/order';

// TODO: Validation tests for body
it('returns a 404 when purchasing an order that does not exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'asdfg',
            orderId: new mongoose.Types.ObjectId().toHexString(),
        })
        .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 10,
        status: OrderStatus.Created
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .send({
            token: 'asdfg',
            orderId: order.id,
        })
        .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 1,
        price: 10,
        status: OrderStatus.Cancelled
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'asdfg',
            orderId: order.id,
        })
        .expect(400);
});


it('purchases an order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 1,
        price: 10,
        status: OrderStatus.Created
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'asdfg',
            orderId: order.id,
        })
        .expect(200);
});
