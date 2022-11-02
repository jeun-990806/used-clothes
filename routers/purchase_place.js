const router = require("express").Router();

const mysql_pool = require("../mysql_pools");
const session_check = require("../middlewares/session_check");

/**
 * @swagger
 * /purchase_place/list:
 *  get:
 *    tags: [purchase_place]
 *    summary: 등록된 구입처 리스트를 가져옵니다.
 *    parameters:
 *      - in: query
 *        name: "name"
 *        schema:
 *          type: string
 *        description: "구입처 이름"
 *
 *    responses:
 *      200:
 *        description: 구입처 정보 리스트 JSON 반환
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  purchase_place_id:
 *                    type: int
 *                    example: 1
 *                  name:
 *                    type: string
 *                    example: 구입처이름
 *      500:
 *        description: DB 커넥션 오류.
 */
router.get("/list", async (request, response) => {
  let name_filter = request.query.name;
  if (name_filter === undefined) name_filter = "";
  const db_pool = await mysql_pool.get_pool();
  db_pool.getConnection((error, connection) => {
    if (error) response.sendStatus(500);
    else {
      connection.query(
        "SELECT * FROM purchase_place WHERE name LIKE '%" + name_filter + "%';",
        (error, rows) => {
          if (error) response.sendStatus(500);
          else {
            response.status(200);
            response.send(rows);
          }
        }
      );
    }
  });
});

/**
 * @swagger
 * /purchase_place/create:
 *  post:
 *    tags: [purchase_place]
 *    summary: 구입처를 새로 등록합니다.
 *    requestBody:
 *      description: 구입처 정보
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              name:
 *                type: string
 *                example: 새 구입처
 *
 *    responses:
 *      200:
 *        description: 등록한 구입처 정보 JSON 반환
 *        content:
 *          application/json:
 *            schema:
 *              properties:
 *                purchase_place_id:
 *                  type: int
 *                  example: 33
 *                name:
 *                  type: string
 *                  example: 새 구입처
 *      401:
 *        description: 로그인하지 않은 사용자.
 *      409:
 *        description: 이미 존재하는 구입처.
 *      500:
 *        description: DB 커넥션 오류.
 */
router.post("/create", session_check, async (request, response) => {
  const new_place_name = request.body.name;
  const db_pool = await mysql_pool.get_pool();
  db_pool.getConnection((error, connection) => {
    if (error) response.sendStatus(500);
    else {
      connection.query(
        "SELECT * FROM purchase_place WHERE name='" + new_place_name + "';",
        (error, rows) => {
          if (error) response.sendStatus(500);
          else if (rows.length == 0) {
            connection.query(
              "INSERT INTO purchase_place (name) VALUES ('" +
                new_place_name +
                "');",
              (error, result) => {
                if (error) response.sendStatus(500);
                else {
                  response.status(200);
                  response.send({
                    purchase_place_id: result["insertId"],
                    name: new_place_name,
                  });
                }
              }
            );
          } else response.sendStatus(409);
        }
      );
    }
  });
});

module.exports = router;
