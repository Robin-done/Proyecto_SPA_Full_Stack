const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`
            ${new Date().toISOString()} - ${req.method} ${req.orinalUrl} - Status: ${res.statusCode} - Duración: ${duration}ms - IP: ${req.ip} - User Agent: ${req.get("User-Agent")?.substring(0, 50)}...
            `);
  });
  next();
};

const errorLogger = (error, req, res, next) => {
  console.error("Error LOG");
  console.error("Timestamp:", new Date().toISOString());
  console.error("Method:", req.method);
  console.error("URL:", req.orinalUrl);
  console.error("Message:", error.message);
  console.error("Stack:", error.stack);
  //console.error("----", repeat(20));

  next(error);
};
export { requestLogger, errorLogger };
