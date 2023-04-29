import { Model, Table, Column, PrimaryKey, DataType } from "sequelize-typescript";
import { ERoles } from "../enums/ERoles";

@Table({
    tableName: "users",
    timestamps: false,
})
export class User extends Model {
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
        id!: string;

    @Column({
        type: DataType.ENUM(...Object.values(ERoles)),
        allowNull: false,
    })
        role!: ERoles;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
        unique: true,
    })
        email!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
    })
        phone!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
    })
        name!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
    })
        surname!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
    })
        password!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: true,
    })
        patronim!: string;
}
