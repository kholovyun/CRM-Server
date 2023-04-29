import { Model, Table, Column, PrimaryKey, DataType, ForeignKey } from "sequelize-typescript";
import { User } from "./User";
import { Doctor } from "./Doctor";

@Table({
    tableName: "parents",
    timestamps: false
})

export class Parent extends Model {
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
        id!: string;

    @ForeignKey(() => User)
    @Column({
        allowNull: false
    })
        user_id!: string;

    @ForeignKey(() => Doctor)
    @Column({
        allowNull: false
    })
        doctor_id!: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true
    })
        is_active!: boolean;
}