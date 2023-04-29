import { Model, Table, Column, PrimaryKey, DataType, ForeignKey } from "sequelize-typescript";
import { Patient } from "./Patient";

@Table({
    tableName: "allergies",
    timestamps: false
}) 

export class Allergy extends Model {
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
        id!: string;

    @ForeignKey(() => Patient)
    @Column({
        allowNull: false
    })
        patient_id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
        type!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
        symptom!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
        factors!: string;
}