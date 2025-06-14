const User = require('./mongodb/User');
const { generateAuthToken } = require("../../auth/providers/jwt");
const { generatePassword, comparePasswords } = require('../helpers/bcrypt');

const registerUser = async (newUser) => {
    try {
        const existingUser = await User.findOne({ email: newUser.email });
        if (existingUser) {
            const error = new Error("Error: User already exists, please login");
            error.status = 400;
            throw error;
        }
        newUser.password = await generatePassword(newUser.password);
        let user = new User(newUser);
        user = await user.save();
        const lessInfoUser = { email: user.email, name: user.name, _id: user._id };
        return lessInfoUser;
    } catch (error) {
        throw error;
    }
};

const getUser = async (userId) => {
    try {
        let user = await User.findById(userId);
        return user;
    }
    catch (err) {
        throw err;
    }
};

const loginUser = async (email, password) => {
    try {
        const userFromDB = await User.findOne({ email: email });
        if (!userFromDB) {
            const error = new Error("Error: User not found. Please register");
            error.status = 401;
            throw error;
        }

        const isPasswordCorrect = await comparePasswords(password, userFromDB.password);
        if (!isPasswordCorrect) {
            const error = new Error("Error: Password incorrect");
            error.status = 401;
            throw error;
        }

        const token = generateAuthToken(userFromDB);
        return {
            token,
            user: {
                _id: userFromDB._id,
                email: userFromDB.email,
                name: userFromDB.name,
                isAdmin: userFromDB.isAdmin,
                isBusiness: userFromDB.isBusiness
            }
        };
    }
    catch (err) {
        throw err;
    }
};

const updateUser = async (userId, updatedUser) => {
    try {
        let user = await User.findByIdAndUpdate(userId, updatedUser, { new: true });
        return user;
    } catch (err) {
        throw err;
    }
}

// const patchBusinessStatus = async (userId) => {
//     try {
//         const user = await User.findById(userId);
//         if (!user) {
//             throw new Error("User not found");
//         }
//         const updatedUser = await User.findByIdAndUpdate(
//             userId,
//             { $set: { isBusiness: !user.isBusiness } },
//             { new: true, runValidators: true }
//         );
//         return updatedUser;
//     } catch (err) {
//         throw err;
//     }
// };

const getUsers = async () => {
    try {
        let users = User.find();
        return users;
    }
    catch (err) {
        throw err;
    }
}

const deleteUser = async (userId) => {
    try {
        let user = await User.findByIdAndDelete(userId);
        return user;
    }
    catch (err) {
        throw err;
    }
}

module.exports = { registerUser, getUser, loginUser, updateUser, getUsers, deleteUser };