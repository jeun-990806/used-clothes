const router = require("express").Router();

const mysql_pool = require("../mysql_pools");

/**
 * @swagger
 * /location/scope_a/list:
 *  get:
 *    tags: [location]
 *    summary: 시/도 지역 코드와 지역명을 반환합니다.
 *
 *    responses:
 *      200:
 *        description: 시/도 정보 리스트 JSON 반환
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  scope_a_code:
 *                    type: string
 *                    example: 11
 *                  scope_a_name:
 *                    type: string
 *                    example: 서울특별시
 *      500:
 *        description: DB 커넥션 오류.
 */
router.get("/scope_a/list", async (request, response) => {
  const db_pool = await mysql_pool.get_pool();
  db_pool.getConnection((error, connection) => {
    if (error) response.sendStatus(500);
    else {
      connection.query("SELECT * FROM location_scope_a;", (error, rows) => {
        if (error) response.sendStatus(500);
        else {
          response.status(200);
          let result = [];
          for (var row of rows) {
            result.push({
              scope_a_code: row["location_scope_a_code"],
              scope_a_name: row["name"],
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
 * /location/scope_b/list:
 *  get:
 *    tags: [location]
 *    summary: 시/군/구 지역 코드와 지역명을 반환합니다.
 *
 *    responses:
 *      200:
 *        description: 시/군/구 정보 리스트 JSON 반환
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  scope_a_code:
 *                    type: string
 *                    example: 11
 *                  scope_a_name:
 *                    type: string
 *                    example: 서울특별시
 *                  scope_b_code:
 *                    type: string
 *                    example: 11010
 *                  scope_b_name:
 *                    type: string
 *                    example: 종로구
 *      500:
 *        description: DB 커넥션 오류.
 */

router.get("/scope_b/list", async (request, response) => {
  const db_pool = await mysql_pool.get_pool();
  db_pool.getConnection((error, connection) => {
    if (error) response.sendStatus(500);
    else {
      connection.query(
        "SELECT B.location_scope_a_code AS scope_a_code, A.name AS scope_a_name, B.location_scope_b_code AS scope_b_code, B.name AS scope_b_name FROM location_scope_b AS B JOIN location_scope_a as A ON A.location_scope_a_code=B.location_scope_a_code;",
        (error, rows) => {
          if (error) response.sendStatus(500);
          else {
            response.status(200);
            let result = [];
            for (var row of rows) {
              result.push({
                scope_a_code: row["scope_a_code"],
                scope_a_name: row["scope_a_name"],
                scope_b_code: row["scope_b_code"],
                scope_b_name: row["scope_b_name"],
              });
            }
            response.send(result);
          }
        }
      );
    }
  });
});

/**
 * @swagger
 * /location/scope_c/list:
 *  get:
 *    tags: [location]
 *    summary: 동/읍/면 지역 코드와 지역명을 반환합니다.
 *
 *    responses:
 *      200:
 *        description: 동/읍/면 정보 리스트 JSON 반환
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  scope_a_code:
 *                    type: string
 *                    example: 11
 *                  scope_a_name:
 *                    type: string
 *                    example: 서울특별시
 *                  scope_b_code:
 *                    type: string
 *                    example: 11010
 *                  scope_b_name:
 *                    type: string
 *                    example: 종로구
 *                  scope_c_code:
 *                    type: string
 *                    example: 1101053
 *                  scope_c_name:
 *                    type: string
 *                    example: 사직동
 *      500:
 *        description: DB 커넥션 오류.
 */

router.get("/scope_c/list", async (request, response) => {
  const db_pool = await mysql_pool.get_pool();
  db_pool.getConnection((error, connection) => {
    if (error) response.sendStatus(500);
    else {
      connection.query(
        "SELECT C.location_scope_a_code AS scope_a_code, A.name AS scope_a_name, B.location_scope_b_code AS scope_b_code, B.name AS scope_b_name, C.location_scope_c_code AS scope_c_code, C.name AS scope_c_name FROM (location_scope_b AS B JOIN location_scope_a AS A ON A.location_scope_a_code=B.location_scope_a_code) JOIN location_scope_c AS C ON C.location_scope_b_code=B.location_scope_b_code;",
        (error, rows) => {
          if (error) response.sendStatus(500);
          else {
            response.status(200);
            let result = [];
            for (var row of rows) {
              result.push({
                scope_a_code: row["scope_a_code"],
                scope_a_name: row["scope_a_name"],
                scope_b_code: row["scope_b_code"],
                scope_b_name: row["scope_b_name"],
                scope_c_code: row["scope_c_code"],
                scope_c_name: row["scope_c_name"],
              });
            }
            response.send(result);
          }
        }
      );
    }
  });
});

module.exports = router;
