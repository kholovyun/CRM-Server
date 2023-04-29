import { Model, Table, Column, PrimaryKey, DataType, ForeignKey } from "sequelize-typescript";
import { Doctor } from "./Doctor";

@Table({
    tableName: "diplomas",
    timestamps: false
})

export class Diploma extends Model {
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
        id!: string;

    @ForeignKey(() => Doctor)
    @Column({
        allowNull: false
    })
        doctor_id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
        url!: string;
}