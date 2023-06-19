import { ERoles } from "./enums/ERoles";
import { Doctor } from "./models/Doctor";
import { Parent } from "./models/Parent";
import { User } from "./models/User";
import { Message } from "./models/Message";
import { Review } from "./models/Review";
import { Subscription } from "./models/Subscription";
import Logger from "./lib/logger";
import uuid from "react-uuid";
import { Recommendation } from "./models/Recommendation";
import { Child } from "./models/Child";
import { NewbornData } from "./models/NewbornData";
import { ESex } from "./enums/ESex";
import { Document } from "./models/Document";
import { PostgresDB } from "./repository/postgresDb";
import { EPaymentType } from "./enums/EPaymentType";
import { Allergy } from "./models/Allergy";
import { Vaccination } from "./models/Vaccination";
import { Visit } from "./models/Visit";
import { EVisitReasons } from "./enums/EVisitReasons";
import { Question } from "./models/Question";

const db = PostgresDB;

const userFixture = {
    user1: {
        id: uuid(),
        role: ERoles.ADMIN,
        email: "bumerboy86@gmail.com",
        phone: "+7(707)415-22-01",
        name: "John",
        surname: "Doe",
        password: "$2b$10$a7cDlgvs1HuFKXI3FO4DM.qMVBmfn.ROJBZdxLFb8pHZ6vo/ZH9T.",
        isBlocked: false,
    },
    user2: {
        id: uuid(),
        role: ERoles.SUPERADMIN,
        email: "kholov.yunus@gmail.com",
        phone: "+996(707)15-22-02",
        name: "Jane",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: false,
    },
    user3: {
        id: uuid(),
        role: ERoles.DOCTOR,
        email: "doc@gmail.com",
        phone: "+7(707)415-22-03",
        name: "Lopez",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: false,
    },
    user4: {
        id: uuid(),
        role: ERoles.DOCTOR,
        email: "doc2@gmail.com",
        phone: "+7(707)415-22-04",
        name: "Reno",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: false,
    },
    user5: {
        id: uuid(),
        role: ERoles.PARENT,
        email: "daddy@gmail.com",
        phone: "+7(707)415-22-05",
        name: "Zack",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: false,
    },
    user6: {
        id: uuid(),
        role: ERoles.PARENT,
        email: "uncle@gmail.com",
        phone: "+7(707)415-22-06",
        name: "Ed",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: false,
    },
    user7: {
        id: uuid(),
        role: ERoles.PARENT,
        email: "mommy@gmail.com",
        phone: "+7(707)415-22-07",
        name: "Lony",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: false,
    },
    user8: {
        id: uuid(),
        role: ERoles.DOCTOR,
        email: "doc3@gmail.com",
        phone: "+7(707)415-22-08",
        name: "Renato",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: false,
    },
    user9: {
        id: uuid(),
        role: ERoles.DOCTOR,
        email: "doc4@gmail.com",
        phone: "+7(707)415-22-09",
        name: "Anna",
        surname: "Doe",
        password: "$2b$10$8XUZIvtgKi63lULdT7sxPec3EWlbU9wdihK/ESXoKl7I1YENmuHzq",
        isBlocked: false,
    },
    user10: {
        id: uuid(),
        role: ERoles.DOCTOR,
        email: "doc5@gmail.com",
        phone: "+7(707)415-22-00",
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
        isActive: true,
        subscriptionEndDate: new Date().setMonth(new Date().getMonth() + 1)
    },
    parent2: {
        id: uuid(),
        userId: userFixture.user6.id,
        doctorId: docFixture.doc5.id,
        registerDate: new Date(),
        isActive: true,
        subscriptionEndDate: new Date().setMonth(new Date().getMonth() + 1)
    },
    parent3: {
        id: uuid(),
        userId: userFixture.user5.id,
        doctorId: docFixture.doc1.id,
        registerDate: new Date(),
        isActive: true,
        subscriptionEndDate: new Date().setMonth(new Date().getMonth() + 6)
    }
};

const subscrFixture = {
    subscr1: {
        id: uuid(),
        userId: userFixture.user7.id,
        payedBy: userFixture.user9.id,
        type: 1,
        sum: docFixture.doc4.price,
        paymentType: EPaymentType.CASH,
        endDate: new Date(parentFixture.parent1.registerDate).setMonth(parentFixture.parent1.registerDate.getMonth() + 1)
    },
    subscr2: {
        id: uuid(),
        userId: userFixture.user6.id,
        payedBy: userFixture.user6.id,
        type: 1,
        sum: docFixture.doc5.price,
        paymentType: EPaymentType.CASH,
        endDate: new Date(parentFixture.parent2.registerDate).setMonth(parentFixture.parent2.registerDate.getMonth() + 1)
    },
    subscr3: {
        id: uuid(),
        userId: userFixture.user5.id,
        payedBy: userFixture.user3.id,
        type: 6,
        sum: docFixture.doc5.price,
        paymentType: EPaymentType.CASH,
        endDate: new Date(parentFixture.parent3.registerDate).setMonth(parentFixture.parent3.registerDate.getMonth() + 6)
    }
};

