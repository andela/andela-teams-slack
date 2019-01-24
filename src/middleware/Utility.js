export default class Utility {
  async postEmptyMessage(req, res, next) {
    res.status(200).send();
    next();
  }
  async postWelcomeMessage(req, res, next) {
    res.status(200).send(':wave: Welcome to Andela Teams :welcome_:');
    next();
  }
}