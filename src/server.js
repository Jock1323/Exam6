import http from "http"
import {read,write} from "./utils/FS.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

const options={
    "content-type":"application/json"
}
dotenv.config()

http.createServer((req,res)=>{
    if(req.method=="GET"){
        const branchesUrl=req.url.split("/")[1]
        const brancheId=req.url.split("/")[2]
        const marketsUrl=req.url.split("/")[1]
        const marketId=req.url.split("/")[2]
        if(req.url=="/markets"){
            const {access_token}=req.headers
            if(!access_token){
                res.writeHead(400,options)
                res.end(JSON.stringify({
                message:"Provide with access token"
                }))
                return
            }
            jwt.verify(access_token,process.env.SECRET_KEY,(err,decode)=>{
                if(err instanceof jwt.JsonWebTokenError){
                    res.writeHead(401,options)
                    res.end(JSON.stringify({
                        message:"Invalid token"
                    })) 
                    return
                }
                const markets=read("markets.json")
                res.writeHead(200,options)
                res.end(JSON.stringify(markets))
            })
            return
        }
        if(marketsUrl=="markets" && marketId){
            const {access_token}=req.headers
            if(!access_token){
                res.writeHead(400,options)
                res.end(JSON.stringify({
                message:"Provide with access token"
                }))
                return
            }
            jwt.verify(access_token,process.env.SECRET_KEY,(err,decode)=>{
                if(err instanceof jwt.JsonWebTokenError){
                    res.writeHead(401,options)
                    res.end(JSON.stringify({
                        message:"Invalid token"
                    })) 
                    return
                }
                const markets=read("markets.json")
                const fullMarketResult=markets.find(item=>item.id==marketId)
                if(fullMarketResult){
                    const branches=read("branches.json")
                const workers=read("workers.json")
                const products=read("products.json")
                    const foundBranch=branches.filter(item=>item.marketId==marketId).filter(e=>e.marketId ? delete e.marketId :e)
                const foundWorkers=foundBranch.map(item=>workers.filter(e=>e.branchId==item.id).filter(e=>e.branchId ? delete e.branchId : e))
                const foundProducts=foundBranch.map(item=>products.filter(e=>e.branchId==item.id).filter(e=>e.branchId ? delete e.branchId : e))
                for(let i=0;i<foundBranch.length;i++){
                    foundBranch[i].workers=foundWorkers[i]
                    foundBranch[i].products=foundProducts[i]
                }
                fullMarketResult.branches=foundBranch
                res.writeHead(200,options)
                res.end(JSON.stringify(fullMarketResult))
                return
                }
                res.writeHead(400,options)
                res.end(JSON.stringify({
                    "message":"market not found"
                }))
            })
            return
        }
        if(branchesUrl=="branches" && brancheId){
            const {access_token}=req.headers
            if(!access_token){
                res.writeHead(400,options)
                res.end(JSON.stringify({
                message:"Provide with access token"
                }))
                return
            }
            jwt.verify(access_token,process.env.SECRET_KEY,(err,decode)=>{
                if(err instanceof jwt.JsonWebTokenError){
                    res.writeHead(401,options)
                    res.end(JSON.stringify({
                        message:"Invalid token"
                    })) 
                    return
                }
                const foundBranch=read("branches.json").find(item=>item.id==brancheId)
                if(foundBranch){
                    delete foundBranch.marketId
                const foundBranchWorkers=read("workers.json").filter(item=>item.branchId==brancheId).filter(e=>e.branchId ? delete e.branchId : e)
                const foundBranchProducts=read("products.json").filter(item=>item.branchId==brancheId).filter(e=>e.branchId ? delete e.branchId : e)
                foundBranch.workers=foundBranchWorkers
                foundBranch.products=foundBranchProducts
                res.writeHead(200,options)
                res.end(JSON.stringify(foundBranch))
                return
                }
                res.writeHead(400,options)
                res.end(JSON.stringify({
                message:"Branch not found"
                }))
                return
            })
            return
        }
        else{
            res.end("GET")
        }
    }
    if(req.method=="POST"){
        if(req.url=="/login"){
            req.on("data",chunc=>{
                const {username,password}=JSON.parse(chunc)
                console.log(username,password);
                const foundUser=read("users.json")
                if(foundUser.name==username && foundUser.password==password){
                    res.writeHead(201,options)
                    res.end(JSON.stringify({
                        "message":"successfully logged in",
                        "access_token":jwt.sign({id:foundUser?.id},process.env.SECRET_KEY)
                    }))
                    return
                }
                else{
                    res.writeHead(401,options)
                    res.end(JSON.stringify({
                        "message":"Please sign up ",
                    }))
                    return
                }
            })
        }
        if(req.url=="/markets"){
           req.on("data",chunc=>{
            const {access_token}=req.headers
            const {name}=JSON.parse(chunc)
            if(!access_token){
                res.writeHead(400,options)
                res.end(JSON.stringify({
                message:"Provide with access token"
                }))
                return
            }
            jwt.verify(access_token,process.env.SECRET_KEY,async(err,decode)=>{
                if(err instanceof jwt.JsonWebTokenError){
                    res.writeHead(401,options)
                    res.end(JSON.stringify({
                        message:"Invalid token"
                    })) 
                    return
                }
                const markets=read("markets.json")
                markets.push({
                    id:markets.at(-1)?.id+1 ||1,
                    name,
                })
               await write("markets.json",markets)
                res.writeHead(201,options)
                res.end(JSON.stringify(
                    {
                        "message":"Market added"
                    }
                ))
                return
            })
           })
        }
        if(req.url=="/branches"){
            req.on("data",chunc=>{
                const {access_token}=req.headers
                const {name,address,marketId}=JSON.parse(chunc)
                if(!access_token){
                    res.writeHead(400,options)
                    res.end(JSON.stringify({
                    message:"Provide with access token"
                    }))
                    return
                }
                jwt.verify(access_token,process.env.SECRET_KEY,async(err,decode)=>{
                    if(err instanceof jwt.JsonWebTokenError){
                        res.writeHead(401,options)
                        res.end(JSON.stringify({
                            message:"Invalid token"
                        })) 
                        return
                    }
                    const branches=read("branches.json")
                    branches.push({
                        id:branches.at(-1)?.id+1 ||1,
                        name,
                        address,
                        marketId
                    })
                   await write("branches.json",branches)
                    res.writeHead(201,options)
                    res.end(JSON.stringify(
                        {
                            "message":"Branch added"
                        }
                    ))
                    return
                })
               })
            
        }
        if(req.url=="/worker"){
            req.on("data",chunc=>{
                const {access_token}=req.headers
                const {name,phoneNumber,branchId}=JSON.parse(chunc)
                if(!access_token){
                    res.writeHead(400,options)
                    res.end(JSON.stringify({
                    message:"Provide with access token"
                    }))
                    return
                }
                jwt.verify(access_token,process.env.SECRET_KEY,async(err,decode)=>{
                    if(err instanceof jwt.JsonWebTokenError){
                        res.writeHead(401,options)
                        res.end(JSON.stringify({
                            message:"Invalid token"
                        })) 
                        return
                    }
                    const workers=read("workers.json")
                    workers.push({
                        id:workers.at(-1)?.id+1 ||1,
                        name,
                        phoneNumber,
                        branchId
                    })
                   await write("workers.json",workers)
                    res.writeHead(201,options)
                    res.end(JSON.stringify(
                        {
                            "message":"worker added"
                        }
                    ))
                    return
                })
               })   
        }
    }
    if(req.method=="PUT"){
        const marketUrl=req.url.split("/")[1]
        const marketId=req.url.split("/")[2]
        const branchesUrl=req.url.split("/")[1]
        const branchId=req.url.split("/")[2]
        const workersUrl=req.url.split("/")[1]
        const workerId=req.url.split("/")[2]

        if(marketUrl=="markets" && marketId){
           req.on("data",chunc=>{
            const {access_token}=req.headers
            const {name}=JSON.parse(chunc)
                if(!access_token){
                res.writeHead(400,options)
                res.end(JSON.stringify({
                message:"Provide with access token"
                }))
                return
            }
            jwt.verify(access_token,process.env.SECRET_KEY,async(err,decode)=>{
                if(err instanceof jwt.JsonWebTokenError){
                    res.writeHead(401,options)
                    res.end(JSON.stringify({
                        message:"Invalid token"
                    })) 
                    return
                }
                const markets=read("markets.json")
                const foundMarket=markets.find(item=>item.id==marketId)
                if(foundMarket){
                    foundMarket.name=name ||foundMarket.name
                await write("markets.json",markets)
                res.writeHead(201,options)
                res.end(JSON.stringify({
                    "message":"changes have been saved"
                }))
                return
                }
                res.writeHead(400,options)
                res.end(JSON.stringify({
                    "message":"market not found"
                }))
                return
            })
            return
           })
        }
        if(branchesUrl=="branches" && branchId){
           req.on("data",chunc=>{
            const {access_token}=req.headers
            const {name,address,marketId}=JSON.parse(chunc)
                if(!access_token){
                res.writeHead(400,options)
                res.end(JSON.stringify({
                message:"Provide with access token"
                }))
                return
            }
            jwt.verify(access_token,process.env.SECRET_KEY,async(err,decode)=>{
                if(err instanceof jwt.JsonWebTokenError){
                    res.writeHead(401,options)
                    res.end(JSON.stringify({
                        message:"Invalid token"
                    })) 
                    return
                }
                const branches=read("branches.json")
                const foundBranch=branches.find(item=>item.id==branchId)
                if(foundBranch){
                    foundBranch.name=name ||foundBranch.name
                    foundBranch.address=address ||foundBranch.address
                    foundBranch.marketId=marketId ||foundBranch.marketId
                await write("branches.json",branches)
                res.writeHead(201,options)
                res.end(JSON.stringify({
                    "message":"changes have been saved"
                }))
                return
                }
                res.writeHead(400,options)
                res.end(JSON.stringify({
                    "message":"branch not found"
                }))
                return
            })
            return
           })
        }
        if(workersUrl=="worker" && workerId){
           req.on("data",chunc=>{
            const {access_token}=req.headers
            const {name,phoneNumber,branchId}=JSON.parse(chunc)
                if(!access_token){
                res.writeHead(400,options)
                res.end(JSON.stringify({
                message:"Provide with access token"
                }))
                return
            }
            jwt.verify(access_token,process.env.SECRET_KEY,async(err,decode)=>{
                if(err instanceof jwt.JsonWebTokenError){
                    res.writeHead(401,options)
                    res.end(JSON.stringify({
                        message:"Invalid token"
                    })) 
                    return
                }
                const workers=read("workers.json")
                const foundWorker=workers.find(item=>item.id==workerId)
                if(foundWorker){
                    foundWorker.name=name ||foundWorker.name
                    foundWorker.phoneNumber=phoneNumber ||foundWorker.phoneNumber
                    foundWorker.branchId=branchId ||foundWorker.branchId
                await write("workers.json",workers)
                res.writeHead(201,options)
                res.end(JSON.stringify({
                    "message":"changes have been saved"
                }))
                return
                }
                res.writeHead(400,options)
                res.end(JSON.stringify({
                    "message":" not found"
                }))
                return
            })
           })
        }
    }
    if(req.method=="DELETE"){
        const marketUrl=req.url.split("/")[1]
        const marketId=req.url.split("/")[2]
        const branchesUrl=req.url.split("/")[1]
        const branchId=req.url.split("/")[2]
        const workersUrl=req.url.split("/")[1]
        const workerId=req.url.split("/")[2]
        if(marketUrl=="markets" && marketId){
            const {access_token}=req.headers
                if(!access_token){
                res.writeHead(400,options)
                res.end(JSON.stringify({
                message:"Provide with access token"
                }))
                return
            }
            jwt.verify(access_token,process.env.SECRET_KEY,async(err,decode)=>{
                if(err instanceof jwt.JsonWebTokenError){
                    res.writeHead(401,options)
                    res.end(JSON.stringify({
                        message:"Invalid token"
                    })) 
                    return
                }
                const allMarkets=read("markets.json")
                const foundMarket=allMarkets.find(item=>item.id==marketId)
                if(foundMarket){
                    const markets=allMarkets.filter(item=>item.id!=marketId)
                await write("markets.json",markets)
                res.writeHead(201,options)
                res.end(JSON.stringify({
                    "message":"market deleted"
                }))
                return
                }
                res.writeHead(400,options)
                res.end(JSON.stringify({
                    "message":"market not found"
                }))
                return
            })
            return
        }
        if(branchesUrl=="branches" && branchId){
            const {access_token}=req.headers
                if(!access_token){
                res.writeHead(400,options)
                res.end(JSON.stringify({
                message:"Provide with access token"
                }))
                return
            }
            jwt.verify(access_token,process.env.SECRET_KEY,async(err,decode)=>{
                if(err instanceof jwt.JsonWebTokenError){
                    res.writeHead(401,options)
                    res.end(JSON.stringify({
                        message:"Invalid token"
                    })) 
                    return
                }
                const branches=read("branches.json")
                const foundBranch=branches.find(item=>item.id==branchId)
                if(foundBranch){
                    const newBranches=branches.filter(item=>item.id!=branchId)
                await write("branches.json",newBranches)
                res.writeHead(201,options)
                res.end(JSON.stringify({
                    "message":"branch has been deleted"
                }))
                return
                }
                res.writeHead(400,options)
                res.end(JSON.stringify({
                    "message":"branch not found"
                }))
                return
            })
            return
        }
        if(workersUrl=="worker" && workerId){
            const {access_token}=req.headers
                if(!access_token){
                res.writeHead(400,options)
                res.end(JSON.stringify({
                message:"Provide with access token"
                }))
                return
            }
            jwt.verify(access_token,process.env.SECRET_KEY,async(err,decode)=>{
                if(err instanceof jwt.JsonWebTokenError){
                    res.writeHead(401,options)
                    res.end(JSON.stringify({
                        message:"Invalid token"
                    })) 
                    return
                }
                const workers=read("workers.json")
                const foundWorker=workers.find(item=>item.id==workerId)
                if(foundWorker){
                    const newWorkers=workers.filter(item=>item.id!=workerId)
                await write("workers.json",newWorkers)
                res.writeHead(201,options)
                res.end(JSON.stringify({
                    "message":"worker has been deleted"
                }))
                return
                }
                res.writeHead(400,options)
                res.end(JSON.stringify({
                    "message":"worker not found"
                }))
                return
            })
            return
        }
        else{
            res.end("DELETE")
        }
    }
})
.listen(8080,console.log("hello from the server"))