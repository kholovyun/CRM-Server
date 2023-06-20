export default interface IChatMessageWithUserGetDto {
    id: string
    createdAt: Date
    text: string
    url: string
    questionId: string
    authorId: string
    users: {
        name: string
        surname: string
        patronim?: string
    }
}