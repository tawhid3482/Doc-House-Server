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
    const usersCollection = client.db("docDb").collection("users");

    // jwt
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    // middleWare for jwt
    const verifyToken = (req, res, next) => {
      // console.log(req.headers);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "unauthorized access" });
      }
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "unauthorized access" });
        }
        req.decoded = decoded;
        next();
      });
    };
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === "admin";
      if (!isAdmin) {
        return res.status(401).send({ message: "forbidden access" });
      }
      next();
    };

    // users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser)
        return res.send({ message: "user already exists", insertedId: null });
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users",  async (req, res) => {
      const result = await usersCollection.find().toArray();
      // console.log(req.headers);
      res.send(result);
    });

    app.get("/users/admin/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin });
    });

    app.delete("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    app.patch(
      "/users/admin/:id",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            role: "admin",
          },
        };
        const result = await usersCollection.updateOne(query, updatedDoc);
        res.send(result);
      }
    );



    app.get("/doctors", verifyToken, async (req, res) => {
      const result = await doctorsCollection.find().toArray();
      res.send(result);
    });
    app.post("/doctors",async(req,res)=>{
      const doc = req.body;
      const result = await doctorsCollection.insertOne(doc)
      res.send(result)
    })

    app.delete("/doctors/:id", verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await doctorsCollection.deleteOne(query);
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

    app.delete("/service/:id", verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      res.send(result);
    });



    app.get("/srProducts", async (req, res) => {
      const result = await srProductsCollection.find().toArray();
      res.send(result);
    });
    
    app.delete("/srProducts/:id",  async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await srProductsCollection.deleteOne(query);
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
