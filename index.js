const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sv8l1qb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const toyCollection = client.db("toyCar").collection("cars");
    const imageGallery = client.db("toyCar").collection("imageGallery");
    const newInShop = client.db("toyCar").collection("newInShop");
    const blogs = client.db("toyCar").collection("blogs");

    // blogs data 
    app.get('/blogs', async(req, res)=>{
      const result= await blogs.find().toArray();
      res.send(result)
    })


    app.post('/cars', async (req, res) => {
      const cars = req.body;
      const result = await toyCollection.insertOne(cars);
      res.send(result)

    })

    app.get('/newinshop', async (req, res) => {
      const result = await newInShop.find().toArray()
      res.send(result)
    })

    app.get('/images', async (req, res) => {
      const result = await imageGallery.find().toArray();
      res.send(result)
    })


    app.get('/cars', async (req, res) => {
      const result = await toyCollection.find().toArray();
      res.send(result)
    })

    //get data with limit 20

    app.get('/carsLimit', async (req, res) => {
      const result = await toyCollection.find().limit(20).toArray();
      res.send(result)
    })

    app.get('/details/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query)
      res.send(result);
    })

    app.get('/search', async (req, res) => {
      const categoryName = req.query.category;
      const result = await toyCollection.find({ category: categoryName }).toArray();
      res.send(result)
    })
// get data with short and user email 
    app.get('/userCas', async (req, res) => {
      const email = req.query.sellerEmail;
      const sort = req.query.sort;
      let sortOrder = 1;
      if (sort === 'descending') {
        sortOrder = -1; //descending order
      }
      const result = await toyCollection.find({ sellerEmail: email }).sort({ price: sortOrder }).toArray();
      res.send(result)
    })

    //search by toy name
    app.post('/search', async (req, res) => {
      const { toyName } = req.body;
      console.log({ toyName });
      const result = await toyCollection.find({ toyName: { $regex: toyName, $options: 'i' } }).toArray();
      res.send(result)
    })


    app.put('/cars/:id', async (req, res) => {

      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateToyInfo = req.body;
      const updateDoc = {
        $set: {
          price: updateToyInfo.price,
          quantity: updateToyInfo.quantity,
          description: updateToyInfo.description
        }
      }
      const result = await toyCollection.updateOne(filter, updateDoc);
      res.send(result)
    })

    app.delete('/cars/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.deleteOne(query);
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('car-craze server is running')
})


app.listen(port, () => {
  console.log(`car-craze server is running on port ${port}`);
})