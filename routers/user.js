const router = require("express").Router();

const mysql_pool = require("../mysql_pools");

const bcrypt = require("bcrypt");

/**
 * @swagger
 *  /user/create:
 *    post:
 *      tags: [user]
 *      description: 사용자를 등록합니다.
 *      parameters:
 *        - in: "body"
 *          name: "body"
 *          description: "사용자 정보."
 *          required: true
 *          schema:
 *              type: application/json
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
 *              description: 회원 가입 요청 성공.
 *          400:
 *              description: 회원 가입 정보 불충분.
 *          409:
 *              description: 회원 가입 실패. (중복된 이메일)
 *          500:
 *              description: 비밀번호 암호화 오류 또는 DB 커넥션 오류.
 *
 */
router.post("/create", async (request, response) => {
  user_email = request.body.email;
  user_password = request.body.password;
  user_name = request.body.name;
  user_phone = request.body.phone;

  if (
    user_email === undefined ||
    user_name === undefined ||
    user_phone === undefined ||
    user_password === undefined
  ) {
    response.sendStatus(400);
    return;
  }

  bcrypt.hash(request.body.password, 5, async (error, encrypted_password) => {
    if (error) response.sendStatus(500);
    else {
      const db_pool = await mysql_pool.get_pool();
      db_pool.getConnection((error, connection) => {
        if (error) request.sendStatus(500);
        else {
          connection.query(
            `INSERT INTO users 
                    (email, password, name, phone) 
                    VALUES 
                    ('${user_email}', '${encrypted_password}', '${user_name}', '${user_phone}')`,
            (error, row) => {
              if (error) response.sendStatus(409);
              else response.sendStatus(200);
            }
          );
        }
      });
    }
  });
});

/**
 * @swagger
 *  /user/read:
 *    get:
 *      tags: [user]
 *      description: 사용자 정보를 받아옵니다. (로그인)
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
 *              description: 로그인 성공. 사용자 정보 JSON 반환.
 *          400:
 *              description: 로그인 정보 불충분. (사용자 이메일 또는 비밀번호 중 하나 이상이 주어지지 않음)
 *          401:
 *              description: 로그인 실패.
 *          500:
 *              description: 비밀번호 암호화 오류 또는 DB 커넥션 오류.
 */
router.get("/read", async (request, response) => {
  user_email = request.query.email;
  user_password = request.query.password;

  if (user_email === undefined || user_password === undefined) {
    response.sendStatus(400);
    return;
  }

  const db_pool = await mysql_pool.get_pool();
  db_pool.getConnection((error, connection) => {
    if (error) response.sendStatus(500);
    else {
      connection.query(
        `SELECT * FROM users WHERE email='${user_email}'`,
        (error, rows) => {
          if (error) response.sendStatus(400);
          else {
            if (
              rows.length === 1 &&
              bcrypt.compareSync(user_password, rows[0].password)
            ) {
              request.session.user_email = user_email;
              response.status(200);
              response.send(rows);
            } else response.sendStatus(401);
          }
        }
      );
    }
  });
});

module.exports = router;
