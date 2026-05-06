import mongoose from "mongoose";
import { basedSchema } from "../utils/namedEntitySchema.js";

const Platform = mongoose.model("Platform", basedSchema)

export default Platform;