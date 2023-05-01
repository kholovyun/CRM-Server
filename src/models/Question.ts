import { Model, Table, Column, PrimaryKey, DataType, ForeignKey } from "sequelize-typescript";
import { Doctor } from "./Doctor";
import { Child } from "./Child";
import { Parent } from "./Parent";

@Table({
    tableName: "questions",
    timestamps: false
})

export class Question extends Model {
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

    @ForeignKey(() => Child)
    @Column({
        allowNull: false
    })
        child_id!: string;

    @ForeignKey(() => Parent)
    @Column({
        allowNull: false
    })
        parent_id!: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true
    })
        is_closed!: boolean;
    
    @Column({
        type: DataType.STRING(256),
        allowNull: false
    })
        question!: string;
}