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
import { Recommendation } from "./models/Recommendation";
import { Child } from "./models/Child";
import { NewbornData } from "./models/NewbornData";

const db = PostgresDB;

const userFixture = {
    user1: {
        id: uuid(),
        role: ERoles.ADMIN,
        email: "bumerboy86@gmail.com",
        phone: "+77074152201",
        name: "John",
        surname: "Doe",
        password: "$2b$10$a7cDlgvs1HuFKXI3FO4DM.qMVBmfn.ROJBZdxLFb8pHZ6vo/ZH9T.",
        isBlocked: false,
    },
    user2: {
        id: uuid(),
        role: ERoles.SUPERADMIN,
        email: "kholov.yunus@gmail.com",
        phone: "+77074152202",
        name: "Jane",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: false,
    },
    user3: {
        id: uuid(),
        role: ERoles.DOCTOR,
        email: "doc@gmail.com",
        phone: "+77074152203",
        name: "Lopez",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: false,
    },
    user4: {
        id: uuid(),
        role: ERoles.DOCTOR,
        email: "doc2@gmail.com",
        phone: "+77074152204",
        name: "Reno",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: false,
    },
    user5: {
        id: uuid(),
        role: ERoles.PARENT,
        email: "daddy@gmail.com",
        phone: "+77074152205",
        name: "Zack",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: false,
    },
    user6: {
        id: uuid(),
        role: ERoles.PARENT,
        email: "uncle@gmail.com",
        phone: "+77074152206",
        name: "Ed",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: false,
    },
    user7: {
        id: uuid(),
        role: ERoles.PARENT,
        email: "mommy@gmail.com",
        phone: "+77074152207",
        name: "Lony",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: false,
    },
    user8: {
        id: uuid(),
        role: ERoles.DOCTOR,
        email: "doc3@gmail.com",
        phone: "+77074152208",
        name: "Renato",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: false,
    },
    user9: {
        id: uuid(),
        role: ERoles.DOCTOR,
        email: "doc4@gmail.com",
        phone: "+77074152209",
        name: "Anna",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: false,
    },
    user10: {
        id: uuid(),
        role: ERoles.DOCTOR,
        email: "doc5@gmail.com",
        phone: "+77074152200",
        name: "Aruzhan",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: false,
    },

};

const docFixture = {
    doc1: {
        id: uuid(),
        userId: userFixture.user3.id,
        photo: "default-photo.svg",
        speciality: "Дефектология",
        placeOfWork : "Темирязева 100",
        experience: 20,
        isActive: true,
        price: 10000,
        achievements: "Лучший дефектолог в мире",
        degree: "Проффессор"
    },
    doc2: {
        id: uuid(),
        userId: userFixture.user8.id,
        photo: "default-photo.svg",
        speciality: "Дефектолог",
        placeOfWork : "Сатпаева 85",
        experience: 2,
        isActive: true,
        price: 2000,
        achievements: "Лучший Дефектолог в мире",
        degree: "Студент"
    },
    doc3: {
        id: uuid(),
        userId: userFixture.user4.id,
        photo: "default-photo.svg",
        speciality: "Стоматолог",
        placeOfWork : "Абая 10",
        experience: 23,
        isActive: true,
        price: 20000,
        achievements: "Лучший стоматолог в мире",
        degree: "Доцент"
    },
    doc4: {
        id: uuid(),
        userId: userFixture.user9.id,
        photo: "default-photo.svg",
        speciality: "Терапевт",
        placeOfWork : "Достык 150",
        experience: 11,
        isActive: true,
        price: 7000,
        achievements: "Лучший Терапевт в мире",
        degree: "Аспирант"
    },
    doc5: {
        id: uuid(),
        userId: userFixture.user10.id,
        photo: "default-photo.svg",
        speciality: "Стоматолог",
        placeOfWork : "Абая 10",
        experience: 1,
        isActive: true,
        price: 0,
        achievements: "Лучший стоматолог в мире",
        degree: "Интерн"
    },

};


const parentFixture = {
    parent1: {
        id: uuid(),
        userId: userFixture.user7.id,
        doctorId: docFixture.doc4.id,
        registerDate: new Date(),
        isActive: false,
    },
    parent2: {
        id: uuid(),
        userId: userFixture.user6.id,
        doctorId: docFixture.doc5.id,
        registerDate: new Date(),
        isActive: true,
    }
        
};


const recomendationsFix = {
    reco1 : {
        id: uuid(),
        doctorId: docFixture.doc1.id,
        text: "Рекомендую не пить колу",
    },
    reco2 : {
        id: uuid(),
        doctorId: docFixture.doc2.id,
        text: "Рекомендую спать не менее 8 часов",
    },
    reco3 : {
        id: uuid(),
        doctorId: docFixture.doc1.id,
        text: "Рекомендую заниматься спортом",
    },
    reco4 : {
        id: uuid(),
        doctorId: docFixture.doc1.id,
        text: "Рекомендую заниматься иогой",
    },
};

export const createUserFixtures = async (): Promise<void> => {
    try {
        await NewbornData.destroy({where: {}});
        await Child.destroy({where: {}});
        await Recommendation.destroy({ where: {} });
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
            {
                ...userFixture.user8
            },
            {
                ...userFixture.user9
            },
            {
                ...userFixture.user10
            },
        ]);

        await Doctor.bulkCreate([
            {
                ...docFixture.doc1,
            },
            {
                ...docFixture.doc2,
            },
            {
                ...docFixture.doc3,
            },
            {
                ...docFixture.doc4,
            },
            {
                ...docFixture.doc5,
            },
        ]);

        await Recommendation.bulkCreate([
            { ...recomendationsFix.reco1},
            { ...recomendationsFix.reco2},
            { ...recomendationsFix.reco3},
            { ...recomendationsFix.reco4},
        ]);
        
        await Parent.bulkCreate([
            {...parentFixture.parent1},
            {...parentFixture.parent2}
        ]);
        
        Logger.info("Фикстуры созданы");
    } catch (error) {
        Logger.error(error);
    }
};

createUserFixtures();