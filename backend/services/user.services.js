const userModel=require("../models/user.js");

module.exports.createUser= async ({
    firstname,lastname,email,password
}) => {
    if (!firstname || !email || !password) {
        throw new Error("Missing required fields");
    }
    const user = await userModel.create({
        fullname: {
            firstname,
            lastname
        },
        email,
        password: await userModel.hashPassword(password)
    });
    return user;
};