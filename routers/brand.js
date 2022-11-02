const router = require("express").Router();

const mysql_pool = require("../mysql_pools");
const session_check = require("../middlewares/session_check");

/**
 * @swagger
 * /brand/list:
 *  get:
 *    tags: [brand]
 *    summary: 등록된 브랜드 리스트를 가져옵니다.
 *    parameters:
 *      - in: query
 *        name: "name"
 *        schema:
 *          type: string
 *        description: "브랜드 이름"
 *
 *    responses:
 *      200:
 *        description: 브랜드 정보 리스트 JSON 반환
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  brand_id:
 *                    type: int
 *                    example: 1
 *                  name:
 *                    type: string
 *                    example: 브랜드이름
 *      500:
 *        description: DB 커넥션 오류.
 */
router.get("/list", async (request, response) => {
  let name_filter = request.query.name;
  if (name_filter === undefined) name_filter = "";
  name_filter = "%" + name_filter + "%";
  const db_pool = await mysql_pool.get_pool();
  db_pool.getConnection((error, connection) => {
    if (error) response.sendStatus(500);
    else {
      connection.query(
        "SELECT * FROM brands WHERE name LIKE '" + name_filter + "';",
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
 * /brand/create:
 *  post:
 *    tags: [brand]
 *    summary: 브랜드를 새로 등록합니다.
 *    requestBody:
 *      description: 브랜드 정보
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              name:
 *                type: string
 *                example: 새 브랜드
 *
 *    responses:
 *      200:
 *        description: 등록한 브랜드 정보 JSON 반환
 *        content:
 *          application/json:
 *            schema:
 *              properties:
 *                brand_id:
 *                  type: int
 *                  example: 33
 *                name:
 *                  type: string
 *                  example: 새 브랜드
 *      401:
 *        description: 로그인하지 않은 사용자.
 *      409:
 *        description: 이미 존재하는 브랜드.
 *      500:
 *        description: DB 커넥션 오류.
 */
router.post("/create", session_check, async (request, response) => {
  const new_brand_name = request.body.name;
  const db_pool = await mysql_pool.get_pool();
  db_pool.getConnection((error, connection) => {
    if (error) response.sendStatus(500);
    else {
      connection.query(
        "SELECT * FROM brands WHERE name='" + new_brand_name + "';",
        (error, rows) => {
          if (error) response.sendStatus(500);
          else if (rows.length == 0) {
            connection.query(
              "INSERT INTO brands (name) VALUES ('" + new_brand_name + "');",
              (error, result) => {
                if (error) response.sendStatus(500);
                else {
                  response.status(200);
                  response.send({
                    brand_id: result["insertId"],
                    name: new_brand_name,
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
