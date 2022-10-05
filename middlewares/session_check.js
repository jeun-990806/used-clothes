const session_check = (request, response, next) => {
  if (request.session.user_email === undefined) response.sendStatus(401);
  else next();
};

module.exports = session_check;
