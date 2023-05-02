import { Model, Table, Column, PrimaryKey, DataType, ForeignKey } from "sequelize-typescript";
import { User } from "./User";

@Table({
    tableName: "doctors",
    timestamps: false
})

export class Doctor extends Model {
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
        type: DataType.STRING,
        allowNull: false
    })
        photo!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
        speciality!: string;

    @Column({
        field: "place_of_work",
        type: DataType.STRING(256),
        allowNull: false
    })
        placeOfWork!: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
        experience!: number;

    @Column({
        field: "is_active",
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true
    })
        isActive!: boolean;

    @Column({        
        type: DataType.STRING,
        allowNull: true
    })
        achievements!: string;
    
    @Column({
        type: DataType.STRING(256),
        allowNull: true
    })
        degree!: string;
}