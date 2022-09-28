const router = require('express').Router();
const mysql_pool = require('../mysql_pools')
const bcrypt = require('bcrypt');

/**
 * @swagger
 *  /user/create:
 *    post:
 *      tags: [user]
 *      description: 사용자를 등록합니다.
 *      parameters:
 *        - in: "body"
 *          name: "body"
 *          description: "사용자 정보. location_scope_a(시/도), location_scope_b(시/군/구), location_scope_c(동/읍/면)는 행정구역분류코드를 따른다."
 *          required: true
 *          schema:
 *              type: object
 *              properties:
 *                  email:
 *                      type: string
 *                  password:
 *                      type: string
 *                  name:
 *                      type: string
 *                  phone:
 *                      type: string
 *      responses:
 *          200:
 *              description: 회원 가입 요청 성공 (연산 결과 JSON)
 *          400:
 *              description: 회원 가입 정보 불충분 
 *          500:
 *              description: 비밀번호 암호화 오류 또는 DB 커넥션 오류
 *      
 */
router.post('/create', async (request, response) => {
    user_email = request.body.email
    user_name = request.body.name
    user_phone = request.body.phone
    bcrypt.hash(request.body.password, 5, async (error, encrypted_password) => {
        if(error) response.sendStatus(500)
        else {
            const db_pool = await mysql_pool.get_pool()
            db_pool.getConnection((error, connection) => {
                if(error) request.sendStatus(500)
                else {
                    connection.query(`INSERT INTO users 
                    (email, password, name, phone) 
                    VALUES 
                    ('${user_email}', '${encrypted_password}', '${user_name}', '${user_phone}')`, 
                    (error, row) => {
                        if(error) response.sendStatus(400)
                        else {
                            response.status(200)
                            response.send(row)
                        }
                    })
                }
            })
        }
    })
});

/**
 * @swagger
 *  /user/read:
 *    post:
 *      tags: [user]
 *      description: 사용자를 검색합니다.
 *      parameters:
 *        - in: "params"
 *          name: "email"
 *          schema:
 *              type: string
 *          description: "사용자 이메일"
 *          required: true
 *        - in: "params"
 *          name: "password"
 *          schema:
 *              type: string
 *          description: "사용자 패스워드"
 *          required: true         
 *      responses:
 *          200:
 *              description: "로그인 요청 성공 (실패한 경우 {\"result\": \"fail\"}, 성공한 경우 사용자 정보 JSON)"
 *          400:
 *              description: 로그인 정보 불충분 
 *          500:
 *              description: 비밀번호 암호화 오류 또는 DB 커넥션 오류
 */
router.get('/read', async (request, response) => {
    user_email = request.query.email
    user_password = request.query.password

    const db_pool = await mysql_pool.get_pool()
    db_pool.getConnection((error, connection) => {
        if(error) response.sendStatus(500)
        else {
            connection.query(`SELECT * FROM users WHERE email='${user_email}'`, 
                (error, rows) => {
                    if(error) response.sendStatus(400)
                    else {
                        response.status(200)
                        if(rows.length != 1) response.send({result: 'fail'})
                        else {
                            if(bcrypt.compareSync(user_password, rows[0].password)) response.send(rows)
                            else response.send({result: 'fail'})
                        }
                    }
                })
        }
    })
})

module.exports = router;