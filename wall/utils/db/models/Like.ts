import { Table, Column, Model, DataType } from 'sequelize-typescript'

@Table
export class Like extends Model<Like> {
  @Column({
    primaryKey: true,
    autoIncrement: true,
  })
  id: number

  @Column
  openid: string
 
  @Column
  uuid:string
  
  // @Column(DataType.STRING(64))
  // test:string
}

