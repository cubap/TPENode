import jwt from 'jsonwebtoken';
// import MailerService from './mailer';
import config from '../config/index.js';
import argon2 from 'argon2';
import EventDispatcher from '../decorators/eventDispatcher.js';

export default class AuthService {
    constructor() {
    }

    async SignUp(userInputDTO) {
        try {
            const salt = crypto.randomBytes(32)
            const hashedPassword = await argon2.hash(userInputDTO.password, { salt })
            const userRecord = await this.userModel.create({
                ...userInputDTO,
                salt: salt.toString('hex'),
                password: hashedPassword,
            })
            const token = this.generateToken(userRecord)

            if (!userRecord) {
                throw new Error('User cannot be created')
            }
            //      await this.mailer.SendWelcomeEmail(userRecord)

            EventDispatcher(events.user.signUp, { user: userRecord })
            const user = userRecord.toObject()
            delete user.password
            delete user.salt
            return { user, token };
        } catch (e) { 
            log(e)
            throw e 
        }
    }

    async SignIn(email, password) {
        const userRecord = await this.userModel.findOne({ email })
        if (!userRecord) {
            throw new Error('User not registered')
        }
        /**
         * We use verify from argon2 to prevent 'timing based' attacks
         */
        const validPassword = await argon2.verify(userRecord.password, password)
        if (validPassword) {
            const token = this.generateToken(userRecord)
            const user = userRecord.toObject()
            delete user.password
            delete user.salt
            return { user, token }
        } else {
            throw new Error('Invalid Password')
        }
    }

    generateToken(user) {
        const today = new Date();
        const exp = new Date(today);
        exp.setDate(today.getDate() + 60);

        /**
         * A JWT means JSON Web Token, so basically it's a json that is _hashed_ into a string
         * The cool thing is that you can add custom properties a.k.a metadata
         * Here we are adding the userId, role and name
         * Beware that the metadata is public and can be decoded without _the secret_
         * but the client cannot craft a JWT to fake a userId
         * because it doesn't have _the secret_ to sign it
         * more information here: https://softwareontheroad.com/you-dont-need-passport
         */
        return jwt.sign(
            {
                _id: user._id, // We are gonna use this in the middleware 'isAuth'
                role: user.role,
                name: user.name,
                exp: exp.getTime() / 1000,
            },
            config.jwtSecret || "forceWorkingAnyway"
        )
    }
}