import { Model, Table, Column, PrimaryKey, DataType, HasMany } from "sequelize-typescript";
import { ERoles } from "../enums/ERoles";
import { Doctor } from "./Doctor";
import { Parent } from "./Parent";
import { Message } from "./Message";

@Table({
    tableName: "users",
    timestamps: false
})

export class User extends Model {
    @HasMany(() => Doctor)
        doctors!: Doctor[];

    @HasMany(() => Parent)
        parents!: Parent[];
    
    @HasMany(() => Message)
        messages!: Message[];

    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
        id!: string;

    @Column({
        type: DataType.ENUM(...Object.values(ERoles)),
        allowNull: false
    })
        role!: ERoles;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    })
        email!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false
    })
        phone!: string;
    
    @Column({
        type: DataType.STRING(256),
        allowNull: false
    })
        name!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false
    })
        surname!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
    })
        password!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: true
    })
        patronim!: string;    
}