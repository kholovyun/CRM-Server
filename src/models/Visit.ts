import { Model, Table, Column, PrimaryKey, DataType, ForeignKey } from "sequelize-typescript";
import { Patient } from "./Patient";
import { EVisitReasons } from "../enums/EVisitReasons";

@Table({
    tableName: "visits",
    timestamps: false
})

export class Visit extends Model {
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
        type: DataType.ENUM(...Object.values(EVisitReasons)),
        allowNull: false
    })
        reason!: EVisitReasons;

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
        appointment!: string;
}