import { Model, Table, Column, PrimaryKey, DataType, ForeignKey } from "sequelize-typescript";
import { User } from "./User";

@Table({
    tableName: "subscriptions",
    timestamps: false
})

export class Subscription extends Model {
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

    @Column({
        type: DataType.STRING(256),
        allowNull: false
    })
        type!: string;

    @Column({
        field: "start_date",
        type: DataType.DATE,
        allowNull: false
    })
        startDate!: Date;

    @Column({
        field: "end_date",
        type: DataType.DATE,
        allowNull: false
    })
        endDate!: Date;
}