const errorHandler = (err, req, res, next) => {
  console.error(err);

  const status = err.status || err.statusCode || 500;
  const payload = {
    error: err.message || "Internal Server Error",
  };

  if (process.env.NODE_ENV !== "production") {
    payload.details = err.details || err.stack;
  }

  res.status(status).json(payload);
};

export default errorHandler;
