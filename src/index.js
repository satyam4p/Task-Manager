const express =  require('express');
require("./db/mongoose");
const app = express();
const User = require('./models/users'); 
const Task = require('./models/tasks');
const userRouter = require('./routers/users');
const taskRouter = require('./routers/tasks');
const port = process.env.PORT

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port,()=>{
    console.log(`server running on port ${port}`);
})
