import {
    Model,
    Table,
    Column,
    PrimaryKey,
    DataType,
    ForeignKey,
} from "sequelize-typescript";
import {User} from "./User";

@Table({
    tableName: "doctors",
    timestamps: false,
})
export class Doctor extends Model {
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
    user_id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    photo!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    speciality!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
    })
    place_of_work!: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    experience!: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    })
    is_active!: boolean;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    achievements!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: true,
    })
    degree!: string;
}
