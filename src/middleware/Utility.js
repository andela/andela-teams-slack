export default class Utility {
  async postWelcomeMessage(req, res, next) {
    res.status(200).send(':wave: Welcome to Andela Teams :welcome_:');
    next();
  }
}