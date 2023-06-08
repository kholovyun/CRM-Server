import { EVisitReasons } from "../../enums/EVisitReasons";

export default interface IVisitCreateDto {
    childId: string
    reason: EVisitReasons
    date: Date
    conclusion: string
    appointment: string
}