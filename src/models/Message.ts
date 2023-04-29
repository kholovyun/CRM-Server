import { Model, Table, Column, PrimaryKey, DataType, ForeignKey } from "sequelize-typescript";
import { User } from "./User";
import { Question } from "./Question";

@Table({
    tableName: "messages",
    timestamps: false,
})

export class Message extends Model {
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
        id!: string;

    @ForeignKey(() => User)
    @Column({
        allowNull: false,
    })
        author_id!: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
        created_at!: Date;

    @ForeignKey(() => Question)
    @Column({
        allowNull: false,
    })
        question_id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
        text!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
        url!: string;
}
