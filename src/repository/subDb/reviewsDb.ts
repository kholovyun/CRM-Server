import { StatusCodes } from "http-status-codes";
import { errorCodesMathcher } from "../../helpers/errorCodeMatcher";
import { User } from "../../models/User";
import { EErrorMessages } from "../../enums/EErrorMessages";
import { Review } from "../../models/Review";
import { ERoles } from "../../enums/ERoles";
import IReviewCreateDto from "../../interfaces/IReview/IReviewCreateDto";


export class ReviewsDb {
    public getReviews = async (userId: string) => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked)
                throw new Error(EErrorMessages.NO_ACCESS);
            const foundReviews = await Review.findAll({
                include: {
                    model: User,
                    as: "users",
                    attributes: ["id", "name", "patronim", "surname"]
                },
                order: [
                    [ "createdAt", "DESC"]
                ]
            });
            return {
                status: StatusCodes.OK,
                result: foundReviews
            };
        } catch (err: unknown) {
            const error = err as Error;
            const status = errorCodesMathcher[error.message] || StatusCodes.INTERNAL_SERVER_ERROR;
            return {
                status,
                result: {
                    status: "error",
                    message: error.message
                }
            };
        }
    };

    public createReview = async (userId: string, review: IReviewCreateDto) => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked) throw new Error(EErrorMessages.NO_ACCESS);
            
            const newReview: IReviewCreateDto= await Review.create({...review});
            return {
                status: StatusCodes.OK,
                result: newReview
            };
        } catch(err: unknown) {
            const error = err as Error;
            const status = errorCodesMathcher[error.message] || StatusCodes.BAD_REQUEST;
            return {
                status,
                result: {
                    status: "error",
                    message: error.message
                }
            };
        }
    };

    public deleteReview = async (userId: string, reviewId: string) => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked) throw new Error(EErrorMessages.NO_ACCESS);

            const review = await Review.findByPk(reviewId);
            if (!review) throw new Error(EErrorMessages.NO_REVIEW_FOUND);
            if (foundUser.role === ERoles.SUPERADMIN) {
                await Review.destroy(
                    {
                        where: {id: reviewId}
                    }
                );
                return {
                    status: StatusCodes.OK,
                    result: "Отзыв удален!"
                };
            } else {
                throw new Error(EErrorMessages.NO_ACCESS);
            }
        } catch(err: unknown) {
            const error = err as Error;
            const status = errorCodesMathcher[error.message] || StatusCodes.INTERNAL_SERVER_ERROR;
            return {
                status,
                result: {
                    status: "error",
                    message: error.message
                }
            };
        }
    };
}

export const reviewsDb = new ReviewsDb();