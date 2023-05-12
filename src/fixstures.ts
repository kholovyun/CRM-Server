import { ERoles } from "./enums/ERoles";
import { Doctor } from "./models/Doctor";
import { Parent } from "./models/Parent";
import { User } from "./models/User";
import { Message } from "./models/Message";
import { Review } from "./models/Review";
import { Subscription } from "./models/Subscription";
import Logger from "./lib/logger";
import { PostgresDB } from "./repository/postgresDb";
import uuid from "react-uuid";

const db = PostgresDB;

const userFixture = {
    user1: {
        id: uuid(),
        role: ERoles.ADMIN,
        email: "bumerboy86@gmail.com",
        phone: "123456789",
        name: "John",
        surname: "Doe",
        password: "$2b$10$a7cDlgvs1HuFKXI3FO4DM.qMVBmfn.ROJBZdxLFb8pHZ6vo/ZH9T.",
        isBlocked: false,
    },
    user2: {
        id: uuid(),
        role: ERoles.SUPERADMIN,
        email: "kholov.yunus@gmail.com",
        phone: "987654321",
        name: "Jane",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: true,
    },
    user3: {
        id: uuid(),
        role: ERoles.DOCTOR,
        email: "doc@gmail.com",
        phone: "987654321",
        name: "Lopez",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: true,
    },
    user4: {
        id: uuid(),
        role: ERoles.DOCTOR,
        email: "doc2@gmail.com",
        phone: "987654321",
        name: "Reno",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: true,
    },
    user5: {
        id: uuid(),
        role: ERoles.PARENT,
        email: "daddy@gmail.com",
        phone: "987654321",
        name: "Zack",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: true,
    },
    user6: {
        id: uuid(),
        role: ERoles.PARENT,
        email: "uncle@gmail.com",
        phone: "987654321",
        name: "Ed",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: true,
    },
    user7: {
        id: uuid(),
        role: ERoles.PARENT,
        email: "mommy@gmail.com",
        phone: "987654321",
        name: "Lony",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: true,
    },

};

const docFixture = {
    doc1: {
        id: uuid(),
        userId: userFixture.user3.id,
        photo: "https://avatars.mds.yandex.net/i?id=893c6424064159fb13cbbac1f374561e-5157058-images-thumbs&n=13",
        speciality: "Дефектология",
        place_of_work: "Темирязева 100",
        experience: 20,
        isActive: true,
        price: 10000,
        achievements: "Лучший дефектолог в мире",
        degree: "Проффессор"
    },
    doc2: {
        id: uuid(),
        userId: userFixture.user4.id,
        photo: "https://avatars.mds.yandex.net/i?id=893c6424064159fb13cbbac1f374561e-5157058-images-thumbs&n=13",
        speciality: "Стоматолог",
        place_of_work: "Абая 10",
        experience: 23,
        isActive: true,
        price: 20000,
        achievements: "Лучший стоматолог в мире",
        degree: "Доцент"
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

        await Doctor.bulkCreate([
            {
                ...docFixture.doc1,
            },
            {
                ...docFixture.doc2,
            },
        ]);
        Logger.info("Фикстуры созданы");
    } catch (error) {
        Logger.error(error);
    }
};

createUserFixtures();