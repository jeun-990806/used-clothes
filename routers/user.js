const router = require("express").Router();

const mysql_pool = require("../mysql_pools");

const bcrypt = require("bcrypt");
const session_check = require("../middlewares/session_check");
const session = require("express-session");

/**
 * @swagger
 * /user/create:
 *  post:
 *    tags: [user]
 *    summary: 사용자를 등록합니다.
 *    requestBody:
 *      description: 회원 가입 정보
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
 *              name:
 *                type: string
 *              phone:
 *                type: string
 *
 *    responses:
 *      200:
 *        description: 회원 가입 요청 성공.
 *      400:
 *        description: 회원 가입 정보 불충분.
 *      409:
 *        description: 회원 가입 실패. (중복된 이메일)
 *      500:
 *        description: 비밀번호 암호화 오류 또는 DB 커넥션 오류.
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
 * /user/list:
 *  get:
 *    tags: [user]
 *    description: 사용자 리스트를 반환합니다.
 *
 *    responses:
 *      200:
 *        description: 사용자 정보 JSON 반환
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  email:
 *                    type: string
 *                    example: test_user
 *                  name:
 *                    type: string
 *                    example: test_name
 *                  location_scope_a_code:
 *                    type: string
 *                    example: 394
 *                  location_scope_b_code:
 *                    type: string
 *                    example: 03
 *                  location_scope_c_ode:
 *                    type: string
 *                    example: 209
 *                  phone:
 *                    type: string
 *                    example: 010-0000-0000
 *      500:
 *        description: DB 커넥션 오류.
 */
router.get("/list", async (request, response) => {
  const db_pool = await mysql_pool.get_pool();
  db_pool.getConnection((error, connection) => {
    if (error) response.sendStatus(500);
    else {
      connection.query("SELECT * FROM users;", (error, rows) => {
        if (error) response.sendStatus(500);
        else {
          response.status(200);
          let result = [];
          for (var row of rows) {
            result.push({
              email: row["email"],
              name: row["name"],
              location_scope_a_code: row["location_scope_a_code"],
              location_scope_b_code: row["location_scope_b_code"],
              location_scope_c_code: row["location_scope_c_code"],
              phone: row["phone"],
            });
          }
          response.send(result);
        }
      });
    }
  });
});

/**
 * @swagger
 * /user/login:
 *  get:
 *    tags: [user]
 *    description: 이메일과 패스워드를 사용해 로그인합니다.
 *    parameters:
 *      - in: query
 *        name: email
 *        schema:
 *          type: string
 *        description: 사용자 이메일
 *        required: true
 *      - in: query
 *        name: password
 *        schema:
 *          type: string
 *        description: 사용자 패스워드
 *        required: true
 *
 *    responses:
 *      200:
 *        description: 로그인 성공.
 *      400:
 *        description: 로그인 정보 불충분. (사용자 이메일 또는 비밀번호 중 하나 이상이 주어지지 않음)
 *      401:
 *        description: 로그인 실패.
 *      500:
 *        description: 비밀번호 암호화 오류 또는 DB 커넥션 오류.
 */
router.get("/login", async (request, response) => {
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
              response.sendStatus(200);
            } else response.sendStatus(401);
          }
        }
      );
    }
  });
});

/**
 * @swagger
 * /user/logout:
 *  get:
 *    tags: [user]
 *    description: 세션을 삭제합니다.
 *
 *    responses:
 *      200:
 *        description: 로그아웃 성공.
 *      401:
 *        description: 로그아웃 실패. (이미 로그아웃되어 있음)
 */
router.get("/logout", session_check, (request, response) => {
  request.session.destroy(() => {
    request.session;
  });
  response.sendStatus(200);
});

/**
 * @swagger
 * /user/delete:
 *  delete:
 *    tags: [user]
 *    description: 특정 사용자를 삭제합니다.
 *    parameters:
 *      - in: query
 *        name: "user_email"
 *        schema:
 *          type: string
 *        description: "사용자 이메일"
 *        required: true
 *
 *    responses:
 *      200:
 *        description: 삭제 성공.
 *      403:
 *        description: 삭제 권한이 없음.
 *      404:
 *        description: 해당 이메일의 사용자가 존재하지 않음.
 *      500:
 *        description: DB 커넥션 오류.
 */

router.delete("/delete", session_check, async (request, response) => {
  const user_email = request.query.user_email;
  if (user_email !== request.session.user_email) {
    response.sendStatus(403);
  } else {
    const db_pool = await mysql_pool.get_pool();
    db_pool.getConnection((error, connection) => {
      if (error) response.sendStatus(500);
      else {
        connection.query(
          "DELETE FROM users WHERE email='" + user_email + "';",
          (error, result) => {
            if (error) response.sendStatus(500);
            else {
              if (result.affectedRows === 0) response.sendStatus(404);
              else {
                request.session.destroy(() => {
                  request.session;
                });
                response.sendStatus(200);
              }
            }
          }
        );
      }
    });
  }
});

/**
 * @swagger
 * /user/update:
 *  put:
 *    tags: [user]
 *    description: 특정 사용자의 정보를 수정합니다.
 *    parameters:
 *      - in: query
 *        name: "user_email"
 *        schema:
 *          type: string
 *        description: "사용자 이메일"
 *        required: true
 *    requestBody:
 *      description: 수정할 사용자 정보
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              name:
 *                type: string
 *              password:
 *                type: string
 *
 *    responses:
 *      200:
 *        description: 수정 성공.
 *      403:
 *        description: 수정 권한이 없음.
 *      404:
 *        description: 해당 이메일의 사용자가 존재하지 않음.
 *      500:
 *        description: DB 커넥션 오류.
 */

router.put("/update", session_check, async (request, response) => {
  const user_email = request.query.user_email;
  if (user_email !== request.session.user_email) {
    response.sendStatus(403);
  } else {
    let update_sql = "UPDATE users SET ";
    if (request.body.name !== undefined) {
      update_sql += "name='" + request.body.name + "' ";
    }
    if (request.body.password !== undefined) {
      const new_password = bcrypt.hashSync(request.body.password, 5);
      update_sql += "password='" + new_password + "' ";
    }
    update_sql += "WHERE email='" + user_email + "';";
    const db_pool = await mysql_pool.get_pool();
    db_pool.getConnection((error, connection) => {
      if (error) response.sendStatus(500);
      else {
        connection.query(update_sql, (error, result) => {
          if (error) response.sendStatus(500);
          else {
            if (result.affectedRows === 0) response.sendStatus(403);
            else response.sendStatus(200);
          }
        });
      }
    });
  }
});

module.exports = router;
