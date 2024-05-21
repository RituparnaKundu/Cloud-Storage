//helper function to get mongo id from acess token
import jwt from 'jsonwebtoken';
export const getId = (token) => {
    if (!token) return null;
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    return decodedData?.id || decodedData?.sub;
}
