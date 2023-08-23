export const okResp = <D>(msg: string, data: D): { message: string, data: D } => {
  return {
      message: msg,
      data: data
  };
};

export const errResp = <E>(msg: string): { error: string } => {
  return {
      error: msg
  };
};
