const dictionary_to_sql = (table_name, dict) => {
  let fields = "(";
  let values = "(";
  for (var field in dict) {
    fields += field + ", ";
    if (typeof dict[field] === "string") values += "'" + dict[field] + "', ";
    else values += dict[field] + ", ";
  }
  fields = fields.slice(0, -2) + ")";
  values = values.slice(0, -2) + ")";
  return `INSERT INTO ${table_name} ${fields} VALUES ${values};`;
};

const tools = {
  dictionary_to_sql: dictionary_to_sql,
};

module.exports = tools;
