export enum EErrorMessages {
    NO_ACCESS = "У Вас нет прав доступа.",
    NOT_AUTHORIZED = "Вы не идентифицированы.",
    DIPLOMA_NOT_FOUND = "Диплом не найден.",
    PARENT_NOT_FOUND = "Родитель пациента не найден.",
    PARENT_TABLE_ALREADY_EXISTS = "Таблица «Родитель» для этого пользователя уже создана.",
    USER_NOT_FOUND = "Пользователь не найден.",
    DOCTOR_NOT_FOUND = "Врач не найден.",
    DOCTOR_TABLE_ALREADY_EXISTS = "Таблица врач для этого пользователя уже создана.",
    WRONG_PASSWORD = "Пароль указан не верно!",
    NO_PASSWORD = "Пароль не указан.",
    PASSWORD_LENGTH_FAILED = "Пароль должен быть от 6 до 8 символов в длину.",
    PASSWORD_CAPITAL_LETTER_FAILED = "Пароль должен содержать минимум 1 заглавную букву.",
    PASSWORD_SMALL_LETTER_FAILED = "Пароль должен содержать минимум 1 строчную букву.",
    PASSWORD_NUMBER_FAILED = "Пароль должен содержать минимум 1 цифру.",
    USER_NOT_FOUND_BY_ID = "Пользователь с таким ID не найден.",
    SUPERADMIN_CANT_BE_BLOCKED = "Суперадминистратор не может быть блокирован.",
    USER_ALREADY_EXISTS = "Пользователь с таким email уже зарегистрирован.",
    WRONG_MAIL_FORMAT = "Неправильный формат email-адреса",
    DOCTOR_DIPLOMA_NOT_FOUND = "Врач, чьи дипломы Вы запрашиваете не найден.",
    IMAGE_REQUIRED = "Изображение обязательно.",
    NO_RECOMENDATIONS_FOUND = "Рекомендации не найдены.",
    WRONG_PASS_OR_EMAIL = "Неверно указан емайл или пароль.",
    CHILD_NOT_FOUND = "Ребенок не найден.",
    NO_REVIEW_FOUND = "Отзыв не найден.",
    DOCUMENT_NOT_FOUND = "Документ не найден.",
    VACCINATION_NOT_FOUND = "Запись о вакцинации не найдена.",
    ALLERGY_NOT_FOUND = "Запись об аллергии не найдена.",
}