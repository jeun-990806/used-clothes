const router = require("express").Router();

const mysql_pool = require("../mysql_pools");
const image_file_uploader = require("../middlewares/image_uploader");
const session_check = require("../middlewares/session_check");
const tools = require("../tools/tools");

/**
 * @swagger
 * /clothe/create:
 *  post:
 *    tags: [clothe]
 *    summary: 판매할 의류를 등록합니다.
 *    requestBody:
 *      description: 의류 정보
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            properties:
 *              images:
 *                type: string
 *              name:
 *                type: string
 *              category_id:
 *                type: integer
 *              price:
 *                type: string
 *              condition_code:
 *                type: integer
 *              shipping_fee:
 *                type: string
 *              brand_id:
 *                type: integer
 *              purchase_place_id:
 *                type: integer
 *              ex_price:
 *                type: string
 *              color_code_1:
 *                  type: string
 *              color_code_2:
 *                  type: string
 *              purchase_date:
 *                  type: string
 *              material_code_1:
 *                  type: integer
 *              material_code_2:
 *                  type: integer
 *              material_code_3:
 *                  type: integer
 *          encoding:
 *            images:
 *              contentType: image/png, image/jpg, image/jpeg
 *
 *    responses:
 *      200:
 *        description: 의류 정보 업로드 완료.
 *      401:
 *        description: 로그인하지 않은 사용자.
 *      500:
 *        description: DB 커넥션 오류.
 */

router.post(
  "/create",
  session_check,
  image_file_uploader,
  async (request, response) => {
    clothe_info = request.body;
    clothe_info["user_email"] = request.session.user_email;
    clothe_info["category_id"] = Number(clothe_info["category_id"]);
    clothe_info["price"] = Number(clothe_info["price"]);
    clothe_info["condition_code"] = Number(clothe_info["condition_code"]);
    clothe_info["shipping_fee"] = Number(clothe_info["shipping_fee"]);
    var current_date = new Date();
    clothe_info[
      "upload_date"
    ] = `${current_date.getFullYear()}-${current_date.getMonth()}-${current_date.getDay()}`;
    clothe_info[
      "upload_time"
    ] = `${current_date.getHours()}:${current_date.getMinutes()}:${current_date.getSeconds()}`;
    if (clothe_info["brand_id"] !== undefined)
      clothe_info["brand_id"] = Number(clothe_info["brand_id"]);
    if (clothe_info["purchase_place_id"] !== undefined)
      clothe_info["purchase_place_id"] = Number(
        clothe_info["purchase_place_id"]
      );
    if (clothe_info["ex_price"] !== undefined)
      clothe_info["ex_price"] = Number(clothe_info["ex_price"]);
    if (clothe_info["material_code_1"] !== undefined)
      clothe_info["material_code_1"] = Number(clothe_info["material_code_1"]);
    if (clothe_info["material_code_2"] !== undefined)
      clothe_info["material_code_2"] = Number(clothe_info["material_code_2"]);
    if (clothe_info["material_code_3"] !== undefined)
      clothe_info["material_code_3"] = Number(clothe_info["material_code_3"]);
    const db_pool = await mysql_pool.get_pool();
    db_pool.getConnection((error, connection) => {
      if (error) response.sendStatus(500);
      else {
        connection.query(
          tools.dictionary_to_sql("clothes", clothe_info),
          (error, result) => {
            if (error) response.sendStatus(400);
            else {
              var clothe_id = result.insertId;
              var status_code = 200;
              for (var image_file of request.files) {
                console.log(image_file);
                var file_name = image_file.filename;
                var file_type = image_file.mimetype;
                var current_date = new Date();
                var upload_date = `${current_date.getFullYear()}-${current_date.getMonth()}-${current_date.getDay()}`;
                var upload_time = `${current_date.getHours()}:${current_date.getMinutes()}:${current_date.getSeconds()}`;
                connection.query(
                  `INSERT INTO images (file_name, clothe_id, user_email, file_type, upload_date, upload_time) VALUES ('${file_name}', '${clothe_id}', '${request.session.user_email}', '${file_type}', '${upload_date}', '${upload_time}');`,
                  (error, result) => {
                    if (error) status_code = 500;
                  }
                );
                if (status_code === 500) break;
              }
              response.sendStatus(status_code);
            }
          }
        );
      }
    });
  }
);

/**
 * @swagger
 * /clothe/read:
 *  get:
 *    tags: [clothe]
 *    description: 등록된 의류 정보를 받아옵니다.
 *    parameters:
 *      - in: query
 *        name: "clothe_id"
 *        schema:
 *          type: number
 *        description: "의류 ID"
 *        required: true
 *
 *    responses:
 *      200:
 *        description: 조회 성공. 의류 등록 정보 JSON 반환.
 *      400:
 *        description: 의류 ID 주어지지 않음.
 *      404:
 *        description: 해당 ID의 의류가 존재하지 않음.
 *      500:
 *        description: DB 커넥션 오류.
 */

router.get("/read", async (request, response) => {
  var clothe_id = request.query.clothe_id;

  if (clothe_id === undefined) {
    response.sendStatus(400);
    return;
  }

  const db_pool = await mysql_pool.get_pool();
  db_pool.getConnection((error, connection) => {
    if (error) response.sendStatus(500);
    else {
      connection.query(
        `SELECT * FROM clothes JOIN images ON clothes.clothe_id=images.clothe_id WHERE clothes.clothe_id=${clothe_id}`,
        (error, rows) => {
          if (error) response.sendStatus(500);
          else {
            if (rows.length === 0) response.sendStatus(401);
            else {
              const { file_name, file_type, ...result } = rows[0];
              result["images"] = [];
              for (var file_data of rows) {
                result["images"].push({
                  file_name: file_data.file_name,
                });
              }
              response.status(200);
              response.send(result);
            }
          }
        }
      );
    }
  });
});

/**
 * @swagger
 * /clothe/list:
 *  get:
 *    tags: [clothe]
 *    description: 필터 조건을 만족하는 의류 정보 리스트를 반환합니다.
 *    parameters:
 *      - in: query
 *        name: "filters"
 *        schema:
 *          type: string
 *        description: "검색을 원하는 조건. ','로 구분합니다. (ex key1=value1,key2=value2)<br><br>
 *                      <b>검색 가능한 키 값</b>: <br>
 *                       <ul>
 *                        <li>user_email: 등록한 사용자 이메일</li>
 *                        <li>name: 등록된 이름</li>
 *                        <li>category_id: 카테고리</li>
 *                        <li>max_price: 최대 가격</li>
 *                        <li>min_price: 최소 가격</li>
 *                        <li>shipping_fee: 배송비</li>
 *                        <li>brand_id: 브랜드</li>
 *                        <li>purchase_place_id: 구입처</li>
 *                        <li>color_code: 색상</li>
 *                        <li>material_code: 소재</li>
 *                       </ul>"
 *        required: true
 *
 *    responses:
 *      200:
 *        description: 조회 성공. 의류 정보 JSON 반환.
 *      500:
 *        description: DB 커넥션 오류.
 */

const query_parser = (query) => {
  return [...query.matchAll(/(?<key>[a-z_]+)=(?<value>[a-z0-9_]+)/g)];
};

module.exports = router;
