import mongoose from "mongoose";
import { basedSchema } from "../utils/namedEntitySchema.js";


const Tag = mongoose.model("Tag", basedSchema)

export default Tag;