import mongoose from 'mongoose';
import { OrderStatus } from '@mjybtickets/common';

export { OrderStatus };

// An interface that describes the properties
// that are required to create a new Order
interface OrderAttrs {
    id: string;
    status: OrderStatus;
    version: number;
    userId: string;
    price: number;
}

// An interface that describes the properties 
// that a Order document has
interface OrderDoc extends mongoose.Document {
    id: string;
    status: OrderStatus;
    version: number;
    userId: string;
    price: number;
}

// An interface that describes the properties 
// that a Order model has
interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
    findByEvent(event: { id: string, version: number }): Promise<OrderDoc | null>
}

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
    }, 
    {
        optimisticConcurrency: true,
        versionKey: 'version',
        toJSON: {
            transform(doc, ret){
                const { _id, userId, status, price  } = ret;
                return { id: _id, userId, status, price };
            }
        }
    }
);

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order({
        _id: attrs.id,
        status: attrs.status,
        version: attrs.version,
        userId: attrs.userId,
        price: attrs.price,
    });
}

orderSchema.statics.findByEvent = (event: { id: string, version: number}) => {
    return Order.findOne({
        _id: event.id,
        version: event.version - 1,
    })
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
