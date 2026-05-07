import mongoose from 'mongoose';

// An interface that describes the properties
// that are required to create a new Payment
interface PaymentAttrs {
    orderId: string;
    stripeId: string;
}

// An interface that describes the properties 
// that a Payment document has
interface PaymentDoc extends mongoose.Document {
    id: string;
    orderId: string;
    stripeId: string;
}

// An interface that describes the properties 
// that a Order model has
interface PaymentModel extends mongoose.Model<PaymentDoc> {
    build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema(
    {
        orderId: {
            required: true,
            type: String,
        },
        stripeId: {
            required: true,
            type: String,
        }
    }, 
    {
        optimisticConcurrency: true,
        versionKey: 'version',
        toJSON: {
            transform(doc, ret){
                const { _id, orderId, stripeId  } = ret;
                return { id: _id, orderId, stripeId };
            }
        }
    }
);

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
    return new Payment(attrs);
}

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

export { Payment };
