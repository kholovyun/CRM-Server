import { Model, Table, Column, PrimaryKey, DataType, ForeignKey } from "sequelize-typescript";
import { Parent } from "./Parent";

@Table({
    tableName: "patients",
    timestamps: false
})

export class Patient extends Model {
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
        id!: string;

    @ForeignKey(() => Parent)
    @Column({
        allowNull: false
    })
        parent_id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
        photo!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false
    })
        name!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false
    })
        surname!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false
    })
        date_of_birth!: string;

    @Column({
        type: DataType.STRING(1),
        allowNull: false
    })
        sex!: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
        height!: number;

    @Column({
        type: DataType.DECIMAL(6, 3),
        allowNull: false
    })
        weight!: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true
    })
        is_active!: boolean;
}