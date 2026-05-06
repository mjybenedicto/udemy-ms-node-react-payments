import express, { Request, Response } from "express";
import { body } from "express-validator";
import { 
    requireAuth, 
    validateRequest, 
    BadRequestError, 
    NotFoundError, 
    NotAuthorizedError,
    OrderStatus
} from "@mjybtickets/common";
import { Order } from "../models/order";

const router = express.Router();

router.post('/api/payments', 
    requireAuth, 
    [
        body('token')
            .not()
            .isEmpty()
            .withMessage('Token is required'),
        body('orderId')
            .not()
            .isEmpty()
            .withMessage('Order ID is required'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { token, orderId } = req.body;

        const order = await Order.findById(orderId);
        if(!order){
            throw new NotFoundError();
        }
        if(order.userId !== req.currentUser!.id){
            throw new NotAuthorizedError();
        }
        if(order.status == OrderStatus.Cancelled){
            throw new BadRequestError('Cannot pay for cancelled order');
        }

        res.send(200);
    }
);

export { router as createChargeRouter };
