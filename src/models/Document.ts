import { Model, Table, Column, PrimaryKey, DataType, ForeignKey } from "sequelize-typescript";
import { Patient } from "./Patient";

@Table({
    tableName: "documents",
    timestamps: false,
})
export class Document extends Model {
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
        id!: string;

    @ForeignKey(() => Patient)
    @Column({
        allowNull: false,
    })
        patient_id!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
    })
        created_at!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
        url!: string;
}
