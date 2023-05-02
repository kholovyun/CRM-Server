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
        field: "user_id",
        allowNull: false
    })
        userId!: string;

    @ForeignKey(() => Doctor)
    @Column({
        field: "doctor_id",
        allowNull: false
    })
        doctorId!: string;

    @Column({
        field: "is_active",
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true
    })
        isActive!: boolean;
}