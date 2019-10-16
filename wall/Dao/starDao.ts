import { Star } from '../utils/db/models/Star'
import { StarComment } from '../utils/db/models/StarComment'
const Sequelize = require('sequelize');
const Uuid = require("uuid");
const fs = require('fs')
const path = require('path')

//上传超话的背景图
const uploadfile = async (bgPic, uuid) => {
    console.log(bgPic.path);

    // 创建可读流
    const reader = fs.createReadStream(bgPic.path);
    let filePath = path.join(__dirname, '../public/upload/') + `/${uuid}.png`;
    // 创建可写流
    const upStream = fs.createWriteStream(filePath);
    // 可读流通过管道写入可写流
    reader.pipe(upStream);

    return filePath

} 
//发布一个超话
const createStar = async data => {
    let { title, comment, bgPic, user } = data;
    let { openid } = user
    

    let uuid = Uuid.v4()
    let ccid = null
    let path = await uploadfile(bgPic, uuid).then() //上传背景图

    await Star.create({                         //创建超话
        title, uuid, openid, bgPic: path
    });

    await addComment(user, uuid, comment,ccid)      //创建者发布时的内容就是第一条评论

 
}
//展示超话列表，flag为1最新排序；0热度排序
const showAllStar = async (curPage, pageSize, flag) => {
    let list = [];
    if (!curPage) curPage = 1;
    if (!pageSize) pageSize = 10;

    console.log(flag);
    console.log(typeof (flag));
    console.log(flag == 1);

    if (flag == 1) {
        list = await Star.findAll({
            order: [
                ['createdAt', 'DESC'],
            ],
            offset: (curPage - 1) * pageSize,
            limit: pageSize,
            attributes: ['createdAt', 'title', 'bgPic', 'hot']
        })
    } else {
        list = await Star.findAll({
            order: [
                ['hot', 'DESC'],
                ['createdAt', 'DESC']
            ],
            offset: (curPage - 1) * pageSize,
            limit: pageSize,
            attributes: ['createdAt', 'title', 'bgPic', 'hot']
        })
    }
    return list
}
//创建评论,
const addComment = async (user,uuid,comment, commentid?,openid?) => {

    console.log(uuid,commentid,comment ,openid);


    let {  nickname, headimgurl, sex } = user

    await StarComment.create({   //创建评论
        openid:user.openid, 
        nickname, 
        headimgurl, 
        sex, 
        uuid,  
        comment,

        ccid: commentid, 
        ccopenid:openid

    }).then()
        .catch(e => {
            console.log(e);
            return null
        })


    if (uuid) {
        await Star.findOne({     //增加星球的热度
            where: { uuid }
        }).then(async st => {
            st.increment('hot').then()
        })
    } else {
        await StarComment.findOne({     //增加评论区的评论数
            where: { commentid }
        }).then(a => {
            a.increment('many').then()
        })
    }


}
const addLikes = async (commentid) => {

    await StarComment.findOne({
        where: { commentid }
    }).then(async st => {
        st.increment('likes').then()
    })
}

const showOneStar = async (uuid) => {
    let data = await StarComment.findAll({
        where: { uuid },
        order: [
            ['createdAt', 'DESC'],
        ],
        attributes: ['createdAt', 'commentid', 'headimgurl', 'nickname', 'sex', 'comment', 'likes']
    })

    return await data
}

const showOneComment = async (commentid) => {
    let data = await StarComment.findAll({
        where: { ccid: commentid },
        order: [
            ['createdAt', 'DESC'],
        ],
        attributes: ['createdAt', 'headimgurl', 'nickname', 'sex', 'comment']
    })

    return await data
}

//女生删除愿望
const removeComment = async (commentid) => {
    StarComment.destroy({ where: { commentid } })
}

//与我有关
const myRelated = async (openid) => {
    let data = await StarComment.findAll({
        where: { ccopenid: openid },
        order: [
            ['createdAt', 'DESC'],
        ],
        attributes: [['createdAt','comment_time'], 'headimgurl', 'nickname', 'sex', 'comment'],
        include: [{
            model: StarComment,
            as:'fc',
            attributes:['nickname','comment'],
            include:[{
                model:Star,
                as:'fs',
                attributes:['title'],
            }],
        }],
        // raw:true
    })

    return await data
}


//我的发布
const myCreated = async(openid) =>{
    let data = await StarComment.findAll({
        where: { openid: openid ,
                 ccid:null
        },
        order: [
            ['createdAt', 'DESC'],
        ],
        attributes: ['createdAt', 'headimgurl', 'nickname', 'sex', 'comment','likes','many',Sequelize.col('fs.title')],
        include:[{
            model:Star,
            as:'fs',
            attributes:[]
        }],
        raw:true
    })

    return await data
}


//我的评论
const myComment = async(openid) =>{
    let data = await StarComment.findAll({
        where: { openid: openid ,
                 uuid:null
        },
        order: [
            ['createdAt', 'DESC'],
        ],
        attributes: ['createdAt', 'headimgurl', 'nickname', 'sex', 'comment'],
        include:[{
            model:StarComment,
            as:'fc',
            attributes:['nickname','comment','likes'],
            include:[{
                model:Star,
                as:'fs',
                attributes:['title']
            }]
        }],
        // raw:true
    })

    return await data
}






module.exports = {
    createStar,
    showAllStar,
    addComment,
    addLikes,
    showOneStar,
    showOneComment,
    removeComment,
    myRelated,
    myCreated,
    myComment
}