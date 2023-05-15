export default interface IParentGetDto {
    id: string
    userId: string
    doctorId: string
    registerDate: Date
    isActive: boolean
    users: {
        name: string
        surname: string
        patronim?: string
        email: string
        phone: string
        isBlocked: boolean
    }
}