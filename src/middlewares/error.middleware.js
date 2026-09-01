const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    erro: true,
    mensagem: err.message || 'Erro interno do servidor',
    codigo: err.code || 'INTERNAL_SERVER_ERROR'
  });
};

module.exports = errorHandler;
