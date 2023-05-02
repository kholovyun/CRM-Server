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
        field: "doctor_id",
        allowNull: false
    })
        doctorId!: string;

    @ForeignKey(() => Child)
    @Column({
        field: "child_id",
        allowNull: false
    })
        childId!: string;

    @ForeignKey(() => Parent)
    @Column({
        field: "parent_id",
        allowNull: false
    })
        parentId!: string;

    @Column({
        field: "is_closed",
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true
    })
        isClosed!: boolean;
    
    @Column({
        type: DataType.STRING(256),
        allowNull: false
    })
        question!: string;
}