import {
    Model,
    Table,
    Column,
    PrimaryKey,
    DataType,
    ForeignKey,
} from "sequelize-typescript";
import { EVisitReasons } from "../enums/EVisitReasons";
import { Child } from "./Child";

@Table({
    tableName: "visits",
    timestamps: false,
})

export class Visit extends Model {
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
        id!: string;

    @ForeignKey(() => Child)
    @Column({
        allowNull: false,
    })
        child_id!: string;

    @Column({
        type: DataType.ENUM(...Object.values(EVisitReasons)),
        allowNull: false,
    })
        reason!: EVisitReasons;

    @Column({
        type: DataType.DATEONLY,
        allowNull: false,
    })
        date!: Date;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
        conclusion!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
        appointment!: string;
}
