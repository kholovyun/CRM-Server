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
<<<<<<< HEAD
// eslint-disable-next-line semi
=======
>>>>>>> 95c5e962264f843a4ed9203ef4ffba40d140e9ec
}