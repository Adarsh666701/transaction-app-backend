import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async ()  => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDb connected succesfully');
    }
    catch(err){
        console.error('Error connecting to MongoDb', err);
        process.exit(1);
    }
}


const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password:{
        type:String,
        required:true,
        minlength:8,
    }
})

userSchema.pre('save', async function(next){
    if (!this.isModified('password')){
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    next();
});

userSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password); 
}

const User = mongoose.model('User', userSchema);

module.exports = User;