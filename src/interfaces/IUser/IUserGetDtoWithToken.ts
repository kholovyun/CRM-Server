import { ERoles } from "../../enums/ERoles";

export default interface IUserGetDtoWithToken {
    id: string
    role: ERoles
    email: string
    phone: string
    name: string
    surname: string
    patronim: string
    token: string
// eslint-disable-next-line semi
}