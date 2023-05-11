import { ERoles } from "./enums/ERoles";
import { Doctor } from "./models/Doctor";
import { Parent } from "./models/Parent";
import { User } from "./models/User";
import { Message } from "./models/Message";
import { Review } from "./models/Review";
import { Subscription } from "./models/Subscription";
import Logger from "./lib/logger";

const userFixture = {
    user1: {
        role: ERoles.ADMIN,
        email: "bumerboy86@gmail.com",
        phone: "123456789",
        name: "John",
        surname: "Doe",
        password: "$2b$10$a7cDlgvs1HuFKXI3FO4DM.qMVBmfn.ROJBZdxLFb8pHZ6vo/ZH9T.",
        isBlocked: false,
    },
    user2: {
        role: ERoles.SUPERADMIN,
        email: "kholov.yunus@gmail.com",
        phone: "987654321",
        name: "Jane",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: true,
    },
    user3: {
        role: ERoles.DOCTOR,
        email: "doc@gmail.com",
        phone: "987654321",
        name: "Lopez",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: true,
    },
    user4: {
        role: ERoles.DOCTOR,
        email: "doc2@gmail.com",
        phone: "987654321",
        name: "Reno",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: true,
    },
    user5: {
        role: ERoles.PARENT,
        email: "daddy@gmail.com",
        phone: "987654321",
        name: "Zack",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: true,
    },
    user6: {
        role: ERoles.PARENT,
        email: "uncle@gmail.com",
        phone: "987654321",
        name: "Ed",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: true,
    },
    user7: {
        role: ERoles.PARENT,
        email: "mommy@gmail.com",
        phone: "987654321",
        name: "Lony",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: true,
    },

};


export const createUserFixtures = async (): Promise<void> => {
    try {
        await Doctor.destroy({ where: {} });
        await Parent.destroy({ where: {} });
        await Message.destroy({ where: {} });
        await Review.destroy({ where: {} });
        await Subscription.destroy({ where: {} });
        await Review.destroy({ where: {} });
        await User.destroy({ where: {} });
        await User.bulkCreate([
            {
                ...userFixture.user1,
            },
            {
                ...userFixture.user2,
            },
            {
                ...userFixture.user3
            },
            {
                ...userFixture.user4
            },
            {
                ...userFixture.user5
            },
            {
                ...userFixture.user6
            },
            {
                ...userFixture.user7
            },
        ]);
        Logger.info("Фикстуры созданы");
    } catch (error) {
        Logger.error(error);
    }
};

createUserFixtures();