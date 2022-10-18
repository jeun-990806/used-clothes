const clothe_field_validator = (request, response, next) => {
  var required_fields = [
    "clothe_name",
    "main_category_id",
    "sub_category_id",
    "price",
    "condition_code",
    "shipping_fee",
  ];
  var required_fields_number = 5;
  var field_idx = 0;
  for (var field in request.body) {
    field_idx = required_fields.indexOf(field);
    if (field_idx !== -1) {
      required_fields[field_idx] = undefined;
      required_fields_number -= 1;
    }
  }

  if (required_fields_number === 0) next();
  else response.sendStatus(400);
};

module.exports = clothe_field_validator;
