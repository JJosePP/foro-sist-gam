import mongoose from "mongoose";
import { basedSchema } from "../utils/namedEntitySchema.js";

const Genre = mongoose.model("Genre", basedSchema);

export default Genre;
