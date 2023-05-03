import { Model, Table, Column, PrimaryKey, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { User } from "./User";

@Table({
    tableName: "subscriptions",
    timestamps: false
})

export class Subscription extends Model {
    @BelongsTo(() => User)
        users!: User;

    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
        id!: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
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