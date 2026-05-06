import mongoose from "mongoose";
import { basedSchema } from "../utils/namedEntitySchema.js";


const Category = mongoose.model("Category", basedSchema)

export default Category;