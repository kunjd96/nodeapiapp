const logger = (req, res, next) => {
    req.hello = "Kunj";
    console.log("Middlewrae run");
    next();
}
module.exports = logger;