const childrenFixture = {
    child1: {
        id: uuid(),
        parentId: parentFixture.parent1.id,
        photo: "default-child-photo.svg",
        name: "Mark",
        surname: "Teal",
        dateOfBirth: "2013-06-12",
        sex: ESex.MALE,
        height: 135,
        weight: 35,
        patronim: "patronium",
        isActive: true
    },
    child2: {
        id: uuid(),
        parentId: parentFixture.parent1.id,
        photo: "default-child-photo.svg",
        name: "Sara",
        surname: "Grey",
        dateOfBirth: "2020-10-11",
        sex: ESex.FEMALE,
        height: 95,
        weight: 15,
        patronim: "patronium",
        isActive: true
    },
    child3: {
        id: uuid(),
        parentId: parentFixture.parent1.id,
        photo: "default-child-photo.svg",
        name: "Василий",
        surname: "Рубенштейн",
        dateOfBirth: "2019-01-01",
        sex: ESex.MALE,
        height: 100,
        weight: 17.500,
        patronim: "Иванович",
        isActive: true
    },
    child4: {
        id: uuid(),
        parentId: parentFixture.parent2.id,
        photo: "default-child-photo.svg",
        name: "Sara",
        surname: "Grey",
        dateOfBirth: "2010-05-07",
        sex: ESex.FEMALE,
        height: 155,
        weight: 45,
        patronim: "patronium",
        isActive: true
    },
    child5: {
        id: uuid(),
        parentId: parentFixture.parent3.id,
        photo: "default-child-photo.svg",
        name: "Анастасия",
        surname: "Доу",
        dateOfBirth: "2010-03-17",
        sex: ESex.FEMALE,
        height: 155,
        weight: 43,
        patronim: "Заковна",
        isActive: true
    },
};

const allergyFixture = {
    all1: {
        id: uuid(),
        childId: childrenFixture.child1.id,
        type: "пищевая",
        symptom: "кожная сыпь (крапивница)",
        factors: "приём внутрь чаёв и отваров с мелиссой лимонной"
    }
};

const vaccinationFixture = {
    vac1: {
        id: uuid(),
        childId: childrenFixture.child1.id,
        infection: "Туберкулёз",
        vaccine: "БЦЖ",
        age: "1 день",
        date: childrenFixture.child1.dateOfBirth,
        dose: "0,025",
        serial: "1515",
        manufacturer: "KZ",
        reaction: "",
        conterindication: "",
        notes: ""
    },
    vac2: {
        id: uuid(),
        childId: childrenFixture.child2.id,
        infection: "Туберкулёз",
        vaccine: "БЦЖ",
        age: "1 день",
        date: childrenFixture.child2.dateOfBirth,
        dose: "",
        serial: "",
        manufacturer: "",
        reaction: "",
        conterindication: "Отказ родителя",
        notes: ""
    }
};

