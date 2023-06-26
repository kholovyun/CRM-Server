import {EPaymentType} from "../../enums/EPaymentType";

export default interface ISubscriptionGetDto {
    type: number;
    paymentType: EPaymentType
}