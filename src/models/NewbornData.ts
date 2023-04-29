import { Model, Table, Column, PrimaryKey, DataType, ForeignKey } from "sequelize-typescript";
import { Patient } from "./Patient";

@Table({
    tableName: "newbornDatas",
    timestamps: false,
})
export class NewbornData extends Model {
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
        id!: string;

    @ForeignKey(() => Patient)
    @Column({
        allowNull: false,
    })
        patient_id!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
    })
        discharged_date!: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
        pregnancy_n!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
        pregnancy_descript!: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
        birth_n!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
        gest_age!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
        period_1!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
        period_2!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
        amn_abs_period!: number;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
    })
        amn_descript!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
    })
        anesthesia!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
    })
        post_birth_period!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
        mother_state!: string;

    @Column({
        type: DataType.DECIMAL(4, 3),
        allowNull: false,
    })
        birth_weight!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
        birth_height!: number;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
    })
        newborn_state!: string;

    @Column({
        type: DataType.STRING(10),
        allowNull: false,
    })
        apgar_score!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
    })
        reanimation!: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
    })
        breast_try!: boolean;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
    })
        feeding!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
        diagnosis!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
        examination!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
        treatment!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
    })
        eyes!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
    })
        reflexes!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
    })
        skin!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
    })
        organs!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
    })
        stool!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
    })
        diuresis!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
    })
        umbilical_cord!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
    })
        examed_by!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: true,
    })
        notes!: string;

    @Column({
        type: DataType.STRING(256),
        allowNull: true,
    })
        feeding_reason!: string;
}