const documentsFixture = {
    document1: {
        id: uuid(),
        childId: childrenFixture.child1.id,
        createdAt: new Date(),
        url: "some url here"
    },
    document2: {
        id: uuid(),
        childId: childrenFixture.child2.id,
        createdAt: new Date(),
        url: "some url here"
    },
    
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

const visitsFixture = {
    visit1: {
        id: uuid(),
        childId: childrenFixture.child1.id,
        reason: EVisitReasons.THERAP,
        date: new Date(),
        conclusion: "Диарея",
        appointment: "По 2 таблетки \"Антидиарея\"в день, утром и вечером после ужина"
    },
    visit2: {
        id: uuid(),
        childId: childrenFixture.child1.id,
        reason: EVisitReasons.PROPH,
        date: new Date(),
        conclusion: "Легкая простуда",
        appointment: "По 2 пакетика \"Инсти для детей\"в день, утром и вечером после ужина"
    },
    visit3: {
        id: uuid(),
        childId: childrenFixture.child2.id,
        reason: EVisitReasons.PROPH,
        date: new Date(),
        conclusion: "Ринит",
        appointment: "Впрыскиваний препарата \"Лазорин\" в каждый носовой ход в сутки; продолжительность применения не более 5–7 дней"
    },
    visit4: {
        id: uuid(),
        childId: childrenFixture.child2.id,
        reason: EVisitReasons.PROPH,
        date: new Date(),
        conclusion: "Ветрянка",
        appointment: "Обработка сыпи антисептическими и подсушивающими средствами для исключения занесения вторичной инфекции и ускорения регенерации папул без остаточных рубцов"
    }, 
};

const questionsFixture = {
    question1: {
        id: uuid(),
        doctorId: docFixture.doc4.id,
        childId: childrenFixture.child1.id,
        parentId: parentFixture.parent1.id,
        createdAt: new Date(),
        question: "Когда Марк может получить привывку от кори?"
    },
    question2: {
        id: uuid(),
        doctorId: docFixture.doc4.id,
        childId: childrenFixture.child2.id,
        parentId: parentFixture.parent1.id,
        createdAt: new Date(),
        question: "Когда и чем сбивать температуру у ребенка? Стоит ли ее сбивать вообще?"
    },
    question3: {
        id: uuid(),
        doctorId: docFixture.doc4.id,
        childId: childrenFixture.child1.id,
        parentId: parentFixture.parent1.id,
        createdAt: new Date(),
        question: "После визита к вам прошло 5 дней, температура спала, можно ли выйти на улицу?"
    },
    question4: {
        id: uuid(),
        doctorId: docFixture.doc4.id,
        childId: childrenFixture.child1.id,
        parentId: parentFixture.parent1.id,
        createdAt: new Date(),
        question: "У Марка температура иногда поднимается. Можно ли выйти на улицу с температурой выше 37?"
    },
    question5: {
        id: uuid(),
        doctorId: docFixture.doc4.id,
        childId: childrenFixture.child3.id,
        parentId: parentFixture.parent1.id,
        createdAt: new Date(),
        question: "У ребенка кажется колики, можно ли ставить ребенку газоотводную трубку?"
    },
    question6: {
        id: uuid(),
        doctorId: docFixture.doc5.id,
        childId: childrenFixture.child4.id,
        parentId: parentFixture.parent2.id,
        createdAt: new Date(),
        question: "Можете порекомендовать солнцезащитный крем для младенца"
    }
};

const reviewFixtures = {
    review1: {
        id: uuid(),
        userId: userFixture.user5.id,
        createdAt: new Date(),
        text: "Принимая во внимание показатели успешности, глубокий уровень погружения прекрасно подходит для реализации своевременного выполнения сверхзадачи."
    },
    review2: {
        id: uuid(),
        userId: userFixture.user6.id,
        createdAt: new Date(),
        text: "Добрая половина выводов сделала своё дело!"
    },
    review3: {
        id: uuid(),
        userId: userFixture.user7.id,
        createdAt: new Date(),
        text: "Но современная методология разработки говорит о возможностях направлений прогрессивного развития. Современные технологии достигли такого уровня, что глубокий уровень погружения позволяет оценить значение кластеризации усилий."
    }
};

export const createUserFixtures = async (): Promise<void> => {
    try {
        await Allergy.destroy({where: {}});
        await Vaccination.destroy({where: {}});
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
        await Document.destroy({where: {}});
        await Visit.destroy({where: {}});
        await Question.destroy({where: {}});
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
            {...parentFixture.parent2},
            {...parentFixture.parent3}
        ]);

        await Subscription.bulkCreate([
            {...subscrFixture.subscr1},
            {...subscrFixture.subscr2},
            {...subscrFixture.subscr3},
        ]);

        await Child.bulkCreate([
            {...childrenFixture.child1},
            {...childrenFixture.child2},
            {...childrenFixture.child3},
            {...childrenFixture.child4},
            {...childrenFixture.child5},
        ]);

        await Vaccination.bulkCreate([
            {...vaccinationFixture.vac1},
            {...vaccinationFixture.vac2}
        ]);

        await Document.bulkCreate([
            {...documentsFixture.document1},
            {...documentsFixture.document2},
        ]);

        await Visit.bulkCreate([
            {...visitsFixture.visit1},
            {...visitsFixture.visit2},
            {...visitsFixture.visit3},
            {...visitsFixture.visit4},
        ]);

        await Question.bulkCreate([
            {...questionsFixture.question1},
            {...questionsFixture.question2},
            {...questionsFixture.question3},
            {...questionsFixture.question4},
            {...questionsFixture.question5},
            {...questionsFixture.question6},
        ]);

        await Review.bulkCreate([
            {...reviewFixtures.review1},
            {...reviewFixtures.review2},
            {...reviewFixtures.review3},
        ]);
        
        Logger.info("Фикстуры созданы");
    } catch (error) {
        Logger.error(error);
    }
};

createUserFixtures();