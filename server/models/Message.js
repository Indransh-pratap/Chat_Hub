import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {type:mongoose.Schema.Types.ObjectId,ref:"User",require:true},
   receiverId: {type:mongoose.Schema.Types.ObjectId,ref:"User",require:true},
text:{type: String,},
image:{type:String},
video:{type:String},
type: { type: String, enum: ['text', 'image', 'video', 'game-invite', 'game_invite'], default: 'text' },
gameId: { type: String },
status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
seen:{type: Boolean,default:false}
},{timestamps:true});
const Message = mongoose.model("Message",messageSchema);

export default Message;
