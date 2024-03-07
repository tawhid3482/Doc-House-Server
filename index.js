const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s64u1mi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const doctorsCollection = client.db("docDb").collection("doctors");
    const feedbackCollection = client.db("docDb").collection("feedback");
    const serviceCollection = client.db("docDb").collection("service");
    const srProductsCollection = client.db("docDb").collection("srProducts");
    const appointmentCollection = client.db("docDb").collection("appointment");

    app.get("/doctors", async (req, res) => {
      const result = await doctorsCollection.find().toArray();
      res.send(result);
    });
    app.get("/feedback", async (req, res) => {
      const result = await feedbackCollection.find().toArray();
      res.send(result);
    });
    app.get("/service", async (req, res) => {
      const result = await serviceCollection.find().toArray();
      res.send(result);
    });
    app.get("/srProducts", async (req, res) => {
      const result = await srProductsCollection.find().toArray();
      res.send(result);
    });
    app.get("/srProducts/:service", async (req, res) => {
      const service = req.params.service
      const query = {service:service}
      const result = await srProductsCollection.find(query).toArray();
      res.send(result);
    });

    app.get('/appointment',async(req,res)=>{
      const result = await appointmentCollection.find().toArray()
      res.send(result)
    })

    app.post('/appointment',async(req,res)=>{
      const appointmentItem = req.body;
      const result = await appointmentCollection.insertOne(appointmentItem)
      res.send(result)
    })
    app.delete('/appointment/:id',async(req,res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await appointmentCollection.deleteOne(query)
      res.send(result)

    })

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// basic-code
app.get("/", (req, res) => {
  res.send("doc-house is running");
});
app.listen(port, () => {
  console.log(`doc is running ${port}`);
});
