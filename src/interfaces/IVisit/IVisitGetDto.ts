import { EVisitReasons } from "../../enums/EVisitReasons";

export default interface IVisitGetDto {
    id: string
    childId: string
    reason: EVisitReasons
    date: Date
    conclusion: string
    appointment: string
}