import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', unique: true, nullable: false})
    username: string

    @Column({ type: 'varchar', nullable: false})
    password: string

    @Column({ type: 'varchar', nullable: false})
    color: string

    @Column({ type: 'varchar', nullable: false})
    avatar: string

    @CreateDateColumn({
        name: "create_time",
        nullable: true,
    })
    createTime: Date;

    @UpdateDateColumn({
        name: "update_time",
        nullable: true,
    })
    updateTime: Date | null;

}