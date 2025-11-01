const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vybtxro.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

     const db = client.db('smart_db')
    const productsCollections = db.collection('products')
    const bidsCollections = db.collection('bids')
    const usersCollections = db.collection('users')
// users api
    app.post('/users',async(req,res)=>{
        const newUser = req.body;
        const email = req.body.email;
        const query = {email : email}
        const existingUser = await usersCollections.findOne(query);
        if(existingUser){
            res.send({message : 'users already exist. do not ned to insert'})
        }
        else{

            const result = await usersCollections.insertOne(newUser);
            res.send(result)
        }
    })

// product api
    app.get('/products',async(req,res)=>{
        // const projectsFields = {title :1, price_min : 1, price_max : 1,image : 1 }
        // const cursor = productsCollections.find().sort({price_min : -1}).skip(2).limit(2).project(projectsFields);

        // console.log(req.query)
        const email = req.query.email;
        const query = {}
        if(email){
            query.email = email;
        }

        const cursor = productsCollections.find(query)
        const result = await cursor.toArray();
        res.send(result)
    })

    app.get('/latest-products',async(req,res)=>{
        const cursor = productsCollections.find().sort({created_at : -1}).limit(6);
        const result = await cursor.toArray();
        res.send(result)
    })

    app.get('/products/:id',async(req,res)=>{
        const id = req.params.id;
        console.log(id);
        const query = {_id : id}
        const result = await productsCollections.findOne(query);
        res.send(result)
    })

    app.get('/products/bids/:productId',async(req,res)=>{
        const productId = req.params.productId;
        const query = {product : productId};
        const cursor = bidsCollections.find(query).sort({bid_price : -1});
        const result = await cursor.toArray();
        res.send(result)


    })

    app.post('/products',async(req,res)=>{
        const newProduct = req.body;
        const result = await productsCollections.insertOne(newProduct);
        res.send(result);
    })

    app.patch('/products/:id',async(req,res)=>{
        const id = req.params.id;
        const updatedProduct = req.body; 
        const query = {_id : new ObjectId(id)};
        const update = {
            $set : {
                name : updatedProduct.name,
                price : updatedProduct.price
            }
        }
        const result = await productsCollections.updateOne(query,update )
        res.send(result)
    })

    app.delete('/products/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result = productsCollections.deleteOne(query);
        res.send(result);
    })

    // bids related api

    app.get('/bids',async(req,res)=>{
        const email = req.query.email;
        const query = {};
        if(email){
            query.buyer_email = email;
        }

        const cursor = bidsCollections.find(query);
        const result = await cursor.toArray();
        res.send(result)
    })

    // app.get('/bids/byProduct/:product',async(req,res)=>{

    // })

    app.post('/bids',async(req,res)=>{
        const newBid = req.body;
        const result = await bidsCollections.insertOne(newBid);
        res.send(result);
    })

    app.delete('/bids/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result = await bidsCollections.deleteOne(query);
        res.send(result);
    })
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
       // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('smart server is running')
})

app.listen(port, ()=>{
    console.log(`smart server is running port ${port}`)
})