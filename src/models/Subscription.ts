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
        allowNull: false
    })
        user_id!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false
    })
        type!: string;

    @Column({
        type: DataType.DATE,
        allowNull: false
    })
        start_date!: Date;

    @Column({
        type: DataType.DATE,
        allowNull: false
    })
        end_date!: Date;
}