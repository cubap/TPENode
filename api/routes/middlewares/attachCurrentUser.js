// import mongoose from 'mongoose';

/**
 * Attach user to req.currentUser
 * @param {*} req Express req Object
 * @param {*} res  Express res Object
 * @param {*} next  Express next Function
 */
const attachCurrentUser = async (req, res, next) => {
  try {
//    const userRecord = await UserModel.findById(req.token._id)
    const userRecord = { _id: "dummy", name:"theFirst", mail: "not@real.user" }
    if (!userRecord) {
      return res.sendStatus(401)
    }
    const currentUser = userRecord.toObject()
    Reflect.deleteProperty(currentUser, 'password')
    Reflect.deleteProperty(currentUser, 'salt')
    req.currentUser = currentUser
    return next()
  } catch (e) {
    Logger.error('🔥 Error attaching user to req: %o', e)
    return next(e)
  }
}

export default attachCurrentUser;