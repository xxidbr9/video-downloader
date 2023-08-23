class ErrorAuth extends Error {
  code: number;

  constructor(msg: string) {
    super(msg);
    this.message = "auth error";
    this.name = "AUTH_ERROR";
    this.code = 403;
  }
}

class ErrorKey extends Error {
  code: number;

  constructor(msg: string) {
    super(msg);
    this.message = "key error";
    this.name = "KEY_ERROR";
    this.code = 403;
  }
}

class ErrorServer extends Error {
  code: number;

  constructor(msg: string) {
    super(msg);
    this.message = "server error";
    this.name = "SERVE_ERROR";
    this.code = 500;
  }
}

export {
  ErrorAuth,
  ErrorKey,
  ErrorServer
};
