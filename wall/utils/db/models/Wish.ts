import { Table, Column, Model, Max, AutoIncrement, Default, AllowNull, DataType, HasMany } from 'sequelize-typescript'
import { Gain } from './Gain';
const moment = require('moment');

@Table
export class Wish extends Model<Wish> {
  // @Column({
  //   primaryKey: true,
  //   autoIncrement: true,
  // })
  // wish_id: number                //每个愿望唯一id

  @Column(DataType.STRING(128))
  openid: string   //发布者openid

  @Column({
    primaryKey: true,
    type: DataType.STRING(190)
  })
  uuid: string

  @Column(DataType.STRING(170))
  headimgurl: string

  @Column(DataType.STRING(128))
  nickname: string

  // @AllowNull
  @Column(DataType.STRING(128))
  contact: string    //联系方式

  // @Column(DataType.STRING(128))
  // picker_openid: string //领取者openid

  @Column(DataType.STRING(128))
  wish_content: string

  @Column(DataType.STRING(128))
  wish_type: string

  @Column(DataType.STRING(128))
  wish_where: string

  @Default(0)
  @Column
  wish_status: number  // 0 未被完成， 1  完成

  @Default(0)
  @Column
  wish_many: number

  @Column
  finish_time: Date

  @Default(false)  //是否领取了，针对当前用户
  @Column
  gainOrNot: boolean

  @Default(false)  //此愿望是否是匿名发布的
  @Column
  anonymous: boolean



  @Default(false)
  @Column
  exceed:boolean  //是否过期，的标识，false没有过期


  @HasMany(() => Gain)
  gains: Gain[];

  @Column({
    get() {
      return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
    }
  })
  createdAt: Date

  @Column({
    get() {
      return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
    }
  })
  updatedAt: Date


  @Column({
    get() {
      if(this.getDataValue('firstPicker_time')!= null)
      return moment(this.getDataValue('firstPicker_time')).format('YYYY-MM-DD HH:mm:ss');
    }
  })
  firstPicker_time: Date   //第一个领取的人的时间
}


