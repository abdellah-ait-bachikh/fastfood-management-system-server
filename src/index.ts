import express, { Request, Response } from "express";
const app = express();

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "hello world" });
});

const port = 5000;


export const startServer =()=>{
app.listen(port, () => {
  console.log(`server raning in port ${port}`);
});
}
startServer()