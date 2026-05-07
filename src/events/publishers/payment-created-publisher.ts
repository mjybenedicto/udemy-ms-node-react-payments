import { PaymentCreatedEvent, Publisher, Subjects } from "@mjybtickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
    readonly subject = Subjects.PaymentCreated;
}
