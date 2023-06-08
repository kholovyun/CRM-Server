export default interface IQuestionGetDto {
    id: string
    doctorId: string
    childId: string
    parentId: string
    isClosed: boolean
    createdAt: Date
    question: string
}