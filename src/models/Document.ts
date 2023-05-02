import { Model, Table, Column, PrimaryKey, DataType, ForeignKey } from "sequelize-typescript";
import { Child } from "./Child";

@Table({
    tableName: "documents",
    timestamps: false
})

export class Document extends Model {
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
        id!: string;

    @ForeignKey(() => Child)
    @Column({
        field: "child_id",
        allowNull: false
    })
        childId!: string;

    @Column({
        field: "created_at",
        type: DataType.DATE,
        allowNull: false
    })
        createdAt!: Date;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
        url!: string;
}