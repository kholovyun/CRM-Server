import { Model, Table, Column, PrimaryKey, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { User } from "./User";
import { Question } from "./Question";

@Table({
    tableName: "messages",
    timestamps: false,
})

export class Message extends Model {
    @BelongsTo(() => Question)
        questions!: Question;
    
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
        id!: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        field: "author_id",
        allowNull: false,
    })
        authorId!: string;

    @Column({
        field: "created_at",
        type: DataType.DATE,
        allowNull: false,
    })
        createdAt!: Date;

    @ForeignKey(() => Question)
    @Column({
        type: DataType.UUID,
        field: "question_id",
        allowNull: false,
    })
        questionId!: string;

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