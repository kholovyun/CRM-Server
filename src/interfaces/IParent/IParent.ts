import IChildGetDto from "../IChild/IChildGetDto";
import IUserGetDto from "../IUser/IUserGetDto";
import iUserWithSubscribe from "../IUser/iUserWithSubscribe";

export default interface IParent {
        id: string,
        userId: string,
        doctorId: string,
        registerDate: Date,
        isActive: boolean,
        users: iUserWithSubscribe,
        doctors: {
            id: string,
            userId: string,
            photo: string,
            speciality: string,
            placeOfWork: string,
            experience: number,
            isActive: boolean,
            price: string,
            achievements: string,
            degree: string,
            users: IUserGetDto
        },
        children: IChildGetDto[]
}