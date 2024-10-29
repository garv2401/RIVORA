const Users=require('../models/userModel');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken')

const userCtrl={

    register:async(req,res)=>{
        try{
            const {name,email,password}=req.body;

            const user=await Users.findOne({email});
            if(user){
                return res.status(400).json({msg:"Email already registered"})
            }
            if(password.length<8){
                return res.status(400).json({msg:"Password must be atleast 8 characters long"})
            }

            //password encryptoin
            const passwordhash=await bcrypt.hash(password,10);

            const newUser=new Users({
                name,email,password:passwordhash
            })

            await newUser.save()

            //create jwt to authentication
            const accessToken=createAccessToken({id:newUser._id});
            const refreshToken=createRefreshToken({id:newUser._id});


            //setting up a cookie
            res.cookie('refreshtoken',refreshToken,{
                httpOnly:true,
                path:'/user/refresh_token'

            })

            res.json({msg:"Register Success",accessToken})
            // res.json(accessToken)

        }
        catch(err){
            return res.status(500).json({msg:err.message})
        }
    },
    refreshToken: async (req, res) => {

        try {
            const rf_token = req.cookies.refreshtoken;

            if (!rf_token) {
                return res.status(400).json({ msg: "Please Login or Registers" });
            }

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if (err) {
                    return res.status(400).json({ msg: "Please Login or Registerss" });
                }

                const accesstoken = createAccessToken({ id: user.id });
                return res.json({ user, accesstoken });
            });

        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    login:async(req,res)=>{
        try{
            const {email,password}=req.body;
            const user=await Users.findOne({email});

        if(!user){
            return res.status(400).json({msg:"User Not Found!"})
        }

        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({msg:"Incorrect Password!"})

        }

        const accessToken=createAccessToken({id:user._id})
        const refreshToken=createRefreshToken({id:user._id})

        res.cookie('refreshtoken',refreshToken,{
            httpOnly:true,
            path:'/user/refresh_token'

        })

        return res.json({msg:"Login Succesfull!",accessToken})

        }catch(err){
            return res.status(500).json({msg:err.message})
        }
    },
    logout:async(req,res)=>{
        try{
            res.clearCookie('refreshtoken',{path:'/user/refresh_token'})
            return res.json({msg:'Logged out'})

        }catch(err){
            return res.json({msg:err.message})
        }
    },
    getuser:async(req,res)=>{
        try{
            const user=await Users.findById(req.user.id).select('-password');
            if(!user){
                return res.status(400).json({msg:"User not found"})
            }
            res.json(user);

        }catch(err){

        }
    }
}

const createAccessToken=(payload)=>{
    return jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1d'})
}
const createRefreshToken=(payload)=>{
    return jwt.sign(payload,process.env.REFRESH_TOKEN_SECRET,{expiresIn:'7d'})
}

module.exports=userCtrl;