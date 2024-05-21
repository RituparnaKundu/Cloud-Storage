import jwt from 'jsonwebtoken';

export const auth = async (req, res, next) => {
  try {
    const token = req.headers?.authorization?.split(" ")[1];
    const isCustomAuth = token?.length < process.env.JWT_AUTH_TOKEN_LENGTH; // Define a reasonable length

    let decodedData;

    if (token && isCustomAuth) {
      decodedData = jwt.verify(token, process.env.JWT_SECRET);
    } else {
      decodedData = jwt.decode(token);
    }

    req.userId = decodedData?.id || decodedData?.sub; // Use id or sub claim
    console.log("token working");
    next();

  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid or missing token" });
  }
};
