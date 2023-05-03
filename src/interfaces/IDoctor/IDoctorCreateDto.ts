export default interface IDoctorCreateDto {
    userId: string
    photo: string | File | undefined
    speciality: string
    placeOfWork: string
    experience: number
    isActive: boolean
    achievements?: string
    degree?: string
}