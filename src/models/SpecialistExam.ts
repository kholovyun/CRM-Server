import { Model, Table, Column, PrimaryKey, DataType, ForeignKey } from "sequelize-typescript";
import { Patient } from "./Patient";

@Table({
    tableName: "specialistExams",
    timestamps: false
})

export class SpecialistExam extends Model {
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
        type: DataType.STRING(256),
        allowNull: false
    })
        specialist!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false
    })
        name!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false
    })
        date!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
        conclusion!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
        recommend!: string;
}