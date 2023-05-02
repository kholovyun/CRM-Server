import { Model, Table, Column, PrimaryKey, DataType, ForeignKey } from "sequelize-typescript";
import { Parent } from "./Parent";
import { ESex } from "../enums/ESex";

@Table({
    tableName: "children",
    timestamps: false
})

export class Child extends Model {
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
        id!: string;

    @ForeignKey(() => Parent)
    @Column({
        field: "parent_id",
        allowNull: false
    })
        parentId!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
        photo!: string;

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
        field: "date_of_birth",
        type: DataType.DATEONLY,
        allowNull: false
    })
        dateOfBirth!: Date;

    @Column({
        type: DataType.ENUM(...Object.values(ESex)),
        allowNull: false
    })
        sex!: ESex;

    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
        height!: number;

    @Column({
        type: DataType.DECIMAL(6, 3),
        allowNull: false
    })
        weight!: number;

    @Column({
        field: "is_active",
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true
    })
        isActive!: boolean;
}