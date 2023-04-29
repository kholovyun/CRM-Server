import { Model, Table, Column, PrimaryKey, DataType, ForeignKey } from "sequelize-typescript";
import { Child } from "./Child";

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

    @ForeignKey(() => Child)
    @Column({
        allowNull: false
    })
        child_id!: string;

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
        type: DataType.DATEONLY,
        allowNull: false
    })
        date!: Date;

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