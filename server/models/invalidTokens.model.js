import mongoose from "mongoose";

const invalidTokenSchema = new mongoose.Schema({
    tokenId: {
        type: String,
        required: [true, "El id del token es requerido"],
        unique: true,
    },
    expireAt: {
        type: Date,
        required: [true, "La fecha de publicación es requerida"],
        expires: 0,
    },
});

const invalidToken = mongoose.model("invalidToken", invalidTokenSchema);

export default invalidToken;
