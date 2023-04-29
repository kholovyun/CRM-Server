

export default interface IResponse<T> {
    status: string
    message: string
    result: T | undefined
// eslint-disable-next-line semi
